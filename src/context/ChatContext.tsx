import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { generateText, generateWithImage } from '@/services/aiService';
import { Project, Task, GenericContext, ChatMessage, ShoppingItem, InspectionFinding, VehicleData } from '@/types/types';
import { useToasts } from '@/components/Toast';
import { buildAIContext } from '@/services/projectExportService';
import {
    addVehicleHistoryEvent,
    addMileageReading,
    updateInspectionFinding,
    addTask,
    saveChatHistory,
    getChatHistory
} from '@/services/db';
import { addPhaseToProject, updateProjectType, completeProjectSetup } from '@/services/projectSetupService';
import { DetailedInspectionFinding } from '@/types/types';

// Define the shape of our Chat Context
interface ChatContextType {
    messages: ChatMessage[];
    isLoading: boolean;
    currentContext: GenericContext;
    isLiveMode: boolean;
    isOpen: boolean;
    isDiscussionMode: boolean;

    // Actions
    sendMessage: (content: string, attachments?: File[]) => Promise<void>;
    setContext: (context: GenericContext) => void;
    toggleLiveMode: () => void;
    setIsOpen: (isOpen: boolean) => void;
    toggleDiscussionMode: () => void;
    clearHistory: () => void;

    // Project reference
    projectId?: string;
    setProjectId: (id: string) => void;
    projectData?: Project; // We need project data for context
    setProjectData: (project: Project) => void;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
    children: ReactNode;
    initialProjectId?: string;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children, initialProjectId }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentContext, setCurrentContext] = useState<GenericContext>({ type: 'project' });
    const [isLiveMode, setIsLiveMode] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isDiscussionMode, setIsDiscussionMode] = useState(false);
    const [projectId, setProjectId] = useState<string | undefined>(initialProjectId);
    const [projectData, setProjectData] = useState<Project | undefined>(undefined);
    const { error: showError } = useToasts();

    // Ref to keep track of latest messages for saving
    const messagesRef = useRef(messages);
    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    // Load history when projectId changes
    useEffect(() => {
        if (projectId) {
            loadHistory(projectId);
        }
    }, [projectId]);

    const loadHistory = async (id: string) => {
        try {
            const history = await getChatHistory(id);
            if (history && history.length > 0) {
                setMessages(history);
            } else {
                setMessages([{
                    id: 'welcome',
                    role: 'model',
                    content: 'Hej! Jag är Elton. Vad kan jag hjälpa dig med idag?',
                    timestamp: new Date().toISOString()
                }]);
            }
        } catch (e) {
            console.error("Failed to load history", e);
        }
    };

    // Save history periodically
    useEffect(() => {
        if (!projectId) return;

        const saveTimer = setTimeout(() => {
            if (messagesRef.current.length > 0) {
                saveChatHistory(projectId, messagesRef.current).catch(console.error);
            }
        }, 2000);

        return () => clearTimeout(saveTimer);
    }, [messages, projectId]);

    const sendMessage = useCallback(async (content: string, attachments: File[] = []) => {
        if (!content.trim() && attachments.length === 0) return;

        // 1. Add User Message
        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date().toISOString()
        };

        // Handle image attachments (simple display logic)
        if (attachments.length > 0) {
            // In a real app we would upload these and get URLs
            // For now we might read as base64 for the AI
            userMsg.content += " [Bild bifogad]";
        }

        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            // 2. Prepare Context & Prompt
            let systemPrompt = '';

            if (currentContext.type === 'project' && projectData) {
                const projectContext = buildAIContext(projectData);
                systemPrompt = `Du är Elton, en svensk fordonsexpert.\n\n${projectContext}`;
            } else if (currentContext.type === 'task' && currentContext.task && projectData) {
                systemPrompt = buildTaskPrompt(currentContext.task, projectData.vehicleData);
            } else if (currentContext.type === 'shopping' && currentContext.item && projectData) {
                systemPrompt = buildShoppingPrompt(currentContext.item, projectData.vehicleData);
            } else if (currentContext.type === 'inspection' && currentContext.finding && projectData) {
                systemPrompt = buildInspectionPrompt(currentContext.finding, projectData.vehicleData);
            } else {
                // Fallback
                systemPrompt = "Du är Elton, en hjälpsam AI-assistent för fordonsägare.";
            }

            // 3. Call AI
            let responseText = '';
            let functionCalls: any[] = [];

            if (attachments.length > 0) {
                // Vision API call
                const file = attachments[0];
                const reader = new FileReader();
                const base64Promise = new Promise<string>((resolve) => {
                    reader.onload = (e) => resolve(e.target?.result as string);
                    reader.readAsDataURL(file);
                });
                const base64 = await base64Promise;
                // Strip prefix
                const base64Data = base64.split(',')[1];

                responseText = await generateWithImage(content, base64Data);
            } else {
                // Text API call
                const response = await generateText(
                    systemPrompt + (isDiscussionMode ? "\n\nOBS: Diskussionsläge. Inga verktyg/ändringar tillåtna." : ""),
                    content,
                    { disableTools: isDiscussionMode }
                );

                if (!response.success) throw new Error("AI Request Failed");
                responseText = response.data;
                functionCalls = response.functionCalls || [];
            }

            // 4. Add AI Response
            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                content: responseText,
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, aiMsg]);

            // 5. Handle Tools
            if (functionCalls.length > 0 && projectId) {
                for (const call of functionCalls) {
                    await handleToolCall(call, projectId, setMessages);
                }
            }

        } catch (err: any) {
            console.error('Chat error:', err);
            showError('Kunde inte skicka meddelande');
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'model',
                content: 'Ursäkta, jag stötte på ett problem. Försök igen.',
                timestamp: new Date().toISOString(),
                isError: true
            } as ChatMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [currentContext, projectId, projectData, isDiscussionMode]);

    const toggleLiveMode = useCallback(() => setIsLiveMode(prev => !prev), []);
    const toggleDiscussionMode = useCallback(() => setIsDiscussionMode(prev => !prev), []);

    const clearHistory = useCallback(() => {
        setMessages([{
            id: 'welcome',
            role: 'model',
            content: 'Historik rensad. Vad vill du göra nu?',
            timestamp: new Date().toISOString()
        }]);
        // Note: We might want to clear DB too?
    }, []);

    return (
        <ChatContext.Provider value={{
            messages,
            isLoading,
            currentContext,
            isLiveMode,
            isOpen,
            isDiscussionMode,
            sendMessage,
            setContext: setCurrentContext,
            toggleLiveMode,
            setIsOpen,
            toggleDiscussionMode,
            clearHistory,
            projectId,
            setProjectId,
            projectData,
            setProjectData
        }}>
            {children}
        </ChatContext.Provider>
    );
};

// --- Helper Functions ---

async function handleToolCall(call: { name: string, args: any }, projectId: string, setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>) {
    let result = '';
    try {
        if (call.name === 'addVehicleHistoryEvent') {
            await addVehicleHistoryEvent(projectId, call.args);
            result = `Händelse tillagd: ${call.args.title}`;
        } else if (call.name === 'addMileageReading') {
            await addMileageReading(projectId, call.args);
            result = `Mätarställning sparad: ${call.args.mileage} mil`;
        } else if (call.name === 'updateInspectionFinding') {
            await updateInspectionFinding(projectId, call.args.findingId, {
                status: call.args.newStatus,
                resolutionNotes: call.args.feedback
            } as any);
            result = `Uppdaterade anmärkning ${call.args.findingId}`;
        } else if (call.name === 'addTask') {
            await addTask(projectId, {
                ...call.args,
                status: 'Ej påbörjad',
                created: new Date().toISOString(),
                updated: new Date().toISOString()
            });
            result = `Uppgift skapad: ${call.args.title}`;
        } else if (call.name === 'createPhase') {
            await addPhaseToProject(projectId, call.args.name, call.args.description, call.args.order);
            result = `Fas skapad: ${call.args.name}`;
        } else if (call.name === 'setProjectType') {
            await updateProjectType(projectId, call.args.type);
            result = `Projekttyp satt till: ${call.args.type}`;
        } else if (call.name === 'completeSetup') {
            await completeProjectSetup(projectId);
            result = `Setup markerad som klar!`;
        } else {
            result = `Okänt verktyg: ${call.name}`;
        }
    } catch (e: any) {
        result = `Fel vid verktygskörning: ${e.message}`;
    }

    setMessages(prev => [...prev, {
        id: `tool-${Date.now()}`,
        role: 'model',
        content: `🛠️ ${result}`,
        timestamp: new Date().toISOString()
    }]);
}

function buildTaskPrompt(task: Task, vehicleData: VehicleData): string {
    return `Du är ELTON, expert på fordon. Hjälp med uppgiften: "${task.title}".
    Beskrivning: ${task.description || 'Ingen'}.
    Fordon: ${vehicleData.make} ${vehicleData.model} (${vehicleData.year}).
    Svara på svenska.`;
}

function buildShoppingPrompt(item: ShoppingItem, vehicleData: VehicleData): string {
    return `Du är ELTON, inköpsassistent. Hjälp user hitta del: "${item.name}".
    Estimerat pris: ${item.estimatedCost} kr.
    Fordon: ${vehicleData.make} ${vehicleData.model} (${vehicleData.year}).
    Svara på svenska.`;
}

function buildInspectionPrompt(finding: InspectionFinding | DetailedInspectionFinding, vehicleData: VehicleData): string {
    const description = 'description' in finding ? finding.description : finding.aiDiagnosis;
    const type = 'type' in finding ? finding.type : finding.category;

    return `Du är ELTON, besiktningsordförande. Hjälp åtgärda fel: "${type}".
     Beskrivning: ${description}.
     Fordon: ${vehicleData.make} ${vehicleData.model} (${vehicleData.year}).
     Svara på svenska.`;
}
