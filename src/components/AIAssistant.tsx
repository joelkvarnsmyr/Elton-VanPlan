
import React, { useState, useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { streamChatMessage } from '@/services/firebaseAI';
import { getChatHistory, saveChatHistory, clearChatHistory, ChatMessage } from '@/services/db';
import { uploadChatImage } from '@/services/storage';
import { buildAIContext, getProjectStats } from '@/services/projectExportService';
import { Send, User, Trash2, Car, Video, ArrowLeft, Image as ImageIcon, X, AlertCircle } from 'lucide-react';
import { Task, ShoppingItem, VehicleData, Project, Contact } from '@/types/types';
import { LiveElton } from './LiveElton';

// Helper: Calculate string similarity (Levenshtein distance normalized to 0-1)
function levenshteinSimilarity(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,      // deletion
                matrix[i][j - 1] + 1,      // insertion
                matrix[i - 1][j - 1] + cost // substitution
            );
        }
    }

    const distance = matrix[len1][len2];
    const maxLen = Math.max(len1, len2);
    return maxLen === 0 ? 1 : 1 - (distance / maxLen);
}

interface AIAssistantProps {
    project: Project; // Changed: Now takes full project for complete context
    contacts?: Contact[]; // Optional contacts for local recommendations
    userSkillLevel?: 'beginner' | 'intermediate' | 'expert'; // User's mechanical skill level from profile
    onAddTask?: (tasks: Task[]) => void;
    onUpdateTask?: (task: Task) => void;
    onDeleteTask?: (taskId: string) => void;
    onAddShoppingItem?: (item: ShoppingItem) => void;
    onUpdateShoppingItem?: (item: ShoppingItem) => void;
    onDeleteShoppingItem?: (itemId: string) => void;
    onUpdateVehicleData?: (vehicleData: Partial<VehicleData>) => void;
    onClose?: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
    project,
    contacts = [],
    userSkillLevel,
    onAddTask,
    onUpdateTask,
    onDeleteTask,
    onAddShoppingItem,
    onUpdateShoppingItem,
    onDeleteShoppingItem,
    onUpdateVehicleData,
    onClose
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Build comprehensive AI context including ALL project data
  const projectContext = useMemo(() => buildAIContext(project, contacts), [project, contacts]);
  const projectStats = useMemo(() => getProjectStats(project), [project]);

  // Load history from Firestore on mount
  useEffect(() => {
    loadChatHistory();
  }, [project.id]);

  const loadChatHistory = async () => {
    try {
      const history = await getChatHistory(project.id);
      if (history.length > 0) {
        setMessages(history);
      } else {
        setInitialMessage();
      }
    } catch (e) {
      console.error('Failed to load chat history:', e);
      setError('Kunde inte ladda chatthistorik');
      setInitialMessage();
    }
  };

  // Save to Firestore whenever messages change (debounced)
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        saveChatHistory(project.id, messages).catch(e => {
          console.error('Failed to save chat history:', e);
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [messages, project.id]);

  const setInitialMessage = () => {
    // Use project name (custom nickname) if available, otherwise default to "AI Assistant"
    const aiName = project.name || 'AI Assistant';
    const initialMsg: ChatMessage = {
      role: 'model',
      content: `Hallå där! 🚐💨 Det är jag som är ${aiName}. Vad ska vi hitta på?`,
      timestamp: new Date().toISOString()
    };
    setMessages([initialMsg]);
  };

  const clearHistory = async () => {
    if (window.confirm("Vill du glömma vår konversation?")) {
      try {
        await clearChatHistory(project.id);
        setInitialMessage();
        setError(null);
      } catch (e) {
        console.error('Failed to clear chat history:', e);
        setError('Kunde inte radera chatthistorik');
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setSelectedImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleToolCalls = async (toolCalls: any[]) => {
      if (!toolCalls || toolCalls.length === 0) return [];

      const results = [];
      for (const call of toolCalls) {
          console.log("Executing tool:", call.name, call.args);
          try {
              if (call.name === 'addTask' && onAddTask) {
                  const newTasks = Array.isArray(call.args.tasks) ? call.args.tasks : [call.args];
                  onAddTask(newTasks);
                  results.push({ name: call.name, result: `Added ${newTasks.length} tasks successfully.` });
              } else if (call.name === 'updateTask' && onUpdateTask) {
                  const task = project.tasks.find(t =>
                      t.id === call.args.taskTitleKeywords ||
                      t.title.toLowerCase().includes(call.args.taskTitleKeywords.toLowerCase())
                  );
                  if (task) {
                      const updates: Partial<Task> = {};
                      if (call.args.newStatus) updates.status = call.args.newStatus;
                      if (call.args.newPriority) updates.priority = call.args.newPriority;
                      if (call.args.newSprint) updates.sprint = call.args.newSprint;
                      if (call.args.newTitle) updates.title = call.args.newTitle;
                      if (call.args.newDescription) updates.description = call.args.newDescription;
                      if (call.args.newCost) updates.estimatedCostMax = call.args.newCost;

                      onUpdateTask({ ...task, ...updates });
                      results.push({ name: call.name, result: `Updated task "${task.title}".` });
                  } else {
                      results.push({ name: call.name, result: `Task not found: "${call.args.taskTitleKeywords}"` });
                  }
              } else if (call.name === 'deleteTask' && onDeleteTask) {
                  const task = project.tasks.find(t =>
                      t.id === call.args.taskTitleKeywords ||
                      t.title.toLowerCase().includes(call.args.taskTitleKeywords.toLowerCase())
                  );
                  if (task) {
                      onDeleteTask(task.id);
                      results.push({ name: call.name, result: `Deleted task "${task.title}".` });
                  } else {
                      results.push({ name: call.name, result: `Task not found: "${call.args.taskTitleKeywords}"` });
                  }
              } else if (call.name === 'addToShoppingList' && onAddShoppingItem) {
                  onAddShoppingItem(call.args);
                  results.push({ name: call.name, result: `Added item to shopping list.` });
              } else if (call.name === 'registerPurchase' && onUpdateShoppingItem) {
                  const item = project.shoppingItems.find(i =>
                      i.name.toLowerCase().includes(call.args.itemNameKeywords.toLowerCase())
                  );
                  if (item) {
                      onUpdateShoppingItem({
                          ...item,
                          checked: true,
                          actualCost: call.args.actualCost,
                          store: call.args.store,
                          purchaseDate: call.args.date || new Date().toISOString().split('T')[0]
                      });
                      results.push({ name: call.name, result: `Registered purchase of "${item.name}".` });
                  } else {
                      results.push({ name: call.name, result: `Shopping item not found: "${call.args.itemNameKeywords}"` });
                  }
              } else if (call.name === 'updateShoppingItem' && onUpdateShoppingItem) {
                  const item = project.shoppingItems.find(i =>
                      i.name.toLowerCase().includes(call.args.itemNameKeywords.toLowerCase())
                  );
                  if (item) {
                      const updates: Partial<ShoppingItem> = {};
                      if (call.args.newName) updates.name = call.args.newName;
                      if (call.args.newQuantity) updates.quantity = call.args.newQuantity;
                      if (call.args.newCategory) updates.category = call.args.newCategory;
                      if (call.args.newCost) updates.estimatedCost = call.args.newCost;

                      onUpdateShoppingItem({ ...item, ...updates });
                      results.push({ name: call.name, result: `Updated shopping item "${item.name}".` });
                  } else {
                      results.push({ name: call.name, result: `Shopping item not found: "${call.args.itemNameKeywords}"` });
                  }
              } else if (call.name === 'deleteShoppingItem' && onDeleteShoppingItem) {
                  const item = project.shoppingItems.find(i =>
                      i.name.toLowerCase().includes(call.args.itemNameKeywords.toLowerCase())
                  );
                  if (item) {
                      onDeleteShoppingItem(item.id);
                      results.push({ name: call.name, result: `Deleted shopping item "${item.name}".` });
                  } else {
                      results.push({ name: call.name, result: `Shopping item not found: "${call.args.itemNameKeywords}"` });
                  }
              } else if (call.name === 'updateVehicleData' && onUpdateVehicleData) {
                  // Parse nested field paths (e.g., "engine.power" -> { engine: { power: value }})
                  const { field, value, reason } = call.args;
                  const fieldParts = field.split('.');

                  // Build nested update object
                  let update: any = {};
                  let current = update;
                  for (let i = 0; i < fieldParts.length - 1; i++) {
                      current[fieldParts[i]] = {};
                      current = current[fieldParts[i]];
                  }
                  current[fieldParts[fieldParts.length - 1]] = value;

                  onUpdateVehicleData(update);
                  results.push({
                      name: call.name,
                      result: `Updated vehicle data: ${field} = "${value}". Reason: ${reason}`
                  });
              } else if (call.name === 'searchSimilarTasks') {
                  const { proposedTitle, proposedDescription } = call.args;
                  const searchTerms = `${proposedTitle} ${proposedDescription}`.toLowerCase();

                  // Find similar tasks
                  const similarTasks = project.tasks.filter(t => {
                      const taskText = `${t.title} ${t.description || ''}`.toLowerCase();
                      // Simple similarity: check if any significant words overlap
                      const proposedWords = searchTerms.split(/\s+/).filter(w => w.length > 3);
                      const matches = proposedWords.filter(word => taskText.includes(word));
                      return matches.length >= 2; // At least 2 significant word matches
                  });

                  if (similarTasks.length > 0) {
                      const taskList = similarTasks.map(t => `- "${t.title}" (Status: ${t.status})`).join('\n');
                      results.push({
                          name: call.name,
                          result: `Found ${similarTasks.length} similar task(s):\n${taskList}\n\nConsider updating existing task instead of creating duplicate.`
                      });
                  } else {
                      results.push({
                          name: call.name,
                          result: 'No similar tasks found. Safe to add new task.'
                      });
                  }
              } else if (call.name === 'searchSimilarShoppingItems') {
                  const { proposedName, proposedCategory } = call.args;
                  const searchText = proposedName.toLowerCase();

                  // Find similar shopping items
                  const similarItems = project.shoppingItems.filter(item => {
                      const itemName = item.name.toLowerCase();
                      const categoryMatch = item.category === proposedCategory;
                      // Check for partial name match or very similar names
                      const nameMatch = itemName.includes(searchText) || searchText.includes(itemName) ||
                                       levenshteinSimilarity(itemName, searchText) > 0.6;
                      return categoryMatch && nameMatch;
                  });

                  if (similarItems.length > 0) {
                      const itemList = similarItems.map(i =>
                          `- "${i.name}" (${i.checked ? 'Köpt' : 'Att köpa'}${i.store ? ` från ${i.store}` : ''})`
                      ).join('\n');
                      results.push({
                          name: call.name,
                          result: `Found ${similarItems.length} similar item(s):\n${itemList}\n\nConsider updating existing item or adding as vendor option instead.`
                      });
                  } else {
                      results.push({
                          name: call.name,
                          result: 'No similar shopping items found. Safe to add new item.'
                      });
                  }
              } else {
                  results.push({ name: call.name, result: "Tool executed successfully." });
              }
          } catch (e: any) {
              console.error("Tool execution failed:", e);
              const errorMsg = `Error executing ${call.name}: ${e.message}`;
              results.push({ name: call.name, result: errorMsg });
              setError(errorMsg);
          }
      }
      return results;
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    setError(null);
    const userMsg = input;
    const userImageBase64 = selectedImage;

    setInput('');
    setSelectedImage(null);

    try {
        let imageUrl: string | undefined;

        // Upload image to Firebase Storage if present
        if (userImageBase64) {
            try {
                imageUrl = await uploadChatImage(userImageBase64, project.id);
            } catch (e) {
                console.error('Failed to upload image:', e);
                setError('Kunde inte ladda upp bild');
                // Continue without image
            }
        }

        // Optimistic UI update
        const userMessage: ChatMessage = {
            role: 'user',
            content: userMsg,
            imageUrl,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        let fullResponse = '';
        const assistantMessage: ChatMessage = {
            role: 'model',
            content: '',
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMessage]);

        // Convert ChatMessage format for Firebase AI Logic SDK
        const historyForAI = messages.map(m => ({
            role: m.role,
            content: m.content,
            image: m.imageUrl
        }));

        await streamChatMessage(
            historyForAI,
            userMsg,  // Send message directly (system instruction handles context)
            project.vehicleData,
            project.tasks,
            project.shoppingItems,
            (chunk) => {
                fullResponse += chunk;
                setMessages(prev => {
                    const newHistory = [...prev];
                    newHistory[newHistory.length - 1].content = fullResponse;
                    return newHistory;
                });
            },
            handleToolCalls,
            userImageBase64 ? userImageBase64.split(',')[1] : undefined,
            project.nickname || project.name,  // Pass nickname (or fallback to name) for vehicle personality
            userSkillLevel,  // Pass user skill level from profile for personalized responses
            project.type  // Pass project type for contextual advice
        );

    } catch (e: any) {
        console.error('Chat error:', e);
        setError(`Fel: ${e.message || 'Kunde inte skicka meddelande'}`);
    } finally {
        setIsLoading(false);
    }
  };

  if (isLiveMode) {
      return <LiveElton project={project} onClose={() => setIsLiveMode(false)} />;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white dark:bg-nordic-dark-surface rounded-2xl border border-slate-200 dark:border-nordic-dark-bg shadow-sm overflow-hidden animate-fade-in">
      <div className="bg-gradient-to-r from-nordic-ice to-white dark:from-nordic-charcoal dark:to-nordic-dark-surface p-4 border-b border-slate-100 dark:border-nordic-dark-bg flex items-center justify-between">
        <div className="flex items-center space-x-3">
            {onClose && (
                <button
                    onClick={onClose}
                    className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-nordic-dark-bg rounded-full transition-colors"
                    title="Tillbaka till dashboard"
                >
                    <ArrowLeft size={20} />
                </button>
            )}
            <div className="p-2 bg-white dark:bg-nordic-dark-bg rounded-lg shadow-sm text-teal-600">
            <Car size={24} />
            </div>
            <div>
            <h3 className="font-serif font-semibold text-nordic-charcoal dark:text-nordic-ice">{project.vehicleData.make} {project.vehicleData.model}</h3>
            <p className="text-xs text-slate-500 dark:text-nordic-dark-muted">{project.vehicleData.year}</p>
            </div>
        </div>
        <div className="flex gap-2">
            <button
                data-testid="ring-upp-button"
                onClick={() => setIsLiveMode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors shadow-sm animate-pulse"
            >
                <Video size={18} />
                <span className="text-xs font-bold hidden sm:inline">Ring upp</span>
            </button>
            <button
                onClick={clearHistory}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                title="Rensa historik"
            >
                <Trash2 size={18} />
            </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 p-3 flex items-center gap-2 text-red-700 dark:text-red-300">
            <AlertCircle size={18} />
            <span className="text-sm">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-800 rounded">
                <X size={16} />
            </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-nordic-dark-bg/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border border-white/20 shadow-sm ${
                msg.role === 'user' ? 'bg-nordic-charcoal text-white' : 'bg-nordic-beige text-amber-900'
              }`}>
                {msg.role === 'user' ? <User size={14} /> : <Car size={16} />}
              </div>
              <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm flex flex-col gap-2 ${
                msg.role === 'user'
                  ? 'bg-nordic-charcoal dark:bg-teal-600 text-white rounded-br-none'
                  : 'bg-white dark:bg-nordic-dark-surface text-slate-700 dark:text-nordic-dark-text border border-slate-100 dark:border-nordic-charcoal rounded-bl-none'
              }`}>
                 {msg.imageUrl && (
                     <img src={msg.imageUrl} alt="Uppladdad bild" className="rounded-lg max-w-full h-auto border border-white/20" />
                 )}
                 {msg.role === 'user' ? (
                     <p>{msg.content}</p>
                 ) : (
                     <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0">
                      <ReactMarkdown
                          components={{
                              h1: ({node, ...props}) => <h1 className="text-base font-bold text-nordic-charcoal dark:text-nordic-ice mt-2" {...props} />,
                              h2: ({node, ...props}) => <h2 className="text-sm font-bold text-teal-600 dark:text-teal-400 mt-2 uppercase tracking-wide" {...props} />,
                              h3: ({node, ...props}) => <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 mt-2" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc list-outside ml-4 space-y-1 my-2" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-4 space-y-1 my-2" {...props} />,
                              li: ({node, ...props}) => <li className="pl-1 marker:text-teal-500" {...props} />,
                              strong: ({node, ...props}) => <strong className="font-bold text-nordic-charcoal dark:text-white" {...props} />,
                              a: ({node, ...props}) => <a className="text-teal-600 hover:underline cursor-pointer font-medium" target="_blank" {...props} />,
                              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-teal-200 pl-3 italic text-slate-500 my-2" {...props} />,
                          }}
                       >
                          {msg.content}
                       </ReactMarkdown>
                    </div>
                 )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white dark:bg-nordic-dark-surface border-t border-slate-100 dark:border-nordic-dark-bg">
        {selectedImage && (
            <div className="flex items-center gap-2 mb-2 p-2 bg-slate-100 dark:bg-nordic-charcoal rounded-xl w-fit animate-fade-in">
                <img src={selectedImage} alt="Vald" className="w-10 h-10 object-cover rounded-lg" />
                <span className="text-xs text-slate-500 dark:text-slate-300">Bild redo att skickas</span>
                <button onClick={() => setSelectedImage(null)} className="p-1 hover:bg-slate-200 dark:hover:bg-nordic-dark-bg rounded-full">
                    <X size={14} />
                </button>
            </div>
        )}
        <div className="flex space-x-2 relative">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-slate-400 hover:text-teal-600 hover:bg-slate-50 dark:hover:bg-nordic-charcoal rounded-xl transition-colors"
          >
            <ImageIcon size={20} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageSelect}
          />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Säg något..."
            className="flex-1 bg-slate-50 dark:bg-nordic-dark-bg border border-slate-200 dark:border-nordic-charcoal text-slate-700 dark:text-nordic-ice text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={(!input.trim() && !selectedImage) || isLoading}
            className="bg-nordic-charcoal dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-700 disabled:bg-slate-300 dark:disabled:bg-nordic-charcoal text-white p-3 rounded-xl transition-colors shadow-sm"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
