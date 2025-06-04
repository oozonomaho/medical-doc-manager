// src/routes/patients.ts
import express from 'express';
import db from '../db';

const router = express.Router();

// 患者一覧を取得
router.get('/', (req, res) => {
  const stmt = db.prepare('SELECT * FROM patients');
  const patients = stmt.all();
  res.json(patients);
});

// 患者を保存・更新
router.post('/', (req, res) => {
  const {
    id, name, nameKana, chartNumber,
    insuranceType, notes, updatedAt
  } = req.body;

  const stmt = db.prepare(`
    INSERT INTO patients (id, name, nameKana, chartNumber, insuranceType, notes, updatedAt)
    VALUES (@id, @name, @nameKana, @chartNumber, @insuranceType, @notes, @updatedAt)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      nameKana = excluded.nameKana,
      chartNumber = excluded.chartNumber,
      insuranceType = excluded.insuranceType,
      notes = excluded.notes,
      updatedAt = excluded.updatedAt
  `);

  stmt.run({ id, name, nameKana, chartNumber, insuranceType, notes, updatedAt });
  res.json({ success: true });
});

// 患者を削除
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  try {
    const stmt = db.prepare('DELETE FROM patients WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: '患者が見つかりませんでした' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('削除エラー:', err);
    res.status(500).json({ success: false, error: '削除に失敗しました' });
  }
});


export default router;

