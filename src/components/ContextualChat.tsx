import React, { useState, useRef, useEffect } from 'react';
import { ChatContext, ContextualChatMessage, ShoppingItem, Task, VendorOption } from '@/types/types';
import { X, Send, MessageCircle, Sparkles, Loader2, CheckCircle, Plus } from 'lucide-react';
import { generateText } from '@/services/aiService';

interface ContextualChatProps {
    context: ChatContext;
    onClose: () => void;
    onUpdateItem?: (item: ShoppingItem) => void;
    onUpdateTask?: (task: Task) => void;
}

// Quick actions for different context types
const SHOPPING_QUICK_ACTIONS = [
    'Jämför priser mellan butiker',
    'Finns detta på Biltema?',
    'Hitta billigare alternativ',
    'Vilken kvalitet ska jag välja?'
];

const TASK_QUICK_ACTIONS = [
    'Kan jag göra detta själv?',
    'Vilka verktyg behöver jag?',
    'Hur lång tid tar detta?',
    'Vad kan gå fel?'
];

// Build system prompt for shopping item context
function buildShoppingItemPrompt(context: ChatContext): string {
    const { item, vehicleData, relatedTasks } = context;
    if (!item) return '';

    const linkedTask = relatedTasks?.find(t => t.id === item.linkedTaskId);

    return `Du är ELTON, en svensk fordonsteknisk AI-assistent. Du hjälper användaren med en specifik inköpsitem.

PRODUKT:
- Namn: ${item.name}
- Kategori: ${item.category}
- Estimerat pris: ${item.estimatedCost} kr
- Antal: ${item.quantity}
${item.linkedTaskId ? `- Kopplad till uppgift: "${linkedTask?.title}"` : ''}

${item.options && item.options.length > 0 ? `
NUVARANDE ALTERNATIV:
${item.options.map(opt => `- ${opt.store}: ${opt.price} kr + ${opt.shippingCost} kr frakt = ${opt.totalCost} kr ${opt.inStock ? '(I lager)' : '(Ej i lager)'}`).join('\n')}
` : 'Inga alternativ tillagda ännu.'}

FORDON:
- ${vehicleData.make} ${vehicleData.model} (${vehicleData.year})
- Motor: ${vehicleData.engine?.code || 'Okänd'}
${vehicleData.vin ? `- VIN: ${vehicleData.vin}` : ''}

INSTRUKTIONER:
- Hjälp användaren hitta bättre priser eller alternativ
- Föreslå konkreta butiker: Biltema, Jula, Mekonomen, Autodoc
- Var specifik med artikelnummer och priser när möjligt
- Svara alltid på SVENSKA

OM ANVÄNDAREN BER OM PRISJÄMFÖRELSE:
Ge en mänsklig förklaring följt av strukturerad data i detta format:

\`\`\`json
{
  "newOptions": [
    {
      "store": "Biltema",
      "price": 450,
      "shippingCost": 0,
      "articleNumber": "80-XXX",
      "shelfLocation": "Gång X, Hylla Y",
      "inStock": true
    }
  ]
}
\`\`\``;
}

// Build system prompt for task context
function buildTaskPrompt(context: ChatContext): string {
    const { task, vehicleData, relatedItems, userSkillLevel } = context;
    if (!task) return '';

    return `Du är ELTON, en svensk fordonsteknisk AI-assistent. Du hjälper användaren med en specifik uppgift.

UPPGIFT:
- Titel: ${task.title}
- Beskrivning: ${task.description || 'Ingen beskrivning'}
- Fas: ${task.phase}
- Svårighetsgrad: ${task.difficultyLevel || 'Medium'}
- Status: ${task.status}
${task.estimatedCostMin || task.estimatedCostMax ? `- Budget: ${task.estimatedCostMin}-${task.estimatedCostMax} kr` : ''}

${relatedItems && relatedItems.length > 0 ? `
RELATERADE INKÖP:
${relatedItems.map(i => `- ${i.name} (${i.estimatedCost} kr) ${i.checked ? '✓ Köpt' : ''}`).join('\n')}
` : ''}

FORDON:
- ${vehicleData.make} ${vehicleData.model} (${vehicleData.year})
- Motor: ${vehicleData.engine?.code || 'Okänd'}

ANVÄNDARE:
- Skill level: ${userSkillLevel || 'intermediate'}

INSTRUKTIONER:
- Anpassa dina svar till användarens kunskapsnivå
- Om beginner: förenkla, föreslå verkstad för svåra jobb
- Om expert: ge tekniska detaljer
- Föreslå verktyg och material om det behövs
- Svara alltid på SVENSKA`;
}

export const ContextualChat: React.FC<ContextualChatProps> = ({
    context,
    onClose,
    onUpdateItem,
    onUpdateTask
}) => {
    const [messages, setMessages] = useState<ContextualChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [proposedOptions, setProposedOptions] = useState<VendorOption[] | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const quickActions = context.type === 'shopping_item' ? SHOPPING_QUICK_ACTIONS : TASK_QUICK_ACTIONS;
    const contextTitle = context.type === 'shopping_item' ? context.item?.name : context.task?.title;
    const systemPrompt = context.type === 'shopping_item'
        ? buildShoppingItemPrompt(context)
        : buildTaskPrompt(context);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Add welcome message on mount
    useEffect(() => {
        const welcomeMessage: ContextualChatMessage = {
            id: 'welcome',
            role: 'model',
            content: context.type === 'shopping_item'
                ? `Hej! Jag kan hjälpa dig med **${context.item?.name}**. Vill du att jag jämför priser, hittar alternativ, eller har du någon specifik fråga?`
                : `Hej! Jag kan hjälpa dig med uppgiften **"${context.task?.title}"**. Vill du ha tips på hur du tar dig an detta, eller har du specifika frågor?`,
            timestamp: new Date().toISOString()
        };
        setMessages([welcomeMessage]);
    }, [context]);

    const handleSend = async (message: string) => {
        if (!message.trim() || isLoading) return;

        const userMessage: ContextualChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            // Build conversation history for AI
            const history = messages.map(m => ({
                role: m.role as 'user' | 'model',
                content: m.content
            }));

            const aiResponse = await generateText(systemPrompt, message);
            const responseText = aiResponse.data;

            // Parse JSON if present (for vendor options)
            const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch) {
                try {
                    const data = JSON.parse(jsonMatch[1]);
                    if (data.newOptions && Array.isArray(data.newOptions)) {
                        const enrichedOptions = data.newOptions.map((opt: any) => ({
                            id: `vendor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            store: opt.store,
                            articleNumber: opt.articleNumber,
                            price: opt.price || 0,
                            shippingCost: opt.shippingCost || 0,
                            totalCost: (opt.price || 0) + (opt.shippingCost || 0),
                            currency: 'SEK',
                            deliveryTimeDays: opt.deliveryTimeDays || (opt.shippingCost === 0 ? 0 : 3),
                            inStock: opt.inStock !== false,
                            shelfLocation: opt.shelfLocation,
                            url: opt.url,
                            lastPriceCheck: new Date().toISOString()
                        }));
                        setProposedOptions(enrichedOptions);
                    }
                } catch {
                    // JSON parse failed, ignore
                }
            }

            const modelMessage: ContextualChatMessage = {
                id: `model-${Date.now()}`,
                role: 'model',
                content: responseText,
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage: ContextualChatMessage = {
                id: `error-${Date.now()}`,
                role: 'model',
                content: 'Ursäkta, något gick fel. Försök igen.',
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApplyOptions = () => {
        if (proposedOptions && context.item && onUpdateItem) {
            const updatedItem: ShoppingItem = {
                ...context.item,
                options: [
                    ...(context.item.options || []),
                    ...proposedOptions
                ]
            };
            onUpdateItem(updatedItem);
            setProposedOptions(null);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
            <div className="w-full md:w-[480px] h-full bg-white flex flex-col animate-slide-in-right">
                {/* Header */}
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-full">
                            <MessageCircle size={20} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">ELTON Chat</h3>
                            <p className="text-sm text-white/80 truncate max-w-[280px]">
                                {contextTitle}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-full text-white transition-colors"
                        aria-label="Stäng chat"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                    {messages.map(msg => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-md'
                                    : 'bg-white text-slate-700 shadow-sm rounded-bl-md'
                                    }`}
                            >
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                                <Loader2 size={20} className="animate-spin text-blue-600" />
                            </div>
                        </div>
                    )}

                    {/* Proposed options banner */}
                    {proposedOptions && proposedOptions.length > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles size={16} className="text-green-600" />
                                <span className="font-bold text-green-800 text-sm">
                                    {proposedOptions.length} nya alternativ hittade!
                                </span>
                            </div>
                            <ul className="text-sm text-green-700 mb-3 space-y-1">
                                {proposedOptions.map(opt => (
                                    <li key={opt.id}>• {opt.store}: {opt.totalCost} kr</li>
                                ))}
                            </ul>
                            <button
                                onClick={handleApplyOptions}
                                className="w-full bg-green-600 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-green-700"
                            >
                                <Plus size={16} />
                                Lägg till i inköpslistan
                            </button>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                {messages.length <= 1 && (
                    <div className="px-4 py-3 border-t border-slate-200 bg-white">
                        <p className="text-xs text-slate-400 mb-2">Snabbfrågor:</p>
                        <div className="flex flex-wrap gap-2">
                            {quickActions.map(action => (
                                <button
                                    key={action}
                                    onClick={() => handleSend(action)}
                                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-xs text-slate-600 transition-colors"
                                >
                                    {action}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input */}
                <div className="p-4 border-t border-slate-200 bg-white">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSend(inputValue);
                        }}
                        className="flex items-center gap-2"
                    >
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Skriv ett meddelande..."
                            className="flex-1 bg-slate-100 rounded-full px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !inputValue.trim()}
                            className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Skicka meddelande"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContextualChat;
