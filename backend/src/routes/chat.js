const express = require('express');
const router = express.Router();
const { chat, chatStream } = require('../services/deepseek');
const { getKnowledgeContext } = require('../services/knowledge');

module.exports = function(db) {
  // 发送消息（非流式）
  router.post('/send', async (req, res) => {
    try {
      const { sessionId, content } = req.body;

      if (!sessionId || !content) {
        return res.status(400).json({ error: '缺少sessionId或content' });
      }

      // 保存用户消息
      db.run('INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)', [sessionId, 'user', content]);

      // 获取历史消息（最近20条）
      const history = db.all(
        'SELECT role, content FROM messages WHERE session_id = ? ORDER BY created_at ASC',
        [sessionId]
      ).slice(-20);

      // 检索知识库
      const knowledgeContext = getKnowledgeContext(db, content);

      // 调用DeepSeek API
      const reply = await chat(history, knowledgeContext);

      // 保存AI回复
      db.run('INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)', [sessionId, 'assistant', reply]);

      // 更新会话标题（如果是第一条消息）
      const messageCount = db.get('SELECT COUNT(*) as cnt FROM messages WHERE session_id = ?', [sessionId]);
      if (messageCount.cnt <= 2) {
        const title = content.length > 20 ? content.substring(0, 20) + '...' : content;
        db.run('UPDATE sessions SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [title, sessionId]);
      }

      // 更新会话时间
      db.run('UPDATE sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [sessionId]);

      res.json({ reply });
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ error: 'AI服务暂时不可用，请稍后重试' });
    }
  });

  // 发送消息（流式）
  router.post('/stream', async (req, res) => {
    try {
      const { sessionId, content } = req.body;

      if (!sessionId || !content) {
        return res.status(400).json({ error: '缺少sessionId或content' });
      }

      // 保存用户消息
      db.run('INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)', [sessionId, 'user', content]);

      // 获取历史消息
      const history = db.all(
        'SELECT role, content FROM messages WHERE session_id = ? ORDER BY created_at ASC',
        [sessionId]
      ).slice(-20);

      // 检索知识库
      const knowledgeContext = getKnowledgeContext(db, content);

      // 设置SSE headers
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });

      // 流式调用DeepSeek API
      const fullReply = await chatStream(history, knowledgeContext, (chunk) => {
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      });

      // 保存AI完整回复
      db.run('INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)', [sessionId, 'assistant', fullReply]);

      // 更新会话标题
      const messageCount = db.get('SELECT COUNT(*) as cnt FROM messages WHERE session_id = ?', [sessionId]);
      if (messageCount.cnt <= 2) {
        const title = content.length > 20 ? content.substring(0, 20) + '...' : content;
        db.run('UPDATE sessions SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [title, sessionId]);
      }

      db.run('UPDATE sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [sessionId]);

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      console.error('Stream chat error:', error);
      res.write(`data: ${JSON.stringify({ error: 'AI服务暂时不可用' })}\n\n`);
      res.end();
    }
  });

  return router;
};
