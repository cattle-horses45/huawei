import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import InputBox from '../components/InputBox';
import * as api from '../services/api';

export default function Home() {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 加载会话列表
  const loadSessions = useCallback(async () => {
    try {
      const data = await api.getSessions();
      setSessions(data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // 加载消息历史
  const loadMessages = useCallback(async (sessionId) => {
    try {
      const data = await api.getMessages(sessionId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }, []);

  // 切换会话
  const handleSelectSession = useCallback((sessionId) => {
    const session = sessions.find(s => s.id === sessionId);
    setCurrentSession(session);
    loadMessages(sessionId);
    setSidebarOpen(false);
  }, [sessions, loadMessages]);

  // 新建会话
  const handleNewSession = useCallback(async () => {
    try {
      const session = await api.createSession('新会话');
      setSessions(prev => [session, ...prev]);
      setCurrentSession(session);
      setMessages([]);
      setSidebarOpen(false);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  }, []);

  // 删除会话
  const handleDeleteSession = useCallback(async (sessionId) => {
    try {
      await api.deleteSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  }, [currentSession]);

  // 发送消息
  const handleSend = useCallback(async (content) => {
    let session = currentSession;

    // 如果没有当前会话，先创建一个
    if (!session) {
      try {
        session = await api.createSession(content.length > 20 ? content.substring(0, 20) + '...' : content);
        setSessions(prev => [session, ...prev]);
        setCurrentSession(session);
      } catch (error) {
        console.error('Failed to create session:', error);
        return;
      }
    }

    // 添加用户消息到界面
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // 使用流式接口实现打字机效果
      const aiMessageId = Date.now() + 1;
      // 先添加一个空的AI消息
      setMessages(prev => [...prev, {
        id: aiMessageId,
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString()
      }]);

      // 流式接收内容
      await api.sendMessageStream(session.id, content, (chunk) => {
        setMessages(prev => prev.map(msg =>
          msg.id === aiMessageId
            ? { ...msg, content: msg.content + chunk }
            : msg
        ));
      });

      // 更新会话标题
      setSessions(prev => {
        const updated = prev.map(s =>
          s.id === session.id
            ? { ...s, title: content.length > 20 ? content.substring(0, 20) + '...' : content, updated_at: new Date().toISOString() }
            : s
        );
        return updated;
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 2,
        role: 'assistant',
        content: '抱歉，AI服务暂时不可用，请稍后重试。如果问题持续存在，请拨打华为客服热线 400-830-8300。',
        created_at: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [currentSession]);

  // 快捷问题
  useEffect(() => {
    const handler = (e) => {
      handleSend(e.detail);
    };
    window.addEventListener('quickQuestion', handler);
    return () => window.removeEventListener('quickQuestion', handler);
  }, [handleSend]);

  return (
    <div className="h-screen flex flex-col">
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {/* 侧边栏遮罩 */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <Sidebar
          sessions={sessions}
          currentSession={currentSession}
          onSelectSession={handleSelectSession}
          onDeleteSession={handleDeleteSession}
          onNewSession={handleNewSession}
          isOpen={sidebarOpen}
        />

        <main className="flex-1 flex flex-col bg-[#0f0f23] min-w-0">
          <ChatWindow messages={messages} isLoading={isLoading} />
          <InputBox onSend={handleSend} disabled={isLoading} />
        </main>
      </div>
    </div>
  );
}
