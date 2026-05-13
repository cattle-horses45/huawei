const express = require('express');
const router = express.Router();

module.exports = function(db) {
  // 获取所有会话
  router.get('/', (req, res) => {
    const sessions = db.all(
      'SELECT id, title, created_at, updated_at FROM sessions ORDER BY updated_at DESC',
      []
    );
    res.json(sessions);
  });

  // 创建新会话
  router.post('/', (req, res) => {
    const { title } = req.body;
    const sessionTitle = title || '新会话';

    // 使用子查询获取最新插入的会话
    db.run('INSERT INTO sessions (title) VALUES (?)', [sessionTitle]);

    // 获取最新创建的会话（按ID倒序取第一个）
    const session = db.get(
      'SELECT * FROM sessions ORDER BY id DESC LIMIT 1'
    );

    if (session) {
      // 添加欢迎消息
      db.run(
        'INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)',
        [session.id, 'assistant', '您好！我是华小助，华为官方AI售后服务助手。很高兴为您服务！\n\n我可以帮您：\n- **产品咨询**：了解华为手机各系列特点和配置\n- **售后服务**：解答保修、退换货等问题\n- **故障排查**：解决手机使用中的常见问题\n- **购买建议**：为您推荐合适的机型\n\n请问有什么可以帮到您的？']
      );
    }

    res.json(session);
  });

  // 获取会话消息历史
  router.get('/:id/messages', (req, res) => {
    const { id } = req.params;
    const messages = db.all(
      'SELECT id, role, content, created_at FROM messages WHERE session_id = ? ORDER BY created_at ASC',
      [id]
    );
    res.json(messages);
  });

  // 删除会话
  router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM messages WHERE session_id = ?', [id]);
    db.run('DELETE FROM sessions WHERE id = ?', [id]);
    res.json({ success: true });
  });

  return router;
};
