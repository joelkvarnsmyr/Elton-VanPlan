import React, { useState, useEffect, useRef } from 'react';
import { ChatContext, ContextualChatMessage, ShoppingItem, Task, VendorOption } from '@/types/types';
import { MessageCircle, X, Loader2, Sparkles, Plus, Send, Wrench } from 'lucide-react';
import { generateText } from '@/services/aiService';
import { addVehicleHistoryEvent, addMileageReading, updateInspectionFinding, addTask } from '@/services/db';

interface ContextualChatProps {
    context: ChatContext;
    projectId: string; // Added prop
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

const INSPECTION_QUICK_ACTIONS = [
    'Hur åtgärdar jag detta?',
    'Vad kostar det att fixa?',
    'Är detta kritiskt?',
    'Vilka delar behöver jag?'
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
- Hjälp användaren hitta lägsta pris och bäst lämpade produkt oavsett butik
- ANVÄND SÖKVERKTYG aktivt för att hitta dagsfärska priser och lagerstatus på svenska webbutiker
- Föreslå fritt bland alla relevanta återförsäljare (t.ex. Amazon, Trodo, Skruvat, specialbutiker, lågprisvaruhus)
- Begränsa dig INTE till specifika kedjor - prioritera rätt produkt till rätt pris
- Var specifik med artikelnummer och ungefärliga priser när möjligt
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
      "inStock": true,
      "url": "https://www.biltema.se/..."
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
- Svara alltid på SVENSKA

${context.availablePhases && context.availablePhases.length > 0 ? `
NUVARANDE FASER I PROJEKTET:
${context.availablePhases.map(p => `- ${p}`).join('\n')}
(Använd dessa exakta namn om du ska flytta uppgifter, eller föreslå en ny om det behövs)
` : ''}`;
}

// Build system prompt for inspection context
function buildInspectionPrompt(context: ChatContext): string {
    const { inspectionFinding, inspectionArea, vehicleData, userSkillLevel } = context;
    if (!inspectionFinding) return '';

    return `Du är ELTON, en svensk fordonsteknisk AI-assistent. Du hjälper användaren att analysera och åtgärda en anmärkning från fordonsbesiktningen.

INSPEKTIONSANMÄRKNING:
- Typ: ${inspectionFinding.type}
- Beskrivning: ${inspectionFinding.description}
- Område: ${inspectionArea?.name || 'Okänt'}
- Allvarlighetsgrad: ${inspectionFinding.severity}
- Position: ${inspectionFinding.position || 'Ej specificerad'}
${inspectionFinding.action ? `- Föreslagen åtgärd: ${inspectionFinding.action}` : ''}

FORDON:
- ${vehicleData.make} ${vehicleData.model} (${vehicleData.year})
- Motor: ${vehicleData.engine?.code || 'Okänd'}

ANVÄNDARE:
- Skill level: ${userSkillLevel || 'intermediate'}

INSTRUKTIONER:
- Förklara varför detta är ett problem
- Ge en steg-för-steg plan för att åtgärda det
- Uppskatta kostnad och tidsåtgång
- Föreslå reservdelar om det behövs
- Om det är "CRITICAL": Varna för säkerhetsrisker
- Svara alltid på SVENSKA
`;
}

export const ContextualChat: React.FC<ContextualChatProps> = ({
    context,
    projectId,
    onClose,
    onUpdateItem,
    onUpdateTask
}) => {
    const [messages, setMessages] = useState<ContextualChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [proposedOptions, setProposedOptions] = useState<VendorOption[] | null>(null);
    const [isDiscussionMode, setIsDiscussionMode] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const quickActions = context.type === 'shopping_item'
        ? SHOPPING_QUICK_ACTIONS
        : context.type === 'task'
            ? TASK_QUICK_ACTIONS
            : INSPECTION_QUICK_ACTIONS;

    const contextTitle = context.type === 'shopping_item'
        ? context.item?.name
        : context.type === 'task'
            ? context.task?.title
            : context.inspectionFinding?.type;

    const systemPrompt = context.type === 'shopping_item'
        ? buildShoppingItemPrompt(context)
        : context.type === 'task'
            ? buildTaskPrompt(context)
            : buildInspectionPrompt(context);

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
                : context.type === 'task'
                    ? `Hej! Jag kan hjälpa dig med uppgiften **"${context.task?.title}"**. Vill du ha tips på hur du tar dig an detta, eller har du specifika frågor?`
                    : `Hej! Jag ser att du har en anmärkning på **"${context.inspectionFinding?.type}"**. Vill du veta hur du fixar detta eller vad det kostar?`,
            timestamp: new Date().toISOString()
        };
        setMessages([welcomeMessage]);
    }, [context]);

    const handleSend = async (message: string) => {
        if (!message.trim() || isLoading) return;

        // Add user message to UI
        const userMessage: ContextualChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInputValue('');
        setIsLoading(true);

        try {
            // Build conversation history string for stateless AI
            // This is a workaround until aiService supports history objects
            const historyContext = newMessages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
            const fullPrompt = `${historyContext}\n\n(Respond to the last message, using tools if necessary)`;

            const aiResponse = await generateText(systemPrompt, fullPrompt, {
                disableTools: isDiscussionMode
            });
            const responseText = aiResponse.data;

            // Handle Tool Calls
            if (aiResponse.functionCalls && aiResponse.functionCalls.length > 0) {
                // Use passed projectId
                // const projectId = 'Elton-VanPlan'; 

                for (const call of aiResponse.functionCalls) {
                    let toolResult = '';
                    try {
                        if (call.name === 'addVehicleHistoryEvent') {
                            await addVehicleHistoryEvent(projectId, call.args);
                            toolResult = `Successfully added history event: ${call.args.title}`;
                        } else if (call.name === 'addMileageReading') {
                            await addMileageReading(projectId, call.args);
                            toolResult = `Successfully added mileage: ${call.args.mileage} mil`;
                        } else if (call.name === 'updateInspectionFinding') {
                            await updateInspectionFinding(projectId, call.args.findingId, {
                                status: call.args.newStatus as any,
                                resolutionNotes: call.args.feedback || call.args.resolutionNotes
                            });
                            toolResult = `Successfully updated finding ${call.args.findingId}`;
                        } else if (call.name === 'addTask') {
                            await addTask(projectId, {
                                ...call.args,
                                status: 'Ej påbörjad',
                                created: new Date().toISOString(),
                                updated: new Date().toISOString()
                            });
                            toolResult = `Successfully added task: ${call.args.title}`;
                        } else {
                            toolResult = `Unknown tool: ${call.name}`;
                        }
                    } catch (e: any) {
                        console.error('Tool execution failed:', e);
                        toolResult = `Error executing ${call.name}: ${e.message}`;
                    }

                    // Add system message about tool result
                    const toolMessage: ContextualChatMessage = {
                        id: `tool-${Date.now()}`,
                        role: 'model', // Using model role to show it in chat
                        content: `🛠️ ${toolResult}`,
                        timestamp: new Date().toISOString()
                    };
                    setMessages(prev => [...prev, toolMessage]);
                }
                // Determine if we should generate a new text response after tool use?
                // Ideally yes, but for now we let the tool result stand or user can follow up.
                // Or we could trigger another generateText calls with the result included.
            }


            // Parse JSON if present (for vendor options)
            const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch) {
                try {
                    const data = JSON.parse(jsonMatch[1]);
                    if (data.newOptions && Array.isArray(data.newOptions)) {
                        const enrichedOptions = data.newOptions.map((opt: any) => ({
                            id: `vendor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            store: opt.store || 'Okänd butik',
                            articleNumber: opt.articleNumber || '',
                            price: opt.price || 0,
                            shippingCost: opt.shippingCost || 0,
                            totalCost: (opt.price || 0) + (opt.shippingCost || 0),
                            currency: 'SEK',
                            deliveryTimeDays: opt.deliveryTimeDays || (opt.shippingCost === 0 ? 0 : 3),
                            inStock: opt.inStock !== false,
                            shelfLocation: opt.shelfLocation || '',
                            url: opt.url || '',
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
                            {isDiscussionMode ? <MessageCircle size={20} className="text-white" /> : <Wrench size={20} className="text-white" />}
                        </div>
                        <div>
                            <h3 className="font-bold text-white flex items-center gap-2">
                                ELTON Chat
                                <button
                                    onClick={() => setIsDiscussionMode(!isDiscussionMode)}
                                    className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 transition-colors ml-2 border border-white/30"
                                >
                                    {isDiscussionMode ? 'Diskussionsläge' : 'Verkstadsläge'}
                                </button>
                            </h3>
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
                {!isDiscussionMode && messages.length <= 1 && (
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
                            placeholder={isDiscussionMode ? "Diskutera med Elton..." : "Beskriv vad du behöver hjälp med..."}
                            className={`flex-1 rounded-full px-4 py-3 text-sm outline-none focus:ring-2 transition-all 
                                ${isDiscussionMode
                                    ? 'bg-indigo-50 text-indigo-900 placeholder-indigo-400 focus:ring-indigo-500/50'
                                    : 'bg-slate-100 text-slate-800 focus:ring-blue-500/50'}`}
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
