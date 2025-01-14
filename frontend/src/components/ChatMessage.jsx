// /frontend/src/components/ChatMessage.jsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ChatMessage = ({ message, isDarkMode }) => {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            if (!inline && language) {
              return (
                <SyntaxHighlighter
                  style={isDarkMode ? oneDark : oneLight}
                  language={language}
                  PreTag="div"
                  className="rounded-lg my-4"
                  showLineNumbers={true}
                  wrapLines={true}
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              );
            }

            return (
              <code 
                className={`${className} bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5`}
                {...props}
              >
                {children}
              </code>
            );
          },
          p: ({children}) => (
            <p className="mb-4 last:mb-0">{children}</p>
          ),
          h1: ({children}) => (
            <h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>
          ),
          h2: ({children}) => (
            <h2 className="text-xl font-bold mb-3 mt-5">{children}</h2>
          ),
          h3: ({children}) => (
            <h3 className="text-lg font-bold mb-3 mt-4">{children}</h3>
          ),
          ul: ({children}) => (
            <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>
          ),
          ol: ({children}) => (
            <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>
          ),
          li: ({children}) => (
            <li className="mb-1">{children}</li>
          ),
          blockquote: ({children}) => (
            <blockquote className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 my-4 italic">
              {children}
            </blockquote>
          ),
          a: ({children, href}) => (
            <a 
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {children}
            </a>
          ),
          table: ({children}) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                {children}
              </table>
            </div>
          ),
          th: ({children}) => (
            <th className="px-4 py-2 bg-gray-50 dark:bg-gray-800 text-left text-sm font-semibold">
              {children}
            </th>
          ),
          td: ({children}) => (
            <td className="px-4 py-2 text-sm border-t border-gray-200 dark:border-gray-700">
              {children}
            </td>
          )
        }}
      >
        {message}
      </ReactMarkdown>
    </div>
  );
};

export default ChatMessage;