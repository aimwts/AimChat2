import React from 'react';
import { Message, Role } from '../types';
import { UserIcon, BotIcon } from './Icon';
import MarkdownRenderer from './MarkdownRenderer';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-8 group animate-slide-up`}>
      <div className={`flex max-w-[95%] md:max-w-[85%] lg:max-w-[75%] gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border border-white/5 shadow-sm ${
            isUser ? 'bg-surface text-slate-300' : 'bg-primary text-white'
        }`}>
          {isUser ? <UserIcon className="w-5 h-5" /> : <BotIcon className="w-5 h-5" />}
        </div>

        {/* Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full min-w-0`}>
          <div className="flex flex-col gap-2 w-full">
            
            {/* Sender Name */}
            <span className={`text-[11px] font-medium text-slate-500 ${isUser ? 'text-right' : 'text-left'}`}>
                {isUser ? 'You' : 'AimChat'}
            </span>

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-1">
                    {message.attachments.map((att, idx) => (
                        <div key={idx} className="relative rounded-xl overflow-hidden border border-white/10 w-48 h-auto shadow-md">
                            <img 
                                src={`data:${att.mimeType};base64,${att.data}`} 
                                alt="Attachment" 
                                className="w-full h-auto max-h-64 object-cover"
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Text Bubble */}
            <div className={`px-5 py-3.5 rounded-2xl shadow-sm leading-relaxed ${
              isUser 
                ? 'bg-surface text-slate-100 rounded-tr-none border border-white/5' 
                : 'bg-transparent text-slate-300 -ml-2'
            }`}>
                {isUser ? (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                ) : (
                    <MarkdownRenderer content={message.content} />
                )}
            </div>
            
            {/* Status */}
            {message.isError && (
                <div className="text-xs text-red-400 mt-1 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
                    Failed to send
                </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;