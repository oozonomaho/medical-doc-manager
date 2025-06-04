// src/test-db.ts
import db from './db';

// 仮のデータを挿入
const stmt = db.prepare(`
  INSERT INTO patients (id, name, nameKana, chartNumber, insuranceType, notes, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

stmt.run(
  'test-id-001',
  '山田 太郎',
  'ヤマダ タロウ',
  '0001',
  'NATIONAL',
  '備考メモです',
  new Date().toISOString()
);

console.log('✔ データ挿入成功');
