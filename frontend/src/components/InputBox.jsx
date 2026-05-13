import React, { useState, useRef } from 'react';

export default function InputBox({ onSend, disabled }) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e) => {
    setMessage(e.target.value);
    // 自动调整高度
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  // 快捷问题按钮配置
  const quickButtons = [
    { label: '产品咨询', question: '华为有哪些手机系列？各有什么特点？' },
    { label: '售后服务', question: '华为手机的保修政策是什么？' },
    { label: '故障排查', question: '手机屏幕失灵怎么办？' }
  ];

  const handleQuickQuestion = (question) => {
    if (disabled) return;
    onSend(question);
  };

  return (
    <div className="border-t border-white/10 bg-[#0f0f23] p-4">
      <div className="max-w-4xl mx-auto">
        {/* 快捷问题按钮 */}
        <div className="flex flex-wrap gap-2 mb-3">
          {quickButtons.map((btn, index) => (
            <button
              key={index}
              onClick={() => handleQuickQuestion(btn.question)}
              disabled={disabled}
              className="px-3 py-1.5 rounded-full text-xs
                bg-[#1a1a2e] border border-white/10 text-gray-400
                hover:border-[#CF0A2C]/50 hover:text-[#CF0A2C] hover:bg-[#1e1e3a]
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200"
            >
              {btn.label}
            </button>
          ))}
        </div>

        <div className="flex items-end gap-3 bg-[#1a1a2e] rounded-2xl border border-white/10 px-4 py-3
          focus-within:border-[#CF0A2C]/50 transition-colors">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="输入您的问题... (Enter发送, Shift+Enter换行)"
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm resize-none
              focus:outline-none disabled:opacity-50"
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={disabled || !message.trim()}
            className="p-2 rounded-xl
              bg-gradient-to-r from-[#CF0A2C] to-[#E94560]
              hover:from-[#B80925] hover:to-[#D13A55]
              disabled:opacity-30 disabled:cursor-not-allowed
              transition-all duration-200 shadow-lg shadow-red-500/20"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-center text-xs text-gray-600 mt-2">
          华小助AI助手可能会产生不准确的信息，请注意甄别重要内容
        </p>
      </div>
    </div>
  );
}
