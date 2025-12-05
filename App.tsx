import React, { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from './components/Sidebar';
import InputArea from './components/InputArea';
import MessageBubble from './components/MessageBubble';
import { MenuIcon, SparklesIcon } from './components/Icon';
import { ChatSession, Message, Role, Attachment, ModelId, MODEL_LABELS } from './types';
import { generateChatResponseStream } from './services/gemini';

const App: React.FC = () => {
  // --- State ---
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelId>(ModelId.GEMINI_FLASH);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Derived State ---
  const currentSession = sessions.find(s => s.id === currentSessionId);
  const currentMessages = currentSession?.messages || [];

  // --- Effects ---
  
  // Load from local storage on mount
  useEffect(() => {
    // Changed key to aimchat_sessions for rebrand
    const saved = localStorage.getItem('aimchat_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
        if (parsed.length > 0) {
          setCurrentSessionId(parsed[0].id);
        } else {
            createNewSession();
        }
      } catch (e) {
        console.error("Failed to load sessions", e);
        createNewSession();
      }
    } else {
      createNewSession();
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (sessions.length > 0) {
        localStorage.setItem('aimchat_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages.length, currentMessages[currentMessages.length - 1]?.content]);


  // --- Handlers ---

  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: 'New Conversation',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  }, []);

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => {
        const filtered = prev.filter(s => s.id !== id);
        if (currentSessionId === id) {
            setCurrentSessionId(filtered.length > 0 ? filtered[0].id : null);
        }
        if (filtered.length === 0) {
             setTimeout(createNewSession, 0); 
        }
        return filtered;
    });
  };

  const handleSendMessage = async (text: string, attachments: Attachment[]) => {
    if (!currentSessionId) return;

    // 1. Add User Message
    const userMsg: Message = {
      id: uuidv4(),
      role: Role.USER,
      content: text,
      attachments: attachments,
      timestamp: Date.now(),
    };

    setSessions(prev => prev.map(session => {
        if (session.id === currentSessionId) {
            const newTitle = session.messages.length === 0 ? (text.slice(0, 30) || "Image Chat") : session.title;
            return {
                ...session,
                title: newTitle,
                messages: [...session.messages, userMsg],
                updatedAt: Date.now()
            };
        }
        return session;
    }));

    setIsLoading(true);

    // 2. Prepare Placeholder for Model Message
    const modelMsgId = uuidv4();
    const initialModelMsg: Message = {
        id: modelMsgId,
        role: Role.MODEL,
        content: '', // Start empty
        timestamp: Date.now()
    };

    setSessions(prev => prev.map(session => {
        if (session.id === currentSessionId) {
            return {
                ...session,
                messages: [...session.messages, initialModelMsg]
            };
        }
        return session;
    }));

    try {
        const currentSessionData = sessions.find(s => s.id === currentSessionId);
        const history = currentSessionData ? currentSessionData.messages : [];
        
        await generateChatResponseStream(
            history, 
            text, 
            attachments, 
            selectedModel,
            (chunkText) => {
                setSessions(prev => prev.map(session => {
                    if (session.id === currentSessionId) {
                        const newMessages = [...session.messages];
                        const lastMsgIndex = newMessages.findIndex(m => m.id === modelMsgId);
                        if (lastMsgIndex !== -1) {
                            newMessages[lastMsgIndex] = {
                                ...newMessages[lastMsgIndex],
                                content: newMessages[lastMsgIndex].content + chunkText
                            };
                        }
                        return { ...session, messages: newMessages };
                    }
                    return session;
                }));
            }
        );

    } catch (error) {
        console.error("API Error", error);
        setSessions(prev => prev.map(session => {
            if (session.id === currentSessionId) {
                const newMessages = [...session.messages];
                const lastMsgIndex = newMessages.findIndex(m => m.id === modelMsgId);
                if (lastMsgIndex !== -1) {
                    newMessages[lastMsgIndex] = {
                        ...newMessages[lastMsgIndex],
                        content: newMessages[lastMsgIndex].content + "\n\n**[Error: Failed to generate response. Please check your connection or try again.]**",
                        isError: true
                    };
                }
                return { ...session, messages: newMessages };
            }
            return session;
        }));
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background text-slate-100 overflow-hidden font-sans selection:bg-primary/30">
      <Sidebar 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onNewChat={createNewSession}
        onDeleteSession={deleteSession}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative w-full bg-background">
        
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-background/50 backdrop-blur-sm z-10 sticky top-0 border-b border-white/5">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 rounded-lg hover:bg-surface text-slate-400 md:hidden transition-colors"
            >
              <MenuIcon className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
                <span className="font-semibold text-sm md:text-base truncate max-w-[150px] md:max-w-xs text-slate-200">
                    {currentSession?.title || 'AimChat Workspace'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">BETA</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as ModelId)}
                className="bg-surface border border-white/10 text-xs md:text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary/50 text-slate-300 hover:bg-surface-hover transition-colors cursor-pointer"
                disabled={isLoading}
            >
                {Object.entries(MODEL_LABELS).map(([id, label]) => (
                    <option key={id} value={id}>{label}</option>
                ))}
            </select>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto scroll-smooth">
            <div className="max-w-3xl mx-auto px-4 py-6 md:px-0">
                {currentMessages.length === 0 ? (
                    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center opacity-0 animate-fade-in">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-primary/30">
                            <SparklesIcon className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight text-white">AimChat</h2>
                        <p className="text-slate-400 max-w-md mb-10 text-sm md:text-base leading-relaxed">
                            Your professional AI assistant for code, analysis, and creativity. Powered by Gemini 2.5.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full px-4 md:px-0">
                            {[
                                { title: "Debug Code", desc: "Find bugs in this React component" },
                                { title: "Explain Concept", desc: "Explain quantum entanglement" },
                                { title: "Creative Writing", desc: "Draft a product launch email" },
                                { title: "Travel Plan", desc: "3-day itinerary for Kyoto" }
                            ].map((item, i) => (
                                <button 
                                    key={i}
                                    onClick={() => handleSendMessage(item.desc, [])}
                                    className="p-4 rounded-xl border border-white/5 bg-surface/30 hover:bg-surface hover:border-primary/30 text-left transition-all hover:-translate-y-0.5 group"
                                >
                                    <div className="font-medium text-slate-200 text-sm mb-1 group-hover:text-primary transition-colors">{item.title}</div>
                                    <div className="text-xs text-slate-500 truncate">{item.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 pb-4">
                        {currentMessages.map(msg => (
                            <MessageBubble key={msg.id} message={msg} />
                        ))}
                        {/* Invisible div to scroll to */}
                        <div ref={messagesEndRef} className="h-4" />
                    </div>
                )}
            </div>
        </div>

        {/* Input Area Wrapper */}
        <div className="bg-background relative z-10">
            <InputArea onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>

      </div>
    </div>
  );
};

export default App;