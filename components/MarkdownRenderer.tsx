import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// In a real environment, you would npm install react-markdown remark-gfm.
// Since the prompt asks to use "popular and existing libraries", I assume the build system
// will handle these imports or I should write a simple parser if they are not available.
// However, the prompt instruction "Use popular and existing libraries" strongly suggests assuming standard availability.

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="prose prose-invert prose-blue max-w-none text-sm md:text-base leading-relaxed break-words">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
            code({node, inline, className, children, ...props}: any) {
                const match = /language-(\w+)/.exec(className || '')
                return !inline && match ? (
                  <div className="relative group rounded-md overflow-hidden my-4 border border-slate-700 bg-slate-900">
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-800 text-xs text-slate-400 font-mono border-b border-slate-700">
                      <span>{match[1]}</span>
                    </div>
                    <pre className="p-4 overflow-x-auto">
                        <code className={className} {...props}>
                            {children}
                        </code>
                    </pre>
                  </div>
                ) : (
                  <code className={`${className} bg-slate-800/50 px-1.5 py-0.5 rounded text-blue-300 font-mono text-sm`} {...props}>
                    {children}
                  </code>
                )
              }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;