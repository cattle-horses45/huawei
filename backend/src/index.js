require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./db/init');
const { seedKnowledgeBase } = require('./db/seed');

const app = express();
const PORT = process.env.PORT || 3001;

async function start() {
  // 初始化数据库
  const db = await initDatabase();
  seedKnowledgeBase(db);

  // 中间件
  app.use(cors());
  app.use(express.json());

  // API路由
  app.use('/api/chat', require('./routes/chat')(db));
  app.use('/api/sessions', require('./routes/sessions')(db));
  app.use('/api/knowledge', require('./routes/knowledge')(db));

  // 静态文件服务（生产环境）
  const frontendBuild = path.join(__dirname, '..', '..', 'frontend', 'dist');
  app.use(express.static(frontendBuild));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuild, 'index.html'));
  });

  // 启动服务器
  app.listen(PORT, () => {
    console.log(`华为AI客服机器人后端已启动: http://localhost:${PORT}`);
    console.log(`API文档:`);
    console.log(`  POST /api/chat/send     - 发送消息`);
    console.log(`  POST /api/chat/stream    - 流式对话`);
    console.log(`  GET  /api/sessions       - 获取会话列表`);
    console.log(`  POST /api/sessions       - 创建新会话`);
    console.log(`  GET  /api/sessions/:id/messages - 获取消息历史`);
    console.log(`  DELETE /api/sessions/:id - 删除会话`);
    console.log(`  GET  /api/knowledge      - 获取知识库`);
    console.log(`  POST /api/knowledge      - 添加知识条目`);
  });
}

start().catch(err => {
  console.error('启动失败:', err);
  process.exit(1);
});
