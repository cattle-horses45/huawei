// 检测运行环境，自动选择API地址
function getApiBase() {
  // Capacitor APP环境
  if (window.Capacitor) {
    return 'https://huawei-chatbot.onrender.com/api';
  }
  // 浏览器开发环境（Vite代理）
  return '/api';
}

const API_BASE = getApiBase();

// 带超时的fetch（AI请求需要更长超时）
function fetchWithTimeout(url, options = {}, timeout = 90000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('请求超时，请稍后重试')), timeout)
    )
  ]);
}

// 会话相关
export async function getSessions() {
  const res = await fetchWithTimeout(`${API_BASE}/sessions`);
  return res.json();
}

export async function createSession(title) {
  const res = await fetchWithTimeout(`${API_BASE}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  });
  return res.json();
}

export async function deleteSession(sessionId) {
  const res = await fetchWithTimeout(`${API_BASE}/sessions/${sessionId}`, {
    method: 'DELETE'
  });
  return res.json();
}

export async function getMessages(sessionId) {
  const res = await fetchWithTimeout(`${API_BASE}/sessions/${sessionId}/messages`);
  return res.json();
}

// 聊天相关
export async function sendMessage(sessionId, content) {
  const res = await fetchWithTimeout(`${API_BASE}/chat/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, content })
  }, 60000);
  return res.json();
}

// 流式聊天
export async function sendMessageStream(sessionId, content, onChunk) {
  const res = await fetch(`${API_BASE}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, content })
  });

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullContent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n').filter(line => line.trim() !== '');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') break;

        try {
          const parsed = JSON.parse(data);
          if (parsed.content) {
            fullContent += parsed.content;
            onChunk(parsed.content);
          }
        } catch {
          // skip malformed JSON
        }
      }
    }
  }

  return fullContent;
}
