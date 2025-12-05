import React from 'react';
import { ChatSession } from '../types';
import { PlusIcon, TrashIcon, SparklesIcon, SettingsIcon } from './Icon';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, 
  currentSessionId, 
  onSelectSession, 
  onNewChat,
  onDeleteSession,
  isOpen,
  onCloseMobile
}) => {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Content */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-30 w-72 bg-surface/50 border-r border-white/5 transform transition-transform duration-300 ease-in-out md:transform-none flex flex-col backdrop-blur-xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="h-16 flex items-center px-5 border-b border-white/5">
            <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                    <SparklesIcon className="w-5 h-5" />
                </div>
                <h1 className="font-bold text-lg tracking-tight text-slate-100">Aim<span className="text-primary">Chat</span></h1>
            </div>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={onNewChat}
            className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white py-3 px-4 rounded-xl transition-all border border-white/5 font-medium text-sm group"
          >
            <div className="bg-primary/20 text-primary p-1 rounded-md group-hover:bg-primary group-hover:text-white transition-colors">
                <PlusIcon className="w-4 h-4" />
            </div>
            New Chat
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5 custom-scrollbar">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3 px-3 mt-2">History</div>
          
          {sessions.length === 0 ? (
            <div className="text-sm text-slate-600 px-4 py-4 text-center italic">
              No chat history yet.
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => {
                    onSelectSession(session.id);
                    onCloseMobile();
                }}
                className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all duration-200 text-sm border border-transparent ${
                  session.id === currentSessionId
                    ? 'bg-surface hover:bg-surface-hover text-white border-white/5 shadow-sm'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <span className="truncate flex-1 pr-3">{session.title}</span>
                <button
                  onClick={(e) => onDeleteSession(session.id, e)}
                  className={`p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all ${
                      session.id === currentSessionId ? 'opacity-0 group-hover:opacity-100' : ''
                  }`}
                  title="Delete chat"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5">
            <button className="flex items-center gap-3 w-full p-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm">
                <SettingsIcon className="w-4 h-4" />
                <span>Settings</span>
            </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;