import React, { createContext, useContext, useState } from 'react';
import { Patient, LifeInsuranceRecord } from '../types/patient';
import { useEffect } from 'react';
import { MedicalCertificate } from '../types/certificate'; //

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
  getLifeInsuranceRecords: () => Promise<void>;
  saveLifeInsuranceRecord: (record: LifeInsuranceRecord) => Promise<void>;
  updateLifeInsuranceRecordAPI: (id: string, updates: Partial<LifeInsuranceRecord>) => Promise<void>;
  deleteLifeInsuranceRecord: (id: string) => Promise<void>;
  medicalCertificates: MedicalCertificate[];
getCertificates: () => Promise<MedicalCertificate[]>;
 getCertificatesDirect: (patientId: string) => Promise<MedicalCertificate[]>; 
createOrUpdateCertificate: (certificate: MedicalCertificate) => Promise<void>;
  updateCertificate: (id: string, certificate: Partial<MedicalCertificate>) => Promise<void>;
  deleteCertificate: (id: string) => Promise<void>;
  loadPatientsWithCertificates: () => Promise<void>;

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
const [patients, setPatients] = useState<Patient[]>([]);
 const [medicalCertificates, setMedicalCertificates] = useState<MedicalCertificate[]>([]);
const [activePatients, setActivePatients] = useState<Patient[]>([]);
const [stoppedPatients, setStoppedPatients] = useState<Patient[]>([]);
  const [lifeInsuranceRecords, setLifeInsuranceRecords] = useState<LifeInsuranceRecord[]>([]);
  const [pendingClaims, setPendingClaims] = useState<PendingClaim[]>([]);
  const [insuranceChanges, setInsuranceChanges] = useState<InsuranceChangeRecord[]>([]);
  const loadPatientsWithCertificates = async () => {
    console.log('🔵 loadPatientsWithCertificates 呼び出し');

  const certs = await getCertificates();

  const res = await fetch(`${API_BASE_URL}/patients`);
  const data: Patient[] = await res.json();

  console.log('🟦 DB患者データ取得:', data);
  console.log('🟩 現在のmedicalCertificates:', certs);

const enriched = data.map((patient) => { 
  const getCert = (type: string) =>
    certs.find(cert => cert.patientId === patient.id && cert.type === type);

  const result = {
    ...patient,
    selfSupportMedicalCertificate: getCert('自立支援') ?? patient.selfSupportMedicalCertificate,
    disabilityMedicalCertificate: getCert('手帳') ?? patient.disabilityMedicalCertificate,
    pensionMedicalCertificate: getCert('年金') ?? patient.pensionMedicalCertificate,
  };

  console.log(`🟨 enriched[${patient.name}]`, {
    id: patient.id,
    自立支援: result.selfSupportMedicalCertificate,
    手帳: result.disabilityMedicalCertificate,
    年金: result.pensionMedicalCertificate
  });

  return result;
});



  setPatients(enriched);
  console.log('🟩 setPatients 実行完了。件数:', enriched.length);

  setActivePatients(enriched.filter(p => p.status !== 'TRANSFERRED' && p.status !== 'STOPPED'));
  setStoppedPatients(enriched.filter(p => p.status === 'TRANSFERRED' || p.status === 'STOPPED'));
};

useEffect(() => {
  loadPatientsWithCertificates();
}, []); 

useEffect(() => {
  console.log('🟧 patients変更:', patients);
}, [patients]);








  const getLifeInsuranceRecords = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/life-insurance`);
      const data = await res.json();
      setLifeInsuranceRecords(data);
    } catch (err) {
      console.error('生保データの取得に失敗しました', err);
    }
  };
  
  const saveLifeInsuranceRecord = async (record: LifeInsuranceRecord) => {
    try {
      const res = await fetch(`${API_BASE_URL}/life-insurance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error || '保存失敗');
      await getLifeInsuranceRecords();
    } catch (err) {
      console.error('生保データの保存に失敗:', err);
    }
  };
  const updateLifeInsuranceRecordAPI = async (id: string, updates: Partial<LifeInsuranceRecord>) => {
    try {
      const res = await fetch(`${API_BASE_URL}/life-insurance/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error || '更新失敗');
      await getLifeInsuranceRecords();
    } catch (err) {
      console.error('生保データの更新に失敗:', err);
    }
  };
  const deleteLifeInsuranceRecord = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/life-insurance/${id}`, {
        method: 'DELETE'
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error || '削除失敗');
      await getLifeInsuranceRecords();
    } catch (err) {
      console.error('生保データの削除に失敗:', err);
    }
  };
  

const getCertificates = async (patientId?: string): Promise<MedicalCertificate[]> => {
  try {
    const url = patientId
      ? `${API_BASE_URL}/certificates?patientId=${patientId}`
      : `${API_BASE_URL}/certificates`;

    const res = await fetch(url);
    const data = await res.json();

    console.log('🟥 certificates GET直後:', data);
    setMedicalCertificates(data); // フィルタ後でもOK、共通stateとして管理してるならこれでOK
    return data;
  } catch (err) {
    console.error('診断書の取得に失敗しました', err);
    return [];
  }
};
const getCertificatesDirect = async (patientId: string): Promise<MedicalCertificate[]> => {
  try {
    const url = `${API_BASE_URL}/certificates?patientId=${patientId}`;
    const res = await fetch(url);
    return await res.json();
  } catch (err) {
    console.error('診断書の取得に失敗しました', err);
    return [];
  }
};


const createOrUpdateCertificate = async (certificate: MedicalCertificate) => {
  console.log('📤 createOrUpdateCertificate 呼び出し:', certificate);
  console.log('📦 progressの中身:', certificate.progress);
  console.log('🟩 requestSentチェック:', certificate.progress?.requestSent);
  
  const latestCertificates = await getCertificatesDirect(certificate.patientId); 
  console.log('📋 最新の証明書リスト:', latestCertificates);
const isUpdate = latestCertificates.some(c =>
  c.id === certificate.id &&
  (
    c.applicationDate ||
    c.completionDate ||
    c.initialStartDate ||
    c.startDate ||
    c.validFrom ||
    c.validUntil ||
    c.status ||
    c.grade ||
    c.limitAmount ||
    c.needsCertificate ||
    c.sendDate ||
    (c.progress && Object.keys(c.progress).length > 0)
  )
);


  console.log('[createOrUpdateCertificate] isUpdate:', isUpdate);

  const url = isUpdate
    ? `${API_BASE_URL}/certificates/${certificate.id}`
    : `${API_BASE_URL}/certificates`;
  const method = isUpdate ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(certificate),
    });

    const result = await res.json();
    console.log(`✅ ${method} 成功:`, result);
    if (!result.success) throw new Error(result.error || '保存失敗');

    await getCertificates(certificate.patientId); // stateに再反映
  } catch (err) {
    console.error('❌ 診断書の保存/更新エラー:', err);
  }
};


  
  const updateCertificate = async (id: string, certificate: Partial<MedicalCertificate>) => {
    try {
      const res = await fetch(`${API_BASE_URL}/certificates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(certificate)
      });
  
      const result = await res.json();
      if (!result.success) throw new Error(result.error || '更新失敗');
      await getCertificates(); // 更新後に再取得
    } catch (err) {
      console.error('診断書の更新エラー:', err);
    }
  };

  
  const deleteCertificate = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/certificates/${id}`, {
        method: 'DELETE'
      });
  
      const result = await res.json();
      if (!result.success) throw new Error(result.error || '削除失敗');
      await getCertificates(); // 削除後に再取得
    } catch (err) {
      console.error('診断書の削除エラー:', err);
    }
  };
  
  const moveToStopList = (patientIds: string[]) => {
    const now = new Date().toISOString();
    const patientsToMove = activePatients.filter(p => patientIds.includes(p.id));
  
    const updatedStoppedPatients = patientsToMove.map(patient => ({
      ...patient,
      status: 'STOPPED' as const,
      stoppedAt: now,        
      updatedAt: now
    }));
  
    // APIに保存
    updatedStoppedPatients.forEach(updatePatient);
  
    // ローカル状態も更新
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
      claimRecipient: '',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      claimStatus: false // ← 明示的に追加しとくとベター
    }));
  
    // 保存処理（非同期）
    newRecords.forEach(saveLifeInsuranceRecord);
  
    // ローカルにも一応反映
    setLifeInsuranceRecords(prev => [...prev, ...newRecords]);
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

  const updatePatient = async (updated: Patient) => {
     console.log('🟦 updatePatient呼び出し:', updated);
    try {
      const res = await fetch(`${API_BASE_URL}/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updated)
      });
  
      if (!res.ok) {
        console.error('保存に失敗しました');
        return;
      }
  
      // 👇 ここでレスポンスを受け取って使うとGood！
      const saved = await res.json(); 
     console.log('サーバから返ってきた値:', saved); // ← API側も res.json({ success: true, patient }) と返すようにしてね
      const updatedPatient = saved.patient || updated;
  

    // ✅ ローカル状態を更新！
setPatients((prev) => {
  console.log('[updatePatient] setPatients関数開始 prev:', prev);

  if (prev.some((p) => p.id === updatedPatient.id)) {
    // 上書き
    const updated = prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p));
    console.log('[updatePatient] 上書きで更新:', updated);
    return updated;
  } else {
    // 新規追加
    const appended = [...prev, updatedPatient];
    console.log('[updatePatient] 追加で更新:', appended);
    return appended;
  }
});
console.log('🟦 setPatients後のpatients:', patients); // ★追加（ただしuseStateの反映は非同期なので注意）
setTimeout(() => console.log('🟪 patients最新:', patients), 200);

    setActivePatients((prev) =>
      prev.some((p) => p.id === updatedPatient.id)
        ? prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p))
        : [...prev, updatedPatient]
    );

    setStoppedPatients((prev) =>
      prev.some((p) => p.id === updatedPatient.id)
        ? prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p))
        : prev
    );
  
    } catch (err) {
      console.error('通信エラー:', err);
    }
  }; 
  
  const updateLifeInsuranceRecord = (updatedRecord: LifeInsuranceRecord) => {
    setLifeInsuranceRecords(records =>
      records.map(r => r.id === updatedRecord.id ? updatedRecord : r)
    );
  };

  const deletePatients = async (patientIds: string[]) => {
    // サーバーに削除リクエストを送る
    for (const id of patientIds) {
      try {
        const res = await fetch(`${API_BASE_URL}/patients/${id}`, {
          method: 'DELETE'
        });
  
        if (!res.ok) {
          console.error(`患者 ${id} の削除に失敗しました`);
        }
      } catch (err) {
        console.error(`患者 ${id} の通信エラー:`, err);
      }
    }
  
    // ローカル状態も更新
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
      deleteFileForPatient,
      medicalCertificates,
      getCertificates,
      getCertificatesDirect, 
      createOrUpdateCertificate,
      updateCertificate,
      deleteCertificate,
getLifeInsuranceRecords,
saveLifeInsuranceRecord,
updateLifeInsuranceRecordAPI,
deleteLifeInsuranceRecord,
loadPatientsWithCertificates,


    }}>
      {children}
    </PatientContext.Provider>
  );
};