export interface MedicalCertificate {
  id: string;
  patientId: string;
  type: '自立支援' | '手帳' | '年金'; // 明示してもOK
  applicationDate?: string;
  completionDate?: string;
  initialStartDate?: string;
  startDate?: string;
  validFrom?: string;
  validUntil?: string;
  status?: 'ACTIVE' | 'ONHOLD' | 'EXPIRED'; // ← 実際の用途に合わせて拡張
  grade?: string;
  limitAmount?: string;
  needsCertificate?: boolean;
  sendDate?: string;
  progress?: {
    docsReady?: boolean;
    docsHanded?: boolean;
    docsReceived?: boolean;
    docsSent?: boolean;
    requestSent?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}
