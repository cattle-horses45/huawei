const express = require('express');
const router = express.Router();

module.exports = function(db) {
  // 获取知识库
  router.get('/', (req, res) => {
    const { category } = req.query;
    let items;
    if (category) {
      items = db.all('SELECT * FROM knowledge_base WHERE category = ? ORDER BY id', [category]);
    } else {
      items = db.all('SELECT * FROM knowledge_base ORDER BY category, id', []);
    }
    res.json(items);
  });

  // 获取知识库分类
  router.get('/categories', (req, res) => {
    const categories = db.all(
      'SELECT DISTINCT category, COUNT(*) as count FROM knowledge_base GROUP BY category ORDER BY count DESC',
      []
    );
    res.json(categories);
  });

  // 添加知识条目
  router.post('/', (req, res) => {
    const { category, question, answer, keywords } = req.body;
    if (!category || !question || !answer) {
      return res.status(400).json({ error: '缺少必填字段' });
    }
    db.run(
      'INSERT INTO knowledge_base (category, question, answer, keywords) VALUES (?, ?, ?, ?)',
      [category, question, answer, keywords || '']
    );
    const id = db.getLastInsertRowId();
    const item = db.get('SELECT * FROM knowledge_base WHERE id = ?', [id]);
    res.json(item);
  });

  // 更新知识条目
  router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { category, question, answer, keywords } = req.body;
    db.run(
      'UPDATE knowledge_base SET category = ?, question = ?, answer = ?, keywords = ? WHERE id = ?',
      [category, question, answer, keywords, id]
    );
    const item = db.get('SELECT * FROM knowledge_base WHERE id = ?', [id]);
    res.json(item);
  });

  // 删除知识条目
  router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM knowledge_base WHERE id = ?', [id]);
    res.json({ success: true });
  });

  return router;
};
