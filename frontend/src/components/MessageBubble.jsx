import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  return (
    <div className={`message-bubble flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* 头像 */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold
        ${isUser
          ? 'bg-gradient-to-br from-blue-500 to-blue-700'
          : 'bg-gradient-to-br from-[#CF0A2C] to-[#E94560]'
        }`}
      >
        {isUser ? '我' : '华'}
      </div>

      {/* 消息内容 */}
      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`
          px-4 py-2.5 rounded-2xl text-sm leading-relaxed relative group
          ${isUser
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-tr-md'
            : 'bg-[#1e1e3a] text-gray-200 border border-white/5 rounded-tl-md'
          }
        `}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <>
              <div className="markdown-content">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
              {/* 复制按钮 */}
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100
                  hover:bg-white/10 transition-all duration-200"
                title="复制内容"
              >
                {copied ? (
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </>
          )}
        </div>
        <div className={`flex items-center gap-2 mt-1 ${isUser ? 'flex-row-reverse mr-1' : 'ml-1'}`}>
          <p className="text-xs text-gray-600">
            {formatTime(message.created_at)}
          </p>
          {/* AI消息显示复制状态提示 */}
          {!isUser && copied && (
            <span className="text-xs text-green-400">已复制</span>
          )}
        </div>
      </div>
    </div>
  );
}
