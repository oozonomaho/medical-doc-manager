import React, { createContext, useContext, useState } from 'react';
import { Patient, LifeInsuranceRecord } from '../types/patient';
import { useEffect } from 'react';


interface PendingClaim {
  id: string;
  patientId: string;
  patientName: string;
  patientNameKana?: string;
  chartNumber?: string;
  claimDate: string;
  insuranceType: string;
  reason: string;
  status: '保留中' | '完了';
  notes: string;
}

interface InsuranceChangeRecord {
  id: string;
  patientId: string;
  chartNumber: string;
  patientName: string;
  oldInsurance: string;
  newInsurance: string;
  changeDate: string;
  status: '書類渡し済み' | '変更済み' | '未対応';
  notes?: string;
}

interface PatientContextType {
  patients: Patient[]; 
  activePatients: Patient[];
  stoppedPatients: Patient[];
  lifeInsuranceRecords: LifeInsuranceRecord[];
  pendingClaims: PendingClaim[];
  insuranceChanges: InsuranceChangeRecord[];
  moveToStopList: (patientIds: string[]) => void;
  moveToActiveList: (patientIds: string[]) => void;
  moveToLifeInsurance: (patientIds: string[]) => void;
  moveToPendingClaims: (patientIds: string[]) => void;
  removePendingClaims: (claimIds: string[]) => void;
  addPendingClaim: (claim: PendingClaim) => void;
  updatePendingClaim: (claim: PendingClaim) => void;
  updatePatient: (patient: Patient) => void;
  updateLifeInsuranceRecord: (record: LifeInsuranceRecord) => void;
  deletePatients: (patientIds: string[]) => void;
  addInsuranceChange: (record: InsuranceChangeRecord) => void;
  updateInsuranceChange: (record: InsuranceChangeRecord) => void;
  uploadFileForPatient: (file: File, patientId: string) => void;
  deleteFileForPatient: (fileId: string, patientId: string) => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const usePatients = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatients must be used within a PatientProvider');
  }
  return context;
};

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

useEffect(() => {
  fetch('http://localhost:3001/patients')
    .then((res) => res.json())
    .then((data: Patient[]) => {
      setPatients(data);

      // status によって振り分け
      const active = data.filter(p => p.status !== 'TRANSFERRED' && p.status !== 'STOPPED');
      const stopped = data.filter(p => p.status === 'TRANSFERRED' || p.status === 'STOPPED');
      setActivePatients(active);
      setStoppedPatients(stopped);
    })
    .catch((err) => console.error('API取得エラー:', err));
}, []);

const [patients, setPatients] = useState<Patient[]>([]);

const [activePatients, setActivePatients] = useState<Patient[]>([]);
const [stoppedPatients, setStoppedPatients] = useState<Patient[]>([]);

  const [lifeInsuranceRecords, setLifeInsuranceRecords] = useState<LifeInsuranceRecord[]>([]);
  const [pendingClaims, setPendingClaims] = useState<PendingClaim[]>([]);
  const [insuranceChanges, setInsuranceChanges] = useState<InsuranceChangeRecord[]>([]);

  const moveToStopList = (patientIds: string[]) => {
    const now = new Date().toISOString();
    const patientsToMove = activePatients.filter(p => patientIds.includes(p.id));
    
    const updatedStoppedPatients = patientsToMove.map(patient => ({
      ...patient,
      status: 'TRANSFERRED' as const,
      updatedAt: now
    }));

    setStoppedPatients([...stoppedPatients, ...updatedStoppedPatients]);
    setActivePatients(activePatients.filter(p => !patientIds.includes(p.id)));
  };

  const moveToActiveList = (patientIds: string[]) => {
    const now = new Date().toISOString();
    const patientsToMove = stoppedPatients.filter(p => patientIds.includes(p.id));
    
    const updatedActivePatients = patientsToMove.map(patient => ({
      ...patient,
      status: 'APPLYING' as const,
      updatedAt: now
    }));

    setActivePatients([...activePatients, ...updatedActivePatients]);
    setStoppedPatients(stoppedPatients.filter(p => !patientIds.includes(p.id)));
  };

  const moveToLifeInsurance = (patientIds: string[]) => {
    const now = new Date();
    const patientsToMove = activePatients.filter(p => patientIds.includes(p.id));
    
    const newRecords = patientsToMove.map(patient => ({
      id: `record-${Date.now()}-${patient.id}`,
      patientId: patient.id,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      insuranceType: patient.insuranceType,
      patientName: patient.name,
      certificateFee: 0,
      certificateType: patient.medicalCertificate.type || '',
      municipality: '鹿児島市',
      claimDate: now.toISOString().split('T')[0],
      difference: 0,
      notes: '',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }));

    setLifeInsuranceRecords([...lifeInsuranceRecords, ...newRecords]);
  };

  const moveToPendingClaims = (patientIds: string[]) => {
    const now = new Date();
    const patientsToMove = activePatients.filter(p => patientIds.includes(p.id));
    
    const newClaims = patientsToMove.map(patient => ({
      id: `claim-${Date.now()}-${patient.id}`,
      patientId: patient.id,
      patientName: patient.name,
      patientNameKana: patient.nameKana,
      chartNumber: patient.chartNumber,
      claimDate: now.toISOString().split('T')[0],
      insuranceType: patient.insuranceType,
      reason: '',
      status: '保留中' as const,
      notes: ''
    }));

    setPendingClaims([...pendingClaims, ...newClaims]);
  };

  const removePendingClaims = (claimIds: string[]) => {
    setPendingClaims(claims => claims.filter(claim => !claimIds.includes(claim.id)));
  };

  const addPendingClaim = (claim: PendingClaim) => {
    setPendingClaims([...pendingClaims, claim]);
  };

  const updatePendingClaim = (updatedClaim: PendingClaim) => {
    setPendingClaims(claims =>
      claims.map(claim => claim.id === updatedClaim.id ? updatedClaim : claim)
    );
  };

  const updatePatient = (updated: Patient) => {
    setActivePatients((prev) => {
      const exists = prev.some((p) => p.id === updated.id);
      const updatedList = exists
        ? prev.map((p) => (p.id === updated.id ? updated : p))
        : [updated, ...prev];
  
      return updatedList;
    });
  
    setPatients((prev) => {
      const exists = prev.some((p) => p.id === updated.id);
      const updatedList = exists
        ? prev.map((p) => (p.id === updated.id ? updated : p))
        : [updated, ...prev];
  
      return updatedList;
    });
  };
  
  const updateLifeInsuranceRecord = (updatedRecord: LifeInsuranceRecord) => {
    setLifeInsuranceRecords(records =>
      records.map(r => r.id === updatedRecord.id ? updatedRecord : r)
    );
  };

  const deletePatients = (patientIds: string[]) => {
    setActivePatients(patients => patients.filter(p => !patientIds.includes(p.id)));
  };

  const addInsuranceChange = (record: InsuranceChangeRecord) => {
    setInsuranceChanges(prev => [...prev, record]);
  };

  const updateInsuranceChange = (updatedRecord: InsuranceChangeRecord) => {
    setInsuranceChanges(records =>
      records.map(record => record.id === updatedRecord.id ? updatedRecord : record)
    );
  };

  const uploadFileForPatient = (file: File, patientId: string) => {
    const patient = activePatients.find(p => p.id === patientId);
    if (!patient) return;

    const newFile = {
      id: crypto.randomUUID(),
      name: file.name,
      uploadedAt: new Date().toISOString(),
      url: URL.createObjectURL(file),
    };

    const updatedPatient = { ...patient };
    updatedPatient.medicalCertificate.files = [
      ...(updatedPatient.medicalCertificate.files || []),
      newFile,
    ];
    updatedPatient.updatedAt = new Date().toISOString();

    updatePatient(updatedPatient);
  };

  const deleteFileForPatient = (fileId: string, patientId: string) => {
    const patient = activePatients.find(p => p.id === patientId);
    if (!patient) return;

    const updatedPatient = { ...patient };
    updatedPatient.medicalCertificate.files =
      updatedPatient.medicalCertificate.files?.filter(f => f.id !== fileId) || [];
    updatedPatient.updatedAt = new Date().toISOString();

    updatePatient(updatedPatient);
  };

  return (
    <PatientContext.Provider value={{
      patients,
      activePatients,
      stoppedPatients,
      lifeInsuranceRecords,
      pendingClaims,
      insuranceChanges,
      moveToStopList,
      moveToActiveList,
      moveToLifeInsurance,
      moveToPendingClaims,
      removePendingClaims,
      addPendingClaim,
      updatePendingClaim,
      updatePatient,
      updateLifeInsuranceRecord,
      deletePatients,
      addInsuranceChange,
      updateInsuranceChange,
      uploadFileForPatient,
      deleteFileForPatient
    }}>
      {children}
    </PatientContext.Provider>
  );
};