import React from 'react';

export default function Header({ onToggleSidebar, sidebarOpen }) {
  return (
    <header className="h-14 bg-gradient-to-r from-[#1a1a2e] to-[#16213e] border-b border-white/10 flex items-center px-4 shrink-0">
      <button
        onClick={onToggleSidebar}
        className="mr-3 p-1.5 rounded-lg hover:bg-white/10 transition-colors lg:hidden"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {sidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#CF0A2C] to-[#E94560] flex items-center justify-center text-white font-bold text-sm">
          华
        </div>
        <div>
          <h1 className="text-white font-semibold text-sm leading-tight">华小助</h1>
          <p className="text-gray-400 text-xs">华为AI售后服务助手</p>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-green-400 text-xs">在线</span>
        </div>
      </div>
    </header>
  );
}
