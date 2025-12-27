
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { streamChatMessage } from '@/services/firebaseAI';
import { ChatMessage } from '@/services/db';
import { Project, ProjectType } from '@/types/types';
import { getSetupSystemInstruction, addPhaseToProject, addTaskToProject, updateProjectType, completeProjectSetup, updateSetupStage } from '@/services/projectSetupService';
import { useToasts, ToastContainer } from './Toast';
import { Send, ArrowRight, Sparkles, Loader2, MessageCircle, Wrench } from 'lucide-react';
import ReactMarkdown, { Options } from 'react-markdown';

interface OnboardingChatProps {
    project: Project;
    onSetupComplete: () => void;
}

export const OnboardingChat: React.FC<OnboardingChatProps> = ({ project, onSetupComplete }) => {
    const { toasts, removeToast, error: showError, success } = useToasts();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [phasesCreated, setPhasesCreated] = useState(project.phases?.length || 0);
    const [tasksCreated, setTasksCreated] = useState(project.tasks?.length || 0);
    const [isSetupComplete, setIsSetupComplete] = useState(project.setupComplete || false);
    const [localPhases, setLocalPhases] = useState(project.phases || []);
    const [localTasks, setLocalTasks] = useState(project.tasks || []);
    const [isDiscussionMode, setIsDiscussionMode] = useState(false);

    // Initialize chat
    useEffect(() => {
        const initialMsg: ChatMessage = {
            role: 'model',
            content: `Hej! 👋 Jag ser att du har en ${project.vehicleData.make} ${project.vehicleData.model} från ${project.vehicleData.year}.\n\nVad är ditt mål med projektet? Ska du renovera, bygga camper, eller bara hålla den rullande?`,
            timestamp: new Date().toISOString()
        };
        setMessages([initialMsg]);
    }, [project.id]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: ChatMessage = {
            role: 'user',
            content: input,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // Build custom system instruction for setup mode
            // Use local state which includes newly created phases/tasks
            const systemInstruction = getSetupSystemInstruction(
                project.vehicleData,
                localPhases, // Use local state, not props
                localTasks   // Use local state, not props
            );

            // Prepare history for API (excluding the last user message we just added)
            const apiHistory = messages.map(m => ({
                role: m.role as 'user' | 'model',
                content: m.content
            }));

            await streamChatMessage(
                apiHistory,
                input,
                project.vehicleData,
                project.tasks, // Current tasks context
                project.shoppingItems,
                (text) => {
                    // Update the AI's response in real-time
                    setMessages(prev => {
                        const newMsgs = [...prev];
                        const lastMsg = newMsgs[newMsgs.length - 1];
                        if (lastMsg.role === 'model' && lastMsg.timestamp === userMsg.timestamp) {
                            // Correct: don't overwrite user message. Wait for a new model message model.
                            return prev;
                        }

                        // If last message is user, append new model message
                        if (lastMsg.role === 'user') {
                            return [...prev, {
                                role: 'model',
                                content: text,
                                timestamp: new Date().toISOString()
                            }];
                        }

                        // Update existing model message
                        return newMsgs.map((msg, idx) =>
                            idx === newMsgs.length - 1 ? { ...msg, content: text } : msg
                        );
                    });
                },
                async (toolCalls) => {
                    // Handle tool calls
                    const results = [];
                    for (const call of toolCalls) {
                        try {
                            if (call.name === 'createPhase') {
                                const { name, description, order } = call.args;
                                const newPhase = await addPhaseToProject(project.id, name, description, order);
                                setPhasesCreated(prev => prev + 1);
                                results.push({ name: call.name, result: `Phase "${name}" created successfully.` });

                                // GAP 4 FIX: Update local state immutably instead of mutating props
                                setLocalPhases(prev => [...prev, newPhase]);

                                // GAP 3 FIX: Update setup stage on first phase creation
                                if (localPhases.length === 0) {
                                    await updateSetupStage(project.id, 'creating-phases');
                                }
                            }
                            else if (call.name === 'addTask') {
                                // GAP 1 FIX: Actually save task to Firestore!
                                const newTask = await addTaskToProject(project.id, {
                                    title: call.args.title,
                                    description: call.args.description,
                                    phase: call.args.phase,
                                    priority: call.args.priority,
                                    estimatedCostMax: call.args.estimatedCostMax
                                });
                                setTasksCreated(prev => prev + 1);
                                results.push({ name: call.name, result: `Task "${newTask.title}" saved to Firestore (ID: ${newTask.id}).` });

                                // Update local state
                                setLocalTasks(prev => [...prev, newTask]);

                                // GAP 3 FIX: Update setup stage on first task creation
                                if (localTasks.length === 0) {
                                    await updateSetupStage(project.id, 'adding-tasks');
                                }
                            }
                            else if (call.name === 'setProjectType') {
                                await updateProjectType(project.id, call.args.type as ProjectType);
                                results.push({ name: call.name, result: `Project type set to ${call.args.type}` });
                            }
                            else if (call.name === 'completeSetup') {
                                await completeProjectSetup(project.id);
                                setIsSetupComplete(true);
                                results.push({ name: call.name, result: `Setup marked as complete.` });
                                success('Projektet är redo!');
                            }
                        } catch (err: any) {
                            console.error(`Tool execution failed (${call.name}):`, err);
                            results.push({ name: call.name, result: `Error: ${err.message}` });
                        }
                    }
                    return results;
                },
                undefined, // imageBase64
                project.name,
                undefined, // userSkillLevel
                undefined, // projectType
                systemInstruction, // CUSTOM INSTRUCTION
                isDiscussionMode // DISABLE TOOLS IF IN DISCUSSION MODE
            );

        } catch (err) {
            console.error('Chat error:', err);
            showError('Kunde inte prata med Elton just nu.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
            <ToastContainer toasts={toasts} onRemove={removeToast} />

            {/* Header with Progress */}
            <div className="bg-white dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-50 dark:bg-teal-900/30 rounded-full flex items-center justify-center text-teal-600 dark:text-teal-400">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-800 dark:text-white">Projektstart: {project.vehicleData.make}</h2>
                        <p className="text-xs text-slate-500">Elton hjälper dig strukturera projektet</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Mode Toggle */}
                    <button
                        onClick={() => setIsDiscussionMode(!isDiscussionMode)}
                        title={isDiscussionMode ? "Byt till Verkstadsläge (Gör ändringar)" : "Byt till Diskussionsläge (Inga ändringar)"}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${isDiscussionMode
                            ? 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800'
                            : 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800'
                            }`}
                    >
                        {isDiscussionMode ? <MessageCircle size={16} /> : <Wrench size={16} />}
                        <span className="hidden sm:inline">{isDiscussionMode ? 'Diskussion' : 'Verkstad'}</span>
                    </button>

                    <div className="text-right hidden sm:block">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</div>
                        <div className="flex gap-3 text-sm font-medium">
                            <span className={phasesCreated > 0 ? 'text-teal-600' : 'text-slate-400'}>
                                {phasesCreated} Faser
                            </span>
                            <span className={tasksCreated > 0 ? 'text-teal-600' : 'text-slate-400'}>
                                {tasksCreated} Uppgifter
                            </span>
                        </div>
                    </div>

                    {isSetupComplete && (
                        <button
                            onClick={onSetupComplete}
                            className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-2 rounded-xl font-bold transition-all shadow-md flex items-center gap-2 animate-fade-in"
                        >
                            Till Projektet <ArrowRight size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] sm:max-w-[75%] p-5 rounded-2xl shadow-sm ${msg.role === 'user'
                            ? 'bg-nordic-charcoal text-white rounded-tr-none'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700'
                            }`}>
                            <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
                                <ReactMarkdown>
                                    {msg.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin text-teal-500" />
                            <span className="text-xs text-slate-400 font-medium">Elton tänker...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                <div className="max-w-4xl mx-auto flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder={isDiscussionMode ? "Diskutera med Elton..." : "Beskriv vad som ska göras..."}
                        className={`flex-1 p-4 border rounded-xl focus:outline-none focus:ring-2 transition-all 
                            ${isDiscussionMode
                                ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800 focus:border-indigo-500 focus:ring-indigo-500/20 text-indigo-900 dark:text-indigo-100 placeholder-indigo-300'
                                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-teal-500/20 text-slate-800 dark:text-white'
                            }`}
                        disabled={isLoading || isSetupComplete}
                        autoFocus
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!input.trim() || isLoading || isSetupComplete}
                        className="p-4 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl transition-all shadow-md"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};
