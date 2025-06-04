import React, { useState, useEffect } from 'react';
import { X, Settings } from 'lucide-react';
import { Patient } from '../types/patient';
import EditableCell from './EditableCell';
import { usePatients } from '../context/PatientContext';
import { createEmptyPatient } from '../utils/initPatient';


type CardType = 'selfSupport' | 'disability' | 'pension';

interface CertificateDetailsModalProps {
  patient: Patient;
  onClose: () => void;
  onUpdate: (updatedPatient: Patient) => void;
}

interface TransitionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
}



const gradeOptions = ['1級', '2級', '3級'] as const;
const baseStatusTypes = {
  ACTIVE: '適用中',
  STOPPED: '停止'
} as const;

const selfSupportStatusTypes = {
  ...baseStatusTypes,
  ONHOLD: '保留中'
} as const;

const limitAmounts = ['2500円', '5000円', '10000円'] as const;

const TransitionConfirmModal: React.FC<TransitionConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">{title}の更新管理</h3>
        <p className="mb-6">更新管理へ移行しますか？</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            はい
          </button>
        </div>
      </div>
    </div>
  );
};

const UpdateManagementCard: React.FC<{
  title: string;
  status: CertificateStatus;
  medical: MedicalCertificate;
  cardType: 'selfSupport' | 'disability' | 'pension';
  onChange: (
    target: 'status' | 'medical',
    field: string,
    value: string | null
  ) => void;
  onProgressChange: (field: keyof MedicalCertificate['progress']) => void;
showSettings: boolean;
onToggleSettings: () => void;
onSwitchToNewApplication: () => void; 
  showGrade?: boolean;
}> = ({ title, status, medical, cardType, onChange, onProgressChange, showGrade,showSettings, onToggleSettings,onSwitchToNewApplication }) => {
  const statusOptions = cardType === 'selfSupport'
    ? Object.values(selfSupportStatusTypes)
    : Object.values(baseStatusTypes);

  const bgColor = (() => {
    switch (status?.status) {
      case 'APPLYING': return 'bg-yellow-50';
      case 'ACTIVE': return 'bg-green-50';
      case 'ONHOLD': return 'bg-orange-50';
      case 'STOPPED': return 'bg-gray-100';
      default: return 'bg-white';
    }
  })();

  return (
    <div className={`p-4 rounded-lg ${bgColor}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">{title}</h3>

        <div className="flex items-center space-x-2">
          {showGrade && (
            <EditableCell
              value={medical?.grade || ''}
              onChange={(value) => {
                console.log('[UpdateManagementCard] EditableCell→onChange:', {
                  target: 'medical', field: 'grade', value });
                onChange('medical', 'grade', value);
              }}
              type="select"
              options={gradeOptions}
              placeholder="等級"
              className="w-16"
              allowEmpty
            />
          )}

          <EditableCell
            value={status?.status ? (
              cardType === 'selfSupport'
                ? selfSupportStatusTypes[status.status]
                : baseStatusTypes[status.status]
            ) : ''}
            onChange={(value) => {
              if (value === '' || value === null) {
                onChange('status', 'status', undefined);
              } else {
                const key = cardType === 'selfSupport'
                  ? Object.entries(selfSupportStatusTypes).find(([_, v]) => v === value)?.[0]
                  : Object.entries(baseStatusTypes).find(([_, v]) => v === value)?.[0];
                if (key) onChange('status', 'status', key);
              }
            }}
            type="select"
            options={[...statusOptions]}
            placeholder="状態"
            className="w-24"
            allowEmpty
          />

          <div className="relative">
            <button
              onClick={onToggleSettings}
              className="text-gray-500 hover:text-gray-700"
            >
              <Settings className="h-5 w-5" />
            </button>
            {showSettings && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                <button
                  onClick={onSwitchToNewApplication}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  新規申請に戻る
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-gray-600 text-sm mb-1">初回利用開始日</label>
            <EditableCell
              value={medical?.initialStartDate?.split('T')[0] || ''}
              onChange={(value) => onChange('medical', 'initialStartDate', value)}
              type="date"
              className="w-full"
              allowEmpty
            />
          </div>
          {cardType === 'selfSupport' && (
            <div>
              <label className="block text-gray-600 text-sm mb-1">限度額</label>
              <EditableCell
                value={medical?.limitAmount || ''}
                onChange={(value) => onChange('medical', 'limitAmount', value)}
                type="select"
                options={limitAmounts}
                placeholder="限度額"
                className="w-32"
                allowEmpty
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-gray-600 text-sm mb-1">有効期限</label>
          <div className="flex items-center space-x-2">
            <EditableCell
              value={medical?.validFrom?.split('T')[0] || ''}
              onChange={(value) => onChange('medical', 'validFrom', value)}
              type="date"
              className="w-full"
              allowEmpty
              placeholder="開始日"
            />
            <span className="text-gray-500">～</span>
            <EditableCell
              value={medical?.validUntil?.split('T')[0] || ''}
              onChange={(value) => onChange('medical', 'validUntil', value)}
              type="date"
              className="w-full"
              allowEmpty
              placeholder="終了日"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-600 text-sm mb-1">診断書</label>
          <EditableCell
            value={medical?.needsCertificate ? '要' : '不要'}
            onChange={(value) => onChange('medical', 'needsCertificate', value)}
            type="select"
            options={['要', '不要']}
            className="w-full"
            allowEmpty
          />
        </div>

        <div>
          <label className="block text-gray-600 text-sm mb-1">書類進捗</label>
          <div className="space-y-2">
            {(['docsReady', 'docsHanded', 'docsReceived', 'docsSent'] as const).map((field) => (
              <label key={field} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={medical?.progress?.[field] || false}
                  onChange={() =>{  console.log(`🟩 チェックされた: ${field}`);
                     onProgressChange(field)}}
                    
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  {{
                    docsReady: '書類準備済み',
                    docsHanded: '書類渡し済み',
                    docsReceived: '書類受け取り済み',
                    docsSent: '送付済み'
                  }[field]}
                </span>
              </label>
            ))}
            {medical?.progress?.docsSent && (
              <div className="mt-2">
                <label className="block text-gray-600 text-sm mb-1">送付日</label>
                <EditableCell
                  value={medical?.sendDate?.split('T')[0] || ''}
                  onChange={(value) => onChange('medical', 'sendDate', value)}
                  type="date"
                  className="w-full"
                  allowEmpty
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    );
};

const NewApplicationCard: React.FC<{
  title: string;
  status: CertificateStatus;
  medical: MedicalCertificate;
  cardType: CardType;
  onChange: (
    target: 'status' | 'medical',
    field: string,
    value: string | null
  ) => void;
  onProgressChange: (field: keyof MedicalCertificate['progress']) => void;
  showSettings: boolean;
  onToggleSettings: () => void;
  onSwitchToUpdate: () => void;
}> = ({
  title,
  status,
  medical,
  cardType,
  onChange,
  onProgressChange,
  showSettings,
  onToggleSettings,
  onSwitchToUpdate
}) => (
  <div className="p-4 rounded-lg border border-gray-200">
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-semibold">{title}</h3>
      <div className="relative">
        <button
          onClick={onToggleSettings}
          className="text-gray-500 hover:text-gray-700"
        >
          <Settings className="h-5 w-5" />
        </button>
        {showSettings && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
            <button
              onClick={onSwitchToUpdate}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              更新管理へ移行
            </button>
          </div>
        )}
      </div>
    </div>

    <div className="space-y-4">
      <div>
        <label className="block text-gray-600 text-sm mb-1">新規申請受付日</label>
        <EditableCell
          value={status?.applicationDate?.split('T')[0] || ''}
          onChange={(value) => onChange('status', 'applicationDate', value)}
          type="date"
          className="w-full"
          allowEmpty
        />
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={medical?.progress?.requestSent || false}
            onChange={() => onProgressChange('requestSent')}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">診断書作成依頼</span>
        </label>
      </div>

      <div>
        <label className="block text-gray-600 text-sm mb-1">新規申請完了日</label>
        <EditableCell
          value={status?.completionDate?.split('T')[0] || ''}
          onChange={(value) => onChange('status', 'completionDate', value)}
          type="date"
          className="w-full"
          allowEmpty
        />
      </div>
    </div>
  </div>
);

const CertificateDetailsModal: React.FC<CertificateDetailsModalProps> = ({ 
  patient, 
  onClose,
  onUpdate 

}) => {
  
const { getCertificates, medicalCertificates } = usePatients();



useEffect(() => {
  if (patient?.id) {
    getCertificates(patient.id); // この時点でmedicalCertificatesに患者の診断書が入る
  }
}, [patient?.id]);
useEffect(() => {
  if (patient?.id) {
    const certs = medicalCertificates.filter(cert => cert.patientId === patient.id);
    console.log(`📋 [${patient.name}]の診断書一覧:`, certs);
  }
}, [medicalCertificates, patient?.id]);



const empty = createEmptyPatient(); // createEmptyPatient は utils に定義済み

const normalizedPatient: Patient = {
  ...empty,
  ...patient, // propsで受け取ったpatient
  selfSupportStatus: patient.selfSupportStatus ?? empty.selfSupportStatus,
  selfSupportMedicalCertificate: patient.selfSupportMedicalCertificate ?? empty.selfSupportMedicalCertificate,
  disabilityStatus: patient.disabilityStatus ?? empty.disabilityStatus,
  disabilityMedicalCertificate: patient.disabilityMedicalCertificate ?? empty.disabilityMedicalCertificate,
  pensionStatus: patient.pensionStatus ?? empty.pensionStatus,
  pensionMedicalCertificate: patient.pensionMedicalCertificate ?? empty.pensionMedicalCertificate,
};

const { createOrUpdateCertificate, loadPatientsWithCertificates } = usePatients();
  const [cardStates, setCardStates] = useState({
    selfSupport: { isNewApplication: true, showSettings: false },
    disability: { isNewApplication: true, showSettings: false },
    pension: { isNewApplication: true, showSettings: false }
  });
    const [transitionConfirm, setTransitionConfirm] = useState<{
    isOpen: boolean;
    type: string;
    title: string;
  } | null>(null);


const handleDateChange = async (
  type: 'selfSupport' | 'disability' | 'pension',
  target: 'status' | 'medical',
  field: string,
  value: string | null
) => {
  console.log('🟧 CertificateDetailsModal.handleDateChange:', { type, target, field, value });

  const updatedPatient = { ...normalizedPatient };

  const certKey = `${type}MedicalCertificate` as keyof Patient;
  const statusKey = `${type}Status` as keyof Patient;

  const cert = updatedPatient[certKey] as MedicalCertificate;
  const status = updatedPatient[statusKey] as CertificateStatus;

  if (!cert) {
    console.warn('⚠️ certが存在しません:', certKey);
    return;
  }

  const formatted = value ? `${value}T00:00:00Z` : undefined;

  if (target === 'status') {
    (status as any)[field] = formatted ?? value ?? undefined;
    updatedPatient[statusKey] = status;
  } else if (target === 'medical') {
    if (field === 'needsCertificate') {
      cert.needsCertificate = value === '要';
    } else if (field === 'startDate') {
      cert.startDate = formatted ?? value ?? undefined;
    } else {
      (cert as any)[field] = formatted ?? value ?? undefined;
    }

    cert.updatedAt = new Date().toISOString();
  }

  try {
    console.log("🟢 onUpdate呼び出し直前");
    onUpdate(updatedPatient);
    console.log("🔴 onUpdate呼び出し直後");
  } catch (err) {
    console.error("🔥 onUpdate呼び出しで例外発生:", err);
  }

  const medicalCert: MedicalCertificate = {
    ...cert,
    id: `${normalizedPatient.id}-${type}`,
    patientId: normalizedPatient.id,
    type: (() => {
      if (type === 'selfSupport') return '自立支援';
      if (type === 'disability') return '手帳';
      return '年金';
    })(),
    needsCertificate: cert.needsCertificate,
    progress: cert.progress,
    sendDate: cert.sendDate,
    applicationDate: status?.applicationDate,
    completionDate: status?.completionDate,
    createdAt: cert.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  console.log('🔥 createOrUpdateCertificate呼び出し直前:', medicalCert);
  await createOrUpdateCertificate(medicalCert);
  console.log('[CertificateDetailsModal] createOrUpdateCertificate完了');

  await loadPatientsWithCertificates(); // ←これで画面にも反映されるようになる！
};


const handleProgressChange = async (
  type: 'selfSupport' | 'disability' | 'pension',
  field: keyof MedicalCertificate['progress']
) => {
   console.log(`📩 handleProgressChange 呼び出し: type=${type}, field=${field}`);
  const updatedPatient = { ...normalizedPatient };
  const key = `${type}MedicalCertificate` as keyof Patient;
  const statusKey = `${type}Status` as keyof Patient;

  const cert = updatedPatient[key];

if (!cert) {
  console.warn('⚠️ cert が undefined なので初期化するよ！');

  updatedPatient[key] = {
    id: `${normalizedPatient.id}-${type}`,
    patientId: normalizedPatient.id,
    type: (() => {
      if (type === 'selfSupport') return '自立支援';
      if (type === 'disability') return '手帳';
      return '年金';
    })(),
    progress: { [field]: true }, // ← 今押したやつは true にしておく
    needsCertificate: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  } as any; // MedicalCertificate 型に合わせてキャスト
  

  // 再取得
  createOrUpdateCertificate(updatedPatient[key] as MedicalCertificate);
   
  onUpdate(updatedPatient);
  return;
}


  const current = cert.progress || {};
  cert.progress = {
    ...current,
    [field]: !current[field]
  };
  cert.updatedAt = new Date().toISOString();

  onUpdate(updatedPatient);

  const medicalCert: MedicalCertificate = {
    ...cert,
    id: `${patient.id}-${type}`,
    patientId: patient.id,
    type: (() => {
      if (type === 'selfSupport') return '自立支援';
      if (type === 'disability') return '手帳';
      return '年金';
    })(),
    needsCertificate: cert.needsCertificate,
    progress: cert.progress,
    sendDate: cert.sendDate,
    applicationDate: status?.applicationDate,
    completionDate: status?.completionDate,
    createdAt: normalizedPatient.createdAt,
    updatedAt: new Date().toISOString()
  };
console.log('💡createOrUpdateCertificate呼び出し直前:', medicalCert);
  await createOrUpdateCertificate(medicalCert);
  console.log('[CertificateDetailsModal] createOrUpdateCertificate完了');
    await loadPatientsWithCertificates(); // ←追加！！
};


  
  
const handleTransitionConfirm = (type: 'selfSupport' | 'disability' | 'pension') => {
  const updatedPatient = { ...normalizedPatient};
  const statusKey = `${type}Status` as keyof Patient;

  if (updatedPatient[statusKey] && typeof updatedPatient[statusKey] === 'object') {
    (updatedPatient[statusKey] as CertificateStatus).status =
      type === 'selfSupport' ? '保留中' : '未更新';

    updatedPatient.updatedAt = new Date().toISOString();
   
    onUpdate(updatedPatient);
  }

  setCardStates(prev => ({
    ...prev,
    [type]: {
      isNewApplication: false,
      showSettings: false
    }
  }));
};
  const toggleView = (cardType: 'selfSupport' | 'disability' | 'pension') => {
    setCardStates(prev => ({
      ...prev,
      [cardType]: {
        ...prev[cardType],
        isNewApplication: !prev[cardType].isNewApplication,
        showSettings: false
      }
    }));
  };

 const toggleCardSettings = (type: 'selfSupport' | 'disability' | 'pension') => { 
    setCardStates(prev => ({ 
      ...prev,
      [type]: {
        ...prev[type],
        showSettings: !prev[type].showSettings
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-7xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {normalizedPatient.name}さんの証明書情報
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

<div className="grid grid-cols-3 gap-4">
  {cardStates.selfSupport.isNewApplication ? (
    <NewApplicationCard
      title="自立支援医療"
   status={normalizedPatient.selfSupportStatus}
  medical={normalizedPatient.selfSupportMedicalCertificate}
      cardType="selfSupport"
      onChange={(target, field, value) =>
        handleDateChange('selfSupport', target, field, value)
      }
      onProgressChange={(field) =>
        handleProgressChange('selfSupport', field)
      }
        showSettings={cardStates.selfSupport.showSettings} 
  onToggleSettings={() => toggleCardSettings('selfSupport')} 
  onSwitchToUpdate={() => toggleView('selfSupport')} // ✅ ここ
  
    />
  ) : (
    <UpdateManagementCard
      title="自立支援医療"
        status={normalizedPatient.selfSupportStatus}
     medical={normalizedPatient.selfSupportMedicalCertificate}
      cardType="selfSupport"
      onChange={(target, field, value) =>
        handleDateChange('selfSupport', target, field, value)
      }
      onProgressChange={(field) =>
        handleProgressChange('selfSupport', field)
      }
       showSettings={cardStates.selfSupport.showSettings} 
    onToggleSettings={() => toggleCardSettings('selfSupport')} 
    onSwitchToNewApplication={() => toggleView('selfSupport')} 
    />
  )}

  {cardStates.disability.isNewApplication ? (
    <NewApplicationCard
      title="障害者手帳"
      status={normalizedPatient.disabilityStatus}
      medical={normalizedPatient.disabilityMedicalCertificate}
      cardType="disability"
      onChange={(target, field, value) =>
        handleDateChange('disability', target, field, value)
      }
      onProgressChange={(field) =>
        handleProgressChange('disability', field)
      }
      showSettings={cardStates.disability.showSettings}
onToggleSettings={() => toggleCardSettings('disability')}
onSwitchToUpdate={() => toggleView('disability')} 

    />
  ) : (
    <UpdateManagementCard
      title="障害者手帳"
      status={normalizedPatient.disabilityStatus}
      medical={normalizedPatient.disabilityMedicalCertificate}
      cardType="disability"
      onChange={(target, field, value) =>
        handleDateChange('disability', target, field, value)
      }
      onProgressChange={(field) =>
        handleProgressChange('disability', field)
      }
      showGrade

      showSettings={cardStates.disability.showSettings}
onToggleSettings={() => toggleCardSettings('disability')}
onSwitchToNewApplication={() => toggleView('disability')} 


    />
  )}

  {cardStates.pension.isNewApplication ? (
    <NewApplicationCard
      title="年金"
      status={normalizedPatient.pensionStatus}
      medical={normalizedPatient.pensionMedicalCertificate}
      cardType="pension"
      onChange={(target, field, value) =>
        handleDateChange('pension', target, field, value)
      }
      onProgressChange={(field) =>
        handleProgressChange('pension', field)
      }
      showSettings={cardStates.pension.showSettings}
onToggleSettings={() => toggleCardSettings('pension')}
onSwitchToUpdate={() => toggleView('pension')} 

    />
  ) : (
    <UpdateManagementCard
      title="年金"
      status={normalizedPatient.pensionStatus}
      medical={normalizedPatient.pensionMedicalCertificate}
      cardType="pension"
      onChange={(target, field, value) =>
        handleDateChange('pension', target, field, value)
      }
      onProgressChange={(field) =>
        handleProgressChange('pension', field)
      }
      showGrade

      showSettings={cardStates.pension.showSettings}
onToggleSettings={() => toggleCardSettings('pension')}
onSwitchToNewApplication={() => toggleView('pension')}

    />
  )}
</div>
        {transitionConfirm && (
          <TransitionConfirmModal
            isOpen={transitionConfirm.isOpen}
            onClose={() => setTransitionConfirm(null)}
            onConfirm={() => {
              handleTransitionConfirm(transitionConfirm.type);
              setTransitionConfirm(null);
            }}
            title={transitionConfirm.title}
          />
        )}
      </div>
    </div>
  );


  
    
  };


export default CertificateDetailsModal;