import React from 'react';

export default function Sidebar({ sessions, currentSession, onSelectSession, onDeleteSession, onNewSession, isOpen }) {
  return (
    <aside className={`
      fixed lg:static inset-y-0 left-0 z-30
      w-72 bg-[#1a1a2e] border-r border-white/10
      flex flex-col
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      {/* 新建会话按钮 */}
      <div className="p-3 border-b border-white/10">
        <button
          onClick={onNewSession}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
            bg-gradient-to-r from-[#CF0A2C] to-[#E94560]
            hover:from-[#B80925] hover:to-[#D13A55]
            text-white font-medium text-sm
            transition-all duration-200 shadow-lg shadow-red-500/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新建会话
        </button>
      </div>

      {/* 会话列表 */}
      <div className="flex-1 overflow-y-auto py-2">
        {sessions.length === 0 ? (
          <div className="text-center text-gray-500 py-8 text-sm">
            暂无会话记录
          </div>
        ) : (
          sessions.map(session => (
            <div
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`
                group mx-2 mb-1 px-3 py-2.5 rounded-lg cursor-pointer
                transition-all duration-150
                ${currentSession?.id === session.id
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="truncate text-sm">{session.title}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    {new Date(session.updated_at).toLocaleDateString('zh-CN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 hover:text-red-400 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 底部信息 */}
      <div className="p-3 border-t border-white/10">
        <div className="text-center text-xs text-gray-600">
          华为AI售后服务助手 v1.0
        </div>
      </div>
    </aside>
  );
}
