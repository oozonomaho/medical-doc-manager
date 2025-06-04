// src/routes/lifeInsurance.ts
import express from 'express';
import db from '../db';

const router = express.Router();

// 保存・更新（POST）
router.post('/', (req, res) => {
  const record = req.body;

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO life_insurance_records (
      id, patientId, year, month, insuranceType, patientName,
      certificateFee, certificateType, municipality,
      claimDate, difference, notes, claimRecipient,
      claimStatus, createdAt, updatedAt
    ) VALUES (
      @id, @patientId, @year, @month, @insuranceType, @patientName,
      @certificateFee, @certificateType, @municipality,
      @claimDate, @difference, @notes, @claimRecipient,
      @claimStatus, @createdAt, @updatedAt
    )
  `);

  try {
    stmt.run(record);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: '保存に失敗しました' });
  }
});

// 一覧取得（GET）
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM life_insurance_records');
    const rows = stmt.all();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: '取得に失敗しました' });
  }
});

// 更新（PUT）
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const record = req.body;

  const stmt = db.prepare(`
    UPDATE life_insurance_records SET
      patientId = @patientId,
      year = @year,
      month = @month,
      insuranceType = @insuranceType,
      patientName = @patientName,
      certificateFee = @certificateFee,
      certificateType = @certificateType,
      municipality = @municipality,
      claimDate = @claimDate,
      difference = @difference,
      notes = @notes,
      claimRecipient = @claimRecipient,
      claimStatus = @claimStatus,
      createdAt = @createdAt,
      updatedAt = @updatedAt
    WHERE id = @id
  `);

  try {
    stmt.run({ ...record, id });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: '更新に失敗しました' });
  }
});

// 削除（DELETE）
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  try {
    const stmt = db.prepare('DELETE FROM life_insurance_records WHERE id = ?');
    stmt.run(id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: '削除に失敗しました' });
  }
});

export default router;
