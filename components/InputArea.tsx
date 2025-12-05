import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, XIcon, PlusIcon } from './Icon';
import { Attachment } from '../types';

interface InputAreaProps {
  onSendMessage: (text: string, attachments: Attachment[]) => void;
  isLoading: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
    }
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if ((!text.trim() && attachments.length === 0) || isLoading) return;
    onSendMessage(text, attachments);
    setText('');
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Limit size to ~4MB for demo purposes
      if (file.size > 4 * 1024 * 1024) {
        alert("File too large. Please select an image under 4MB.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        
        setAttachments(prev => [...prev, {
            mimeType: file.type,
            data: base64Data,
            name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4">
      
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="flex gap-3 mb-3 overflow-x-auto pb-2 px-1 scrollbar-hide">
          {attachments.map((att, idx) => (
            <div key={idx} className="relative group bg-surface border border-slate-700 rounded-xl overflow-hidden w-16 h-16 flex-shrink-0 animate-fade-in">
                <img 
                    src={`data:${att.mimeType};base64,${att.data}`} 
                    alt="preview" 
                    className="w-full h-full object-cover opacity-80" 
                />
                <button 
                    onClick={() => removeAttachment(idx)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-red-500 transition-colors"
                >
                    <XIcon className="w-3 h-3" />
                </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="relative flex items-end gap-2 bg-surface/80 backdrop-blur-md border border-white/10 rounded-2xl p-2 shadow-2xl focus-within:ring-1 focus-within:ring-primary/50 focus-within:border-primary/50 transition-all">
        
        {/* File Upload Button */}
        <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors flex-shrink-0"
            title="Add image"
            disabled={isLoading}
        >
            <PlusIcon className="w-5 h-5" />
        </button>
        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/png, image/jpeg, image/webp" 
            onChange={handleFileChange} 
        />

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message AimChat..."
          className="w-full bg-transparent text-slate-100 placeholder-slate-500 resize-none py-3 focus:outline-none max-h-[200px] overflow-y-auto text-sm md:text-base"
          rows={1}
          disabled={isLoading}
        />

        <button
          onClick={handleSend}
          disabled={(!text.trim() && attachments.length === 0) || isLoading}
          className={`p-3 rounded-xl flex-shrink-0 transition-all duration-200 ${
            (text.trim() || attachments.length > 0) && !isLoading
              ? 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20'
              : 'bg-white/5 text-slate-600 cursor-not-allowed'
          }`}
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </div>
      <p className="text-center text-[11px] text-slate-600 mt-3 font-medium">
        AimChat can make mistakes. Verify important information.
      </p>
    </div>
  );
};

export default InputArea;