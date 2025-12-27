import React, { useRef, useEffect, useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { Send, X, AlertCircle, Loader2, Maximize2, Minimize2, Mic, Image as ImageIcon, MessageCircle, Wrench } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useDropzone } from 'react-dropzone';

interface UnifiedChatInterfaceProps {
    mode: 'sidebar' | 'floating' | 'embedded';
    onClose?: () => void;
    className?: string; // Additional classes
}

export const UnifiedChatInterface: React.FC<UnifiedChatInterfaceProps> = ({
    mode,
    onClose,
    className = ''
}) => {
    const {
        messages,
        sendMessage,
        isLoading,
        currentContext,
        isLiveMode,
        toggleLiveMode,
        isDiscussionMode,
        toggleDiscussionMode
    } = useChat();

    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isMinimized, setIsMinimized] = useState(false);
    const [attachments, setAttachments] = useState<File[]>([]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() && attachments.length === 0) return;

        await sendMessage(input, attachments);
        setInput('');
        setAttachments([]);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles) => {
            setAttachments(prev => [...prev, ...acceptedFiles]);
        },
        accept: {
            'image/*': [],
            'audio/*': []
        },
        noClick: true
    });

    // --- RENDER HELPERS ---

    const getContainerClasses = () => {
        const base = "flex flex-col bg-white dark:bg-nordic-dark-surface border-l border-slate-200 dark:border-nordic-charcoal overflow-hidden transition-all duration-300";

        if (mode === 'sidebar') {
            return `${base} fixed inset-y-0 right-0 w-[400px] shadow-2xl z-50 animate-slide-in-right ${className}`;
        }
        if (mode === 'floating') {
            if (isMinimized) return `${base} fixed bottom-4 right-4 w-72 h-14 rounded-full shadow-lg cursor-pointer z-50 hover:bg-slate-50`;
            return `${base} fixed bottom-4 right-4 w-[450px] h-[600px] rounded-2xl shadow-2xl z-50 ${className}`;
        }
        // embedded
        return `${base} w-full h-full min-h-[500px] rounded-xl border ${className}`;
    };

    if (mode === 'floating' && isMinimized) {
        return (
            <div className={getContainerClasses()} onClick={() => setIsMinimized(false)}>
                <div className="flex items-center gap-3 px-4 h-full">
                    <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold">E</div>
                    <span className="font-bold text-slate-700 dark:text-slate-200">Prata med Elton</span>
                </div>
            </div>
        );
    }

    return (
        <div {...getRootProps()} className={getContainerClasses()}>
            <input {...getInputProps()} />

            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-nordic-charcoal flex justify-between items-center bg-slate-50/50 dark:bg-nordic-dark-bg/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold shadow-sm">
                        E
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white">
                            {currentContext.type === 'project' ? 'Elton' :
                                currentContext.type === 'task' ? 'Uppgiftshjälp' :
                                    currentContext.type === 'shopping' ? 'Inköpsassistent' : 'Inspektör'}
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isLiveMode ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                            <span className="text-xs text-slate-500">{isLiveMode ? 'Live Lyssnar...' : 'Online'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={toggleDiscussionMode}
                        className={`p-2 rounded-lg transition-colors ${isDiscussionMode ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-100 text-slate-500'}`}
                        title={isDiscussionMode ? "Diskussionsläge (Inga verktyg)" : "Verkstadsläge (Kan göra ändringar)"}
                    >
                        {isDiscussionMode ? <MessageCircle size={18} /> : <Wrench size={18} />}
                    </button>

                    {mode === 'floating' && (
                        <button onClick={() => setIsMinimized(true)} className="p-2 hover:bg-slate-100 dark:hover:bg-nordic-charcoal rounded-lg text-slate-500">
                            <Minimize2 size={18} />
                        </button>
                    )}

                    {(mode === 'sidebar' || mode === 'floating') && onClose && (
                        <button onClick={onClose} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg text-slate-500 transition-colors">
                            <X size={20} />
                        </button>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-black/20">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                    ? 'bg-teal-600 text-white rounded-br-none'
                                    : 'bg-white dark:bg-nordic-charcoal text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-none shadow-sm'
                                }`}
                        >
                            <ReactMarkdown className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
                                {msg.content}
                            </ReactMarkdown>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-nordic-charcoal p-3 rounded-2xl rounded-bl-none border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin text-teal-600" />
                            <span className="text-xs text-slate-500">Tänker...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Attachments Preview */}
            {attachments.length > 0 && (
                <div className="px-4 py-2 bg-slate-50 border-t flex gap-2 overflow-x-auto">
                    {attachments.map((file, i) => (
                        <div key={i} className="relative group">
                            <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center overflow-hidden">
                                {file.type.startsWith('image') ? (
                                    <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xs text-slate-500">{file.name.slice(0, 5)}...</span>
                                )}
                            </div>
                            <button
                                onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Drag Overlay */}
            {isDragActive && (
                <div className="absolute inset-0 bg-teal-500/10 backdrop-blur-sm flex items-center justify-center z-50 border-4 border-dashed border-teal-500 m-4 rounded-xl">
                    <p className="font-bold text-teal-700 text-lg">Släpp filer här</p>
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-slate-100 dark:border-nordic-charcoal bg-white dark:bg-nordic-dark-surface">
                <div className="flex items-end gap-2 bg-slate-50 dark:bg-nordic-charcoal/50 p-2 rounded-xl border border-slate-200 dark:border-nordic-charcoal focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
                    {/* Attachment Button */}
                    <button
                        // Use a ref to trigger hidden file input if needed, but dropzone handles drag.
                        // For click:
                        onClick={() => {
                            // This is a bit tricky with react-dropzone "noClick: true" setup on root.
                            // We might need a separate dropzone or input for this button.
                            // Simulating simple input for now:
                            document.getElementById('chat-file-input')?.click();
                        }}
                        className="p-2 text-slate-400 hover:text-teal-600 hover:bg-slate-200 dark:hover:bg-nordic-charcoal rounded-lg transition-colors"
                    >
                        <ImageIcon size={20} />
                    </button>
                    <input
                        id="chat-file-input"
                        type="file"
                        className="hidden"
                        multiple
                        accept="image/*,audio/*"
                        onChange={(e) => {
                            if (e.target.files) setAttachments(prev => [...prev, ...Array.from(e.target.files || [])]);
                        }}
                    />

                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Skriv ett meddelande..."
                        className="flex-1 bg-transparent border-none focus:ring-0 p-2 max-h-32 min-h-[40px] resize-none text-sm scrollbar-hide"
                        rows={1}
                    />

                    {/* Microphone / Send */}
                    {input.trim() || attachments.length > 0 ? (
                        <button
                            onClick={handleSend}
                            className="p-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
                        >
                            <Send size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={toggleLiveMode}
                            className={`p-2 rounded-lg transition-colors ${isLiveMode ? 'bg-red-50 text-red-600' : 'text-slate-400 hover:text-teal-600 hover:bg-slate-200'}`}
                        >
                            <Mic size={20} />
                        </button>
                    )}
                </div>
                <div className="mt-2 flex justify-between items-center text-xs text-slate-400 px-1">
                    <span>{isDiscussionMode ? 'Diskussionsläge aktivt' : 'Elton kan göra ändringar'}</span>
                    <span>Enter skickar</span>
                </div>
            </div>
        </div>
    );
};
