function searchKnowledge(db, query) {
  const keywords = query
    .replace(/[，。！？、；：""''（）【】\s]+/g, ' ')
    .split(' ')
    .filter(k => k.length > 0);

  if (keywords.length === 0) return [];

  const conditions = keywords.map(() => '(question LIKE ? OR answer LIKE ? OR keywords LIKE ?)').join(' OR ');
  const params = keywords.flatMap(k => [`%${k}%`, `%${k}%`, `%${k}%`]);

  const sql = `
    SELECT category, question, answer, keywords
    FROM knowledge_base
    WHERE ${conditions}
    ORDER BY
      CASE
        ${keywords.map((_, i) => `WHEN question LIKE ? THEN ${10 - i}`).join(' ')}
        ELSE 0
      END
    LIMIT 5
  `;

  const orderParams = keywords.map(k => `%${k}%`);
  const allParams = [...params, ...orderParams];

  return db.all(sql, allParams);
}

function getKnowledgeContext(db, userMessage) {
  const results = searchKnowledge(db, userMessage);

  if (results.length === 0) return null;

  return results
    .map(r => `【${r.category}】${r.question}\n${r.answer}`)
    .join('\n\n---\n\n');
}

module.exports = { searchKnowledge, getKnowledgeContext };
