import { InsuranceType, PatientStatus } from './enums';
import type { MedicalCertificate as Certificate } from './certificate';


export interface CertificateStatus {
  applicationDate?: string;
  completionDate?: string;
  startDate?: string;
  validFrom?: string;
  validUntil?: string;
  status: 'ACTIVE' | 'ONHOLD' | 'EXPIRED'; // ← 新構造
}

export { Certificate as MedicalCertificate };


export interface Patient {
  id: string;
  name: string | null;
  nameKana: string;
  chartNumber: string;
  insuranceType: InsuranceType;

  selfSupportStatus: CertificateStatus;
  selfSupportMedicalCertificate: MedicalCertificate;

  disabilityStatus: CertificateStatus;
  disabilityMedicalCertificate: MedicalCertificate;

  pensionStatus: CertificateStatus;
  pensionMedicalCertificate: MedicalCertificate;

  medicalCertificate: {
    doctor?: '院長' | '山中先生';
    staff?: '竹下先生' | '木村先生' | '山形先生';
    files?: Array<{
      id: string;
      name: string;
      uploadedAt: string;
      url: string;
    }>;
  };

  municipality?: '鹿' | '姶良' | '霧島' | '鹿屋' | '奄美';
  status: PatientStatus;
  stoppedAt?: string;

  chartProcessing: {
    preProcessing: boolean;
    postProcessing: boolean;
  };
  processingDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
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
  claimStatus?: boolean;
}