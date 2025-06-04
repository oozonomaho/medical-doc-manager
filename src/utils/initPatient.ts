
import { Patient, InsuranceType, PatientStatus } from '../types/patient';

const emptyMedicalCertificate = () => ({
  needsCertificate: false,
  progress: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const emptyCertificateStatus = () => ({
  status: 'ACTIVE',
});

export function createEmptyPatient(): Patient {
  return {
    id: crypto.randomUUID(),
    name: '',
    nameKana: '',
    chartNumber: '',
    insuranceType: '' as InsuranceType,
    selfSupportStatus: emptyCertificateStatus(),
    selfSupportMedicalCertificate: emptyMedicalCertificate(),
    disabilityStatus: emptyCertificateStatus(),
    disabilityMedicalCertificate: emptyMedicalCertificate(),
    pensionStatus: emptyCertificateStatus(),
    pensionMedicalCertificate: emptyMedicalCertificate(),
    medicalCertificate: {},
    status: 'APPLYING' as PatientStatus,
    chartProcessing: {
      preProcessing: false,
      postProcessing: false,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
