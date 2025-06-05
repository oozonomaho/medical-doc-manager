// src/routes/certificates.ts
import express from 'express';
import db from '../db';

const router = express.Router();

router.post('/', (req, res) => {
  console.log('🟡 POST /certificates ルート到達!', req.body); 
  const cert = req.body;

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO certificates (
      id, patientId, type, applicationDate, completionDate,
      initialStartDate, startDate, validFrom, validUntil,
      status, grade, limitAmount, needsCertificate,
      sendDate, progress, createdAt, updatedAt
    ) VALUES (
      @id, @patientId, @type, @applicationDate, @completionDate,
      @initialStartDate, @startDate, @validFrom, @validUntil,
      @status, @grade, @limitAmount, @needsCertificate,
      @sendDate, @progress, @createdAt, @updatedAt
    )
  `);

  try {
    const data = {
      id: cert.id,
      patientId: cert.patientId,
      type: cert.type,
      applicationDate: cert.applicationDate ?? null,
      completionDate: cert.completionDate ?? null,
      initialStartDate: cert.initialStartDate ?? null,
      startDate: cert.startDate ?? null,
      validFrom: cert.validFrom ?? null,
      validUntil: cert.validUntil ?? null,
      status: cert.status ?? null,
      grade: cert.grade ?? null,
      limitAmount: cert.limitAmount ?? null,
      needsCertificate: cert.needsCertificate ? 1 : 0,
      sendDate: cert.sendDate ?? null,
      progress: cert.progress ? JSON.stringify(cert.progress) : null,
      createdAt: cert.createdAt ?? new Date().toISOString(),
      updatedAt: cert.updatedAt ?? new Date().toISOString(),
    };

    console.log('📤 最終送信データ:', data);
    for (const [key, val] of Object.entries(data)) {
  if (
    val !== null &&
    typeof val !== 'string' &&
    typeof val !== 'number'
  ) {
    console.warn(`🚨 不正な型: ${key} =`, val, `(typeof ${typeof val})`);
  }
}

    stmt.run(data);
    res.json({ success: true });

  } catch (err) {
    console.error('❌ DB書き込みエラー:', err);
    res.status(500).json({ success: false, error: '保存に失敗しました' });
  }
});


// 診断書の取得（GET）
router.get('/', (req, res) => {
    console.log('🟢 GET /certificates 到達!', req.query);
  const { patientId } = req.query;

  try {
    const stmt = patientId
      ? db.prepare('SELECT * FROM certificates WHERE patientId = ?')
      : db.prepare('SELECT * FROM certificates');

    const rows = patientId ? stmt.all(patientId) : stmt.all();

    // progress をパース
    const parsed = rows.map(row => ({
      ...row,
      progress: row.progress ? JSON.parse(row.progress) : {}
    }));
console.log('📥 GETで返すデータ:', parsed);
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: '取得に失敗しました' });
  }
});

// 更新（PUT）

router.put('/:id', (req, res) => {
  console.log('🟠 PUT /certificates/:id 到達!', req.body);
  const { id } = req.params;
  const cert = req.body;

  // 共通で使うデータ整形
  const data = {
    id,
    patientId: cert.patientId,
    type: cert.type,
    applicationDate: cert.applicationDate ?? null,
    completionDate: cert.completionDate ?? null,
    initialStartDate: cert.initialStartDate ?? null,
    startDate: cert.startDate ?? null,
    validFrom: cert.validFrom ?? null,
    validUntil: cert.validUntil ?? null,
    status: cert.status ?? null,
    grade: cert.grade ?? null,
    limitAmount: cert.limitAmount ?? null,
    needsCertificate: cert.needsCertificate ? 1 : 0,
    sendDate: cert.sendDate ?? null,
    progress: cert.progress ? JSON.stringify(cert.progress) : null,
    createdAt: cert.createdAt ?? new Date().toISOString(),
    updatedAt: cert.updatedAt ?? new Date().toISOString(),
  };


  try {
    // DBに既に存在するか確認
    const existing = db.prepare('SELECT id FROM certificates WHERE id = ?').get(id);
console.log('🧩 DBに既存IDあるか:', existing);
    if (existing) {
      // UPDATE
      const stmt = db.prepare(`
        UPDATE certificates SET
          patientId = @patientId,
          type = @type,
          applicationDate = @applicationDate,
          completionDate = @completionDate,
          initialStartDate = @initialStartDate,
          startDate = @startDate,
          validFrom = @validFrom,
          validUntil = @validUntil,
          status = @status,
          grade = @grade,
          limitAmount = @limitAmount,
          needsCertificate = @needsCertificate,
          sendDate = @sendDate,
          progress = @progress,
          createdAt = @createdAt,
          updatedAt = @updatedAt
        WHERE id = @id
      `);
      stmt.run(data);
      console.log('✅ UPDATE 成功:', id);
 const check = db.prepare('SELECT * FROM certificates WHERE id = ?').get(id);
  console.log('🔍 UPDATE直後の中身確認:', check);


    } else {
      // INSERT
      const stmt = db.prepare(`
        INSERT INTO certificates (
          id, patientId, type, applicationDate, completionDate,
          initialStartDate, startDate, validFrom, validUntil,
          status, grade, limitAmount, needsCertificate,
          sendDate, progress, createdAt, updatedAt
        ) VALUES (
          @id, @patientId, @type, @applicationDate, @completionDate,
          @initialStartDate, @startDate, @validFrom, @validUntil,
          @status, @grade, @limitAmount, @needsCertificate,
          @sendDate, @progress, @createdAt, @updatedAt
        )
      `);
      try {
      stmt.run(data);
      console.log('✅ INSERT 成功!!! データ:', data);
} catch (err) {
  console.error('❌ INSERT エラー:', err);
}
    }
    

    res.json({ success: true });
  } catch (err) {
    console.error('❌ 保存エラー:', err);
    res.status(500).json({ success: false, error: '保存に失敗しました' });
  }
});

// 削除（DELETE）
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  try {
    const stmt = db.prepare('DELETE FROM certificates WHERE id = ?');
    stmt.run(id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: '削除に失敗しました' });
  }
});

export default router;
