import { InsuranceType, PatientStatus } from './enums';

export interface Patient {
  id: string;
  name: string;
  nameKana: string;
  chartNumber: string;
  insuranceType: InsuranceType;
  selfSupportCertificate: {
    hasSupport: boolean;
    initialStartDate?: string;
    validFrom?: string;
    validUntil?: string;
    status: '更新完了' | '未更新' | '更新不要';
    applicationDate?: string;
    completionDate?: string;
    applicationNotes?: string;
    updateNotes?: string;
    needsCertificate?: boolean;
    limitAmount?: string;
    progress?: {
      docsReady?: boolean;
      docsHanded?: boolean;
      docsReceived?: boolean;
      docsSent?: boolean;
      requestSent?: boolean;
    };
  };
  disabilityCertificate: {
    hasDisability: boolean;
    grade?: string;
    initialStartDate?: string;
    validFrom?: string;
    validUntil?: string;
    status: '更新完了' | '未更新' | '更新不要';
    applicationDate?: string;
    completionDate?: string;
    applicationNotes?: string;
    updateNotes?: string;
    needsCertificate?: boolean;
    progress?: {
      docsReady?: boolean;
      docsHanded?: boolean;
      docsReceived?: boolean;
      docsSent?: boolean;
      requestSent?: boolean;
    };
  };
  pensionStatus: {
    hasPension: boolean;
    grade?: string;
    initialStartDate?: string;
    validFrom?: string;
    validUntil?: string;
    status: '更新完了' | '未更新' | '更新不要';
    applicationDate?: string;
    completionDate?: string;
    applicationNotes?: string;
    updateNotes?: string;
    needsCertificate?: boolean;
    progress?: {
      docsReady?: boolean;
      docsHanded?: boolean;
      docsReceived?: boolean;
      docsSent?: boolean;
      requestSent?: boolean;
    };
  };
  medicalCertificate: {
    required: boolean;
    type?: string;
    deadline?: string;
    status: '未' | '進' | '済';
    renewalType?: '新規' | '更新';
    doctor?: '院長' | '山中先生';
    staff?: '竹下先生' | '木村先生' | '山形先生';
    fileUrl?: string;
    files?: Array<{
      id: string;
      name: string;
      uploadedAt: string;
      url: string;
    }>;
  };
  municipality?: '鹿' | '姶良' | '霧島' | '鹿屋' | '奄美';
  status: PatientStatus;
  chartProcessing: {
    preProcessing: boolean;
    postProcessing: boolean;
  };
  processingDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  applicationDate?: string;
}

export interface PatientLog {
  id: string;
  patientId: string;
  action: string;
  userId: string;
  userName: string;
  timestamp: string;
  details?: string;
}

export interface LifeInsuranceRecord {
  id: string;
  patientId: string;
  year: number;
  month: number;
  insuranceType: InsuranceType;
  patientName: string;
  certificateFee: number;
  certificateType: string;
  municipality: '鹿児島市' | 'いちき串木野市';
  claimDate: string;
  difference: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  claimRecipient?: string;
}