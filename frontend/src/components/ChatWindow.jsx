import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';

export default function ChatWindow({ messages, isLoading }) {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const quickQuestions = [
    '华为Mate 60 Pro有什么特点？',
    '手机屏幕碎了怎么办？',
    '华为手机保修期多久？',
    '电池不耐用怎么解决？'
  ];

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {messages.length === 0 ? (
          // 欢迎页面
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#CF0A2C] to-[#E94560] flex items-center justify-center mb-6 shadow-xl shadow-red-500/20">
              <span className="text-white text-3xl font-bold">华</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">您好，我是华小助</h2>
            <p className="text-gray-400 mb-8 text-center">
              华为AI售后服务助手，为您提供产品咨询、售后服务、故障排查等帮助
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => {
                    // 触发发送
                    const event = new CustomEvent('quickQuestion', { detail: q });
                    window.dispatchEvent(event);
                  }}
                  className="text-left px-4 py-3 rounded-xl bg-[#1a1a2e] border border-white/5
                    hover:border-[#CF0A2C]/30 hover:bg-[#1e1e3a]
                    text-sm text-gray-300 transition-all duration-200"
                >
                  <span className="text-[#CF0A2C] mr-2">→</span>
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          // 消息列表
          <div className="space-y-6">
            {messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {/* 加载动画 */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#CF0A2C] to-[#E94560] flex items-center justify-center text-white text-xs font-bold shrink-0">
                  华
                </div>
                <div className="bg-[#1e1e3a] border border-white/5 rounded-2xl rounded-tl-md px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-gray-400 typing-dot"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 typing-dot"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 typing-dot"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  );
}
