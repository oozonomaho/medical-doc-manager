// src/db.ts
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// データベースファイルの保存先を定義
const dbPath = path.join(__dirname, '..', 'data', 'database.sqlite');
console.log('📁 DBファイル:', dbPath);

// データベースフォルダがなければ作る
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// DB接続
const db = new Database(dbPath);

// ---- テーブルスキーマのマイグレーション ----
const migratePatientsTable = () => {
  const info = db.prepare("PRAGMA table_info(patients)").all();
  const nameCol = info.find(col => col.name === 'name');
  if (nameCol && nameCol.notnull === 1) {
    console.log('🔄 Migrating patients table to allow NULL name');
    const migrate = db.transaction(() => {
      db.exec('PRAGMA foreign_keys=off;');
      db.exec('ALTER TABLE patients RENAME TO patients_old;');
      db.exec(`
        CREATE TABLE patients (
          id TEXT PRIMARY KEY,
          name TEXT,
          nameKana TEXT,
          chartNumber TEXT,
          insuranceType TEXT,
          notes TEXT,
          updatedAt TEXT
        );
      `);
      db.exec(`
        INSERT INTO patients (id, name, nameKana, chartNumber, insuranceType, notes, updatedAt)
        SELECT id, name, nameKana, chartNumber, insuranceType, notes, updatedAt FROM patients_old;
      `);
      db.exec('DROP TABLE patients_old;');
      db.exec('PRAGMA foreign_keys=on;');
    });
    migrate();
  }
};

// patients テーブルがなければ作る（必要に応じて項目追加してOK）
db.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    name TEXT,
    nameKana TEXT,
    chartNumber TEXT,
    insuranceType TEXT,
    notes TEXT,
    updatedAt TEXT
  );
  
CREATE TABLE IF NOT EXISTS certificates (
  id TEXT PRIMARY KEY,
  patientId TEXT NOT NULL,
  type TEXT NOT NULL,               -- '自立支援' | '手帳' | '年金'
  
  -- status 情報
  applicationDate TEXT,
  completionDate TEXT,
  startDate TEXT,
  validFrom TEXT,
  validUntil TEXT,
  status TEXT,                      -- 'ACTIVE' / 'ONHOLD' / 'EXPIRED' など

  -- medicalCertificate 情報
  initialStartDate TEXT,
  grade TEXT,
  limitAmount TEXT,
  needsCertificate BOOLEAN,
  sendDate TEXT,
  progress TEXT,                    -- JSON文字列で { docsReady, docsHanded... }

  createdAt TEXT,
  updatedAt TEXT,

  FOREIGN KEY (patientId) REFERENCES patients(id)
);

`);
// 既存データベースが古いスキーマの場合はマイグレーション
migratePatientsTable();
db.prepare(`
  CREATE TABLE IF NOT EXISTS life_insurance_records (
    id TEXT PRIMARY KEY,
    patientId TEXT,
    year INTEGER,
    month INTEGER,
    insuranceType TEXT,
    patientName TEXT,
    certificateFee INTEGER,
    certificateType TEXT,
    municipality TEXT,
    claimDate TEXT,
    difference INTEGER,
    notes TEXT,
    claimRecipient TEXT,
    claimStatus INTEGER,
    createdAt TEXT,
    updatedAt TEXT
  )
`).run();


export default db;
