import React, { useState, useRef, useEffect } from 'react';
import { streamGeminiResponse } from '../services/geminiService';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { Task } from '../types';

interface AIAssistantProps {
    tasks: Task[];
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ tasks }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([
    { role: 'model', content: "Hej! Jag är din digitala mekaniker för Adventure Bus (VW LT31). Jag har full koll på din projektplan, dina anteckningar och uppladdade filer. Vad funderar du på?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    let fullResponse = '';
    
    // Add placeholder for streaming
    setMessages(prev => [...prev, { role: 'model', content: '' }]);

    // Pass the current tasks to the service
    await streamGeminiResponse(messages, userMsg, tasks, (chunk) => {
      fullResponse += chunk;
      setMessages(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1].content = fullResponse;
        return newHistory;
      });
    });

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-nordic-ice to-white p-4 border-b border-slate-100 flex items-center space-x-3">
        <div className="p-2 bg-white rounded-lg shadow-sm text-teal-600">
           <Sparkles size={20} />
        </div>
        <div>
           <h3 className="font-serif font-semibold text-nordic-charcoal">Mekaniker-AI</h3>
           <p className="text-xs text-slate-500">Expert på VW LT31 & Vanlife</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-nordic-charcoal text-white' : 'bg-teal-100 text-teal-700'
              }`}>
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              
              <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-nordic-charcoal text-white rounded-br-none' 
                  : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
              }`}>
                 {msg.role === 'model' && msg.content === '' ? (
                   <span className="flex space-x-1 h-5 items-center">
                     <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                     <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                     <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                   </span>
                 ) : (
                    <div className="markdown-body" dangerouslySetInnerHTML={{ 
                      __html: msg.content.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') 
                    }} />
                 )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex space-x-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Fråga om rost, delar eller budget..."
            className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-nordic-charcoal hover:bg-slate-800 disabled:bg-slate-300 text-white p-3 rounded-xl transition-colors shadow-sm"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};