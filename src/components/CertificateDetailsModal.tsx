import React, { useState } from 'react';
import { X, Settings } from 'lucide-react';
import { Patient } from '../types/patient';
import EditableCell from './EditableCell';

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

const CertificateDetailsModal: React.FC<CertificateDetailsModalProps> = ({ 
  patient, 
  onClose,
  onUpdate 
}) => {
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

  const handleDateChange = (
    certificateType: 'selfSupportCertificate' | 'disabilityCertificate' | 'pensionStatus',
    field: string,
    value: string | null
  ) => {
    const updatedPatient = { ...patient };
    const certificate = updatedPatient[certificateType];

    if (!certificate) return;

    switch (field) {
      case 'initialStartDate':
        certificate.initialStartDate = value ? `${value}T00:00:00Z` : undefined;
        break;
      case 'startDate':
        certificate.startDate = value ? `${value}T00:00:00Z` : undefined;
        break;
      case 'applicationDate':
        certificate.applicationDate = value ? `${value}T00:00:00Z` : undefined;
        if (value) {
          certificate.renewalType = '新規';
          updatedPatient.medicalCertificate.type = certificateType === 'selfSupportCertificate' ? '自立支援' :
            certificateType === 'disabilityCertificate' ? '手帳' : '年金';
        }
        break;
      case 'completionDate':
        certificate.completionDate = value ? `${value}T00:00:00Z` : undefined;
        if (value) {
          const titles = {
            selfSupportCertificate: '自立支援医療',
            disabilityCertificate: '障害者手帳',
            pensionStatus: '年金'
          };
          setTransitionConfirm({
            isOpen: true,
            type: certificateType,
            title: titles[certificateType]
          });
        }
        break;
      case 'validFrom':
        certificate.validFrom = value ? `${value}T00:00:00Z` : undefined;
        break;
      case 'validUntil':
        certificate.validUntil = value ? `${value}T00:00:00Z` : undefined;
        break;
      case 'grade':
        certificate.grade = value || undefined;
        break;
      case 'status':
        certificate.status = value as string;
        break;
      case 'sendDate':
        certificate.sendDate = value ? `${value}T00:00:00Z` : undefined;
        break;
      case 'needsCertificate':
        certificate.needsCertificate = value === '要';
        break;
      case 'limitAmount':
        certificate.limitAmount = value || undefined;
        break;
    }

    onUpdate(updatedPatient);
  };
  const handleProgressChange = (
    certificateType: 'selfSupportCertificate' | 'disabilityCertificate' | 'pensionStatus',
    field: 'docsReady' | 'docsHanded' | 'docsReceived' | 'docsSent' | 'requestSent'
  ) => {
    const updatedPatient = { ...patient };
    const certificate = { ...updatedPatient[certificateType] };
  
    const currentProgress = certificate.progress || {
      docsReady: false,
      docsHanded: false,
      docsReceived: false,
      docsSent: false,
      requestSent: false
    };
  
    const updatedProgress = {
      ...currentProgress,
      [field]: !currentProgress[field]
    };
  
    certificate.progress = updatedProgress;
    updatedPatient[certificateType] = certificate;
    updatedPatient.updatedAt = new Date().toISOString();
  
    onUpdate(updatedPatient);
  };
  
  const handleTransitionConfirm = (type: string) => {
    const updatedPatient = { ...patient };
    const certificate = updatedPatient[type];
    
    if (type === 'selfSupportCertificate') {
      certificate.status = 'ONHOLD';
    } else {
      certificate.status = 'APPLYING';
    }
    
    onUpdate(updatedPatient);

    setCardStates(prev => ({
      ...prev,
      [type === 'selfSupportCertificate' ? 'selfSupport' : 
        type === 'disabilityCertificate' ? 'disability' : 'pension']: {
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

  const NewApplicationCard: React.FC<{
    title: string;
    certificate: any;
    type: 'selfSupportCertificate' | 'disabilityCertificate' | 'pensionStatus';
    cardType: 'selfSupport' | 'disability' | 'pension';
  }> = ({ title, certificate, type, cardType }) => (
    <div className="p-4 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">{title}</h3>
        <div className="relative">
          <button
            onClick={() => setCardStates(prev => ({
              ...prev,
              [cardType]: { ...prev[cardType], showSettings: !prev[cardType].showSettings }
            }))}
            className="text-gray-500 hover:text-gray-700"
          >
            <Settings className="h-5 w-5" />
          </button>
          {cardStates[cardType].showSettings && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              <button
                onClick={() => toggleView(cardType)}
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
            value={certificate?.applicationDate?.split('T')[0] || ''}
            onChange={(value) => handleDateChange(type, 'applicationDate', value)}
            type="date"
            className="w-full"
            allowEmpty
          />
        </div>
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={certificate?.progress?.requestSent || false}
              onChange={() => handleProgressChange(type, 'requestSent')}
          
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">診断書作成依頼</span>
          </label>
        </div>
        <div>
          <label className="block text-gray-600 text-sm mb-1">新規申請完了日</label>
          <EditableCell
            value={certificate?.completionDate?.split('T')[0] || ''}
            onChange={(value) => handleDateChange(type, 'completionDate', value)}
            type="date"
            className="w-full"
            allowEmpty
          />
        </div>
      </div>
    </div>
  );

  const UpdateManagementCard: React.FC<{
    title: string;
    certificate: any;
    type: 'selfSupportCertificate' | 'disabilityCertificate' | 'pensionStatus';
    cardType: 'selfSupport' | 'disability' | 'pension';
    showGrade?: boolean;
  }> = ({ title, certificate, type, cardType, showGrade }) => {
    const statusOptions = type === 'selfSupportCertificate' 
      ? Object.values(selfSupportStatusTypes)
      : Object.values(baseStatusTypes);

    const bgColor = (() => {
      switch (certificate?.status) {
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
  {/* 左側：タイトルだけ */}
  <h3 className="font-semibold">{title}</h3>

  {/* 右側：状態、等級、設定ボタン */}
  <div className="flex items-center space-x-2">

    {showGrade && (
      <EditableCell
        value={certificate?.grade || ''}
        onChange={(value) => handleDateChange(type, 'grade', value)}
        type="select"
        options={gradeOptions}
        placeholder="等級"
        className="w-16"
        allowEmpty
      />
    )}
    
    <EditableCell
      value={certificate?.status ? (type === 'selfSupportCertificate' ? selfSupportStatusTypes[certificate?.status] : baseStatusTypes[certificate?.status]) : ''}
      onChange={(value) => {
        if (value === '' || value === null) {
          handleDateChange(type, 'status', undefined);
        } else {
          const key = type === 'selfSupportCertificate'
            ? Object.entries(selfSupportStatusTypes).find(([_, v]) => v === value)?.[0]
            : Object.entries(baseStatusTypes).find(([_, v]) => v === value)?.[0];
          if (key) handleDateChange(type, 'status', key);
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
        onClick={() => setCardStates(prev => ({
          ...prev,
          [cardType]: { ...prev[cardType], showSettings: !prev[cardType].showSettings }
        }))}
        className="text-gray-500 hover:text-gray-700"
      >
        <Settings className="h-5 w-5" />
      </button>
      {cardStates[cardType].showSettings && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
          <button
            onClick={() => toggleView(cardType)}
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
                value={certificate?.initialStartDate?.split('T')[0] || ''}
                onChange={(value) => handleDateChange(type, 'initialStartDate', value)}
                type="date"
                className="w-full"
                allowEmpty
              />
            </div>
            {type === 'selfSupportCertificate' && (
              <div>
                <label className="block text-gray-600 text-sm mb-1">限度額</label>
                <EditableCell
                  value={certificate?.limitAmount || ''}
                  onChange={(value) => handleDateChange(type, 'limitAmount', value)}
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
                value={certificate?.validFrom?.split('T')[0] || ''}
                onChange={(value) => handleDateChange(type, 'validFrom', value)}
                type="date"
                className="w-full"
                allowEmpty
                placeholder="開始日"
              />
              <span className="text-gray-500">～</span>
              <EditableCell
                value={certificate?.validUntil?.split('T')[0] || ''}
                onChange={(value) => handleDateChange(type, 'validUntil', value)}
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
              value={certificate?.needsCertificate ? '要' : '不要'}
              onChange={(value) => handleDateChange(type, 'needsCertificate', value)}
              type="select"
              options={['要', '不要']}
              className="w-full"
              allowEmpty
            />
          </div>

          <div>
            <label className="block text-gray-600 text-sm mb-1">書類進捗</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={certificate?.progress?.docsReady || false}
                  onChange={() => handleProgressChange(type, 'docsReady')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">書類準備済み</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={certificate?.progress?.docsHanded || false}
                  onChange={() => handleProgressChange(type, 'docsHanded')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">書類渡し済み</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={certificate?.progress?.docsReceived || false}
                  onChange={() => handleProgressChange(type, 'docsReceived')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">書類受け取り済み</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={certificate?.progress?.docsSent || false}
                  onChange={() => handleProgressChange(type, 'docsSent')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">送付済み</span>
              </label>
              {certificate?.progress?.docsSent && (
                <div className="mt-2">
                  <label className="block text-gray-600 text-sm mb-1">送付日</label>
                  <EditableCell
                    value={certificate?.sendDate?.split('T')[0] || ''}
                    onChange={(value) => handleDateChange(type, 'sendDate', value)}
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-7xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {patient.name}さんの証明書情報
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {cardStates.selfSupport.isNewApplication ? (
            <NewApplicationCard
              title="自立支援医療"
              certificate={patient.selfSupportCertificate}
              type="selfSupportCertificate"
              cardType="selfSupport"
            />
          ) : (
            <UpdateManagementCard
              title="自立支援医療"
              certificate={patient.selfSupportCertificate}
              type="selfSupportCertificate"
              cardType="selfSupport"
            />
          )}

          {cardStates.disability.isNewApplication ? (
            <NewApplicationCard
              title="障害者手帳"
              certificate={patient.disabilityCertificate}
              type="disabilityCertificate"
              cardType="disability"
            />
          ) : (
            <UpdateManagementCard
              title="障害者手帳"
              certificate={patient.disabilityCertificate}
              type="disabilityCertificate"
              cardType="disability"
              showGrade
            />
          )}

          {cardStates.pension.isNewApplication ? (
            <NewApplicationCard
              title="年金"
              certificate={patient.pensionStatus}
              type="pensionStatus"
              cardType="pension"
            />
          ) : (
            <UpdateManagementCard
              title="年金"
              certificate={patient.pensionStatus}
              type="pensionStatus"
              cardType="pension"
              showGrade
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