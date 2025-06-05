import { Patient, PatientLog } from '../types/patient';
import { InsuranceType, PatientStatus } from '../types/enums';

export const samplePatients: Patient[] = [
  {
    id: '1',
    name: '山田 太郎',
    nameKana: 'ヤマダ タロウ',
    chartNumber: 'CH001',
    insuranceType: InsuranceType.EMPLOYEE_SELF,
    selfSupportStatus: {
      hasSupport: true,
      validUntil: '2025-03-31T00:00:00Z',
      initialStartDate: '2023-04-01T00:00:00Z',
      validFrom: '2023-04-01T00:00:00Z',
      status: 'ACTIVE',
      applicationDate: '2024-03-15T00:00:00Z',
      renewalType: '新規',
      needsCertificate: true,
      limitAmount: '5000円',
      progress: {
        docsReady: true,
        docsHanded: true,
        docsReceived: false,
        docsSent: false,
        requestSent: true
      }
    },
    disabilityStatus: {
      hasDisability: true,
      grade: '2級',
      validUntil: '2025-03-31T00:00:00Z',
      initialStartDate: '2023-04-01T00:00:00Z',
      validFrom: '2023-04-01T00:00:00Z',
      status: 'APPLYING',
      applicationDate: '2024-03-15T00:00:00Z',
      renewalType: '作成保留',
      needsCertificate: false,
      progress: {
        docsReady: true,
        docsHanded: true,
        docsReceived: true,
        docsSent: true,
        requestSent: true
      },
      sendDate: '2024-03-01T00:00:00Z'
    },
    pensionStatus: {
      hasPension: true,
      grade: '2級',
      validUntil: '2025-03-31T00:00:00Z',
      initialStartDate: '2023-04-01T00:00:00Z',
      validFrom: '2023-04-01T00:00:00Z',
      status: 'STOPPED',
      applicationDate: null,
      needsCertificate: true,
      progress: {
        docsReady: true,
        docsHanded: true,
        docsReceived: true,
        docsSent: true,
        requestSent: false
      },
      sendDate: '2024-03-01T00:00:00Z'
    },
    medicalCertificate: {
      required: true,
      type: '自立支援＋手帳',
      deadline: '2024-04-30T00:00:00Z',
      status: '進',
      renewalType: '新規',
      doctor: '院長',
      staff: '竹下先生',
      files: [
        {
          id: 'file1',
          name: '診断書_20240315.pdf',
          uploadedAt: '2024-03-15T00:00:00Z',
          url: 'https://example.com/files/file1.pdf'
        }
      ]
    },
    municipality: '鹿',
    status: PatientStatus.APPLYING,
    chartProcessing: {
      preProcessing: true,
      postProcessing: false
    },
    processingDate: '2024-03-15T00:00:00Z',
    notes: '次回の診察時に書類を渡す予定',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-03-15T00:00:00Z'
  },
  {
    id: '2',
    name: '鈴木 花子',
    nameKana: 'スズキ ハナコ',
    chartNumber: 'CH002',
    insuranceType: InsuranceType.EMPLOYEE_FAMILY,
    selfSupportStatus: {
      hasSupport: false,
      status: 'ACTIVE',
      needsCertificate: false,
      progress: {
        requestSent: false
      }
    },
    disabilityStatus: {
      hasDisability: true,
      grade: '1級',
      validUntil: '2024-09-30T00:00:00Z',
      initialStartDate: '2022-10-01T00:00:00Z',
      validFrom: '2022-10-01T00:00:00Z',
      status: 'ACTIVE',
      applicationDate: '2024-03-10T00:00:00Z',
      renewalType: '作成保留',
      needsCertificate: true,
      progress: {
        docsReady: false,
        docsHanded: false,
        docsReceived: false,
        docsSent: false,
        requestSent: true
      }
    },
    pensionStatus: {
      hasPension: false,
      status: 'ACTIVE',
      needsCertificate: false,
      progress: {
        requestSent: false
      }
    },
    medicalCertificate: {
      required: true,
      type: '手帳',
      deadline: '2024-08-31T00:00:00Z',
      status: '未',
      renewalType: '作成保留',
      doctor: '山中先生',
      staff: '木村先生'
    },
    municipality: '姶良',
    status: PatientStatus.DOCS_HANDED,
    chartProcessing: {
      preProcessing: true,
      postProcessing: true
    },
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-03-10T00:00:00Z'
  },
  {
    id: '3',
    name: '佐藤 一郎',
    nameKana: 'サトウ イチロウ',
    chartNumber: 'CH003',
    insuranceType: InsuranceType.LIFE,
    selfSupportStatus: {
      hasSupport: true,
      validUntil: '2024-12-31T00:00:00Z',
      initialStartDate: '2022-01-01T00:00:00Z',
      validFrom: '2024-01-01T00:00:00Z',
      status: 'APPLYING',
      applicationDate: '2024-03-01T00:00:00Z',
      renewalType: '新規',
      needsCertificate: true,
      limitAmount: '2500円',
      progress: {
        docsReady: true,
        docsHanded: false,
        docsReceived: false,
        docsSent: false,
        requestSent: true
      }
    },
    disabilityStatus: {
      hasDisability: true,
      grade: '3級',
      validUntil: '2024-12-31T00:00:00Z',
      initialStartDate: '2022-01-01T00:00:00Z',
      validFrom: '2024-01-01T00:00:00Z',
      status: 'ACTIVE',
      applicationDate: '2024-03-01T00:00:00Z',
      renewalType: '新規',
      needsCertificate: true,
      progress: {
        docsReady: true,
        docsHanded: true,
        docsReceived: true,
        docsSent: true,
        requestSent: true
      },
      sendDate: '2024-01-15T00:00:00Z'
    },
    pensionStatus: {
      hasPension: false,
      status: 'ACTIVE',
      needsCertificate: false,
      progress: {
        requestSent: false
      }
    },
    medicalCertificate: {
      required: true,
      type: '自立支援＋手帳',
      status: '済',
      renewalType: '更新',
      doctor: '院長',
      staff: '山形先生'
    },
    municipality: '霧島',
    status: PatientStatus.DOCS_RECEIVED,
    chartProcessing: {
      preProcessing: true,
      postProcessing: false
    },
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z'
  }
];

export const sampleLogs: PatientLog[] = [
  {
    id: '1',
    patientId: '1',
    action: '患者情報更新',
    userId: 'user1',
    userName: '医師 一郎',
    timestamp: '2024-03-15T10:30:00Z',
    details: '診断書の提出期限を更新'
  },
  {
    id: '2',
    patientId: '2',
    action: '書類渡し済に変更',
    userId: 'user2',
    userName: '事務 二郎',
    timestamp: '2024-03-10T15:45:00Z',
    details: '傷病手当金申請書類を患者に手渡し'
  },
  {
    id: '3',
    patientId: '3',
    action: '書類受取済に変更',
    userId: 'user1',
    userName: '医師 一郎',
    timestamp: '2024-03-01T09:15:00Z',
    details: '自立支援医療更新用の書類を受領'
  }
];