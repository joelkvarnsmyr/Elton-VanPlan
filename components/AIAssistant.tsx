
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { streamGeminiResponse } from '../services/geminiService';
import { Send, User, Trash2, Car, Video, ArrowLeft, Wrench, ShoppingBag, CheckSquare } from 'lucide-react';
import { Task, ShoppingItem, VehicleData } from '../types';
import { LiveElton } from './LiveElton';

interface AIAssistantProps {
    vehicleData: VehicleData;
    tasks: Task[];
    shoppingItems?: ShoppingItem[];
    onAddTask?: (tasks: Task[]) => void;
    onUpdateTask?: (task: Task) => void;
    onDeleteTask?: (taskId: string) => void;
    onAddShoppingItem?: (item: ShoppingItem) => void;
    onUpdateShoppingItem?: (item: ShoppingItem) => void;
    onDeleteShoppingItem?: (itemId: string) => void;
    onClose?: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ 
    vehicleData,
    tasks, 
    shoppingItems = [], 
    onAddTask, 
    onUpdateTask, 
    onDeleteTask,
    onAddShoppingItem, 
    onUpdateShoppingItem, 
    onDeleteShoppingItem,
    onClose 
}) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load history from local storage on mount (scoped to vehicle regNo preferably in future)
  useEffect(() => {
    const saved = localStorage.getItem(`elton-chat-${vehicleData.regNo}`);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        setInitialMessage();
      }
    } else {
      setInitialMessage();
    }
  }, [vehicleData.regNo]);

  // Save to local storage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`elton-chat-${vehicleData.regNo}`, JSON.stringify(messages));
    }
  }, [messages, vehicleData.regNo]);

  const setInitialMessage = () => {
    setMessages([
        { role: 'model', content: `Hallå där! 🚐💨 Det är jag som är ${vehicleData.model}. Vad ska vi hitta på?` }
      ]);
  };

  const clearHistory = () => {
    if (window.confirm("Vill du glömma vår konversation?")) {
        localStorage.removeItem(`elton-chat-${vehicleData.regNo}`);
        setInitialMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleToolCalls = async (toolCalls: any[]) => {
      if (!toolCalls || toolCalls.length === 0) return [];
      
      const results = [];
      for (const call of toolCalls) {
          console.log("Executing tool:", call.name, call.args);
          try {
              if (call.name === 'addTask' && onAddTask) {
                  const newTasks = Array.isArray(call.args.tasks) ? call.args.tasks : [call.args];
                  onAddTask(newTasks);
                  results.push({ id: call.id, result: `Added ${newTasks.length} tasks successfully.` });
              } else if (call.name === 'addShoppingItem' && onAddShoppingItem) {
                  const items = Array.isArray(call.args.items) ? call.args.items : [call.args];
                  items.forEach((i: any) => onAddShoppingItem(i));
                  results.push({ id: call.id, result: `Added ${items.length} shopping items.` });
              } else if (call.name === 'updateTaskStatus' && onUpdateTask) {
                  const task = tasks.find(t => t.id === call.args.taskId || t.title.toLowerCase().includes(call.args.taskId.toLowerCase()));
                  if (task) {
                      onUpdateTask({ ...task, status: call.args.status });
                      results.push({ id: call.id, result: `Updated task "${task.title}" to ${call.args.status}.` });
                  } else {
                      results.push({ id: call.id, result: "Task not found." });
                  }
              } else {
                  results.push({ id: call.id, result: "Tool not implemented or supported in this context." });
              }
          } catch (e) {
              console.error("Tool execution failed:", e);
              results.push({ id: call.id, result: "Error executing tool." });
          }
      }
      return results;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    let fullResponse = '';
    setMessages(prev => [...prev, { role: 'model', content: '' }]);

    await streamGeminiResponse(
        messages, 
        userMsg, 
        vehicleData,
        tasks,
        shoppingItems,
        (chunk) => {
            fullResponse += chunk;
            setMessages(prev => {
                const newHistory = [...prev];
                newHistory[newHistory.length - 1].content = fullResponse;
                return newHistory;
            });
        },
        handleToolCalls
    );

    setIsLoading(false);
  };

  if (isLiveMode) {
      return <LiveElton onClose={() => setIsLiveMode(false)} />;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white dark:bg-nordic-dark-surface rounded-2xl border border-slate-200 dark:border-nordic-dark-bg shadow-sm overflow-hidden animate-fade-in">
      <div className="bg-gradient-to-r from-nordic-ice to-white dark:from-nordic-charcoal dark:to-nordic-dark-surface p-4 border-b border-slate-100 dark:border-nordic-dark-bg flex items-center justify-between">
        <div className="flex items-center space-x-3">
            {onClose && (
                <button onClick={onClose} className="p-2 -ml-2 text-slate-500 hover:bg-black/5 rounded-full md:hidden">
                    <ArrowLeft size={20} />
                </button>
            )}
            <div className="p-2 bg-white dark:bg-nordic-dark-bg rounded-lg shadow-sm text-teal-600">
            <Car size={24} />
            </div>
            <div>
            <h3 className="font-serif font-semibold text-nordic-charcoal dark:text-nordic-ice">{vehicleData.make} {vehicleData.model}</h3>
            <p className="text-xs text-slate-500 dark:text-nordic-dark-muted">{vehicleData.year}</p>
            </div>
        </div>
        <div className="flex gap-2">
            <button 
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

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-nordic-dark-bg/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border border-white/20 shadow-sm ${
                msg.role === 'user' ? 'bg-nordic-charcoal text-white' : 'bg-nordic-beige text-amber-900'
              }`}>
                {msg.role === 'user' ? <User size={14} /> : <Car size={16} />}
              </div>
              <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-nordic-charcoal dark:bg-teal-600 text-white rounded-br-none' 
                  : 'bg-white dark:bg-nordic-dark-surface text-slate-700 dark:text-nordic-dark-text border border-slate-100 dark:border-nordic-charcoal rounded-bl-none'
              }`}>
                 {msg.role === 'user' ? (
                     <p>{msg.content}</p>
                 ) : (
                     <ReactMarkdown 
                        className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0"
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
                 )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white dark:bg-nordic-dark-surface border-t border-slate-100 dark:border-nordic-dark-bg">
        <div className="flex space-x-2 relative">
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
            disabled={!input.trim() || isLoading}
            className="bg-nordic-charcoal dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-700 disabled:bg-slate-300 dark:disabled:bg-nordic-charcoal text-white p-3 rounded-xl transition-colors shadow-sm"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
