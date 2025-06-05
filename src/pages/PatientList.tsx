import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Download, Upload, CheckCircle2, XCircle, Ban, ChevronDown, Wallet, Trash2, AlertCircle, FileText, Info } from 'lucide-react';
import { Patient } from '../types/patient';
import EditableCell from '../components/EditableCell';
import { usePatients } from '../context/PatientContext';
import FileHistoryModal from '../components/FileHistoryModal';
import CertificateDetailsModal from '../components/CertificateDetailsModal';
import InsuranceChangeConfirmModal from '../components/InsuranceChangeConfirmModal';





const insuranceTypes = {
  EMPLOYEE_SELF: '社本',
  EMPLOYEE_FAMILY: '社家',
  LIFE: '生保',
  NATIONAL: '国保'
} as const;

const certificateTypes = {
  '自立支援': '自立支援',
  '自立＋手帳':'自立支援＋手帳',
  '手帳': '手帳',
  '年金': '年金'
} as const;

const certificateStatusTypes = {
  '未': '未',
  '進': '進',
  '済': '済'
} as const;

const municipalities = {
  '鹿': '鹿',
  '姶良': '姶良',
  '霧島': '霧島',
  '鹿屋': '鹿屋',
  '奄美': '奄美'
} as const;

type SortField = 'chartNumber' | 'name' | 'nameKana' | 'insuranceType' | 'medicalType' | 'medicalDeadline' | 'createdAt';
type SortDirection = 'asc' | 'desc';

const PatientList: React.FC = () => {
  console.log('🟣 PatientListレンダリング (´・_・｀)');
  const navigate = useNavigate();
  const { 
    activePatients, 
    moveToStopList, 
    updatePatient, 
    moveToLifeInsurance, 
    moveToPendingClaims,
    deletePatients,
    uploadFileForPatient, 
    deleteFileForPatient,
    addInsuranceChange
  } = usePatients();
   console.log('🟥 PatientListレンダリング:', activePatients); // ここ

  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterInsurance, setFilterInsurance] = useState<string>('');
  const [filterMunicipality, setFilterMunicipality] = useState<string>('');
  const [selectedPatients, setSelectedPatients] = useState<Set<string>>(new Set());
  const [openSortMenu, setOpenSortMenu] = useState<string | null>(null);
  const [openFileModalFor, setOpenFileModalFor] = useState<string | null>(null);
  const [selectedPatientForCertificates, setSelectedPatientForCertificates] = useState<string | null>(null);
  const [showInsuranceChangeModal, setShowInsuranceChangeModal] = useState(false);
  const [insuranceChangeData, setInsuranceChangeData] = useState<{
    patientId: string;
    oldInsurance: string;
    newInsurance: string;
    patient: Patient;
  } | null>(null);

      useEffect(() => {
    console.log('🟦 [DEBUG] activePatients 変更:', activePatients);
    // 特定患者だけ見たければ、選択中だけフィルタして出してもOK
    if (selectedPatientForCertificates) {
      const patient = activePatients.find(p => p.id === selectedPatientForCertificates);
      if (patient) {
        console.log('🟧 [DEBUG] 選択中患者データ:', patient);
      }
    }
  }, [activePatients, selectedPatientForCertificates]);


  const handleAddNewPatient = () => {
    const newPatient: Partial<Patient> = {
      id: crypto.randomUUID(),
      name: '',
      nameKana: '',
      chartNumber: '',
      insuranceType: '' as any,
      selfSupportStatus: {
        hasSupport: false,
        status: '未更新'
      },
      disabilityStatus: {
        hasDisability: false,
        status: '未更新'
      },
      pensionStatus: {
        hasPension: false,
        status: '未更新'
      },
      medicalCertificate: {
        required: false,
        status: '未'
      },
      status: 'APPLYING',
      chartProcessing: {
        preProcessing: false,
        postProcessing: false
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    updatePatient(newPatient as Patient);
  };


  

  const getCertificateStatus = (certificate: any) => {
    if (!certificate) return '-';
    
    const status = certificate.status;
    if (!status) return '-';

    const statusMap = {
      APPLYING: '申請中',
      ACTIVE: '適用中',
      ONHOLD: '保留中',
      STOPPED: '停止'
    };




    return statusMap[status] || '-';
  };

  const getCertificateStatusStyle = (status: string) => {
    switch (status) {
      case '申請中':
        return 'bg-pink-100 w-16 text-center';
      case '適用中':
        return 'bg-green-100 w-16 text-center';
      case '停止':
        return 'bg-gray-100 w-16 text-center';
      default:
        return 'w-16 text-center';
    }
  };

  const sortedPatients = useMemo(() => {
    let filtered = [...activePatients];

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(patient =>
        (patient.name || '').toLowerCase().includes(searchLower) ||
        patient.nameKana.toLowerCase().includes(searchLower) ||
        patient.chartNumber.toLowerCase().includes(searchLower)
      );
    }

    if (filterInsurance) {
      filtered = filtered.filter(patient => patient.insuranceType === filterInsurance);
    }

    if (filterMunicipality) {
      filtered = filtered.filter(patient => patient.municipality === filterMunicipality);
    }

    if (sortField !== 'createdAt') {
      filtered.sort((a, b) => {
        let compareA: string | number | undefined;
        let compareB: string | number | undefined;

        switch (sortField) {
          case 'chartNumber':
            compareA = a.chartNumber;
            compareB = b.chartNumber;
            break;
          case 'name':
            compareA = a.name || '';
            compareB = b.name || '';
            break;
          case 'nameKana':
            compareA = a.nameKana;
            compareB = b.nameKana;
            break;
          case 'insuranceType':
            compareA = insuranceTypes[a.insuranceType];
            compareB = insuranceTypes[b.insuranceType];
            break;
          case 'medicalType':
            compareA = getCertificateStatus(a.selfSupportStatus);
            compareB = getCertificateStatus(b.selfSupportStatus);
            break;
          case 'medicalDeadline':
            compareA = a.selfSupportStatus?.validUntil;
            compareB = b.selfSupportStatus?.validUntil;
            break;
        }

        if (!compareA) return 1;
        if (!compareB) return -1;

        const result = compareA < compareB ? -1 : compareA > compareB ? 1 : 0;
        return sortDirection === 'asc' ? result : -result;
      });
    }

    return filtered;
  }, [activePatients, sortField, sortDirection, searchTerm, filterInsurance, filterMunicipality]);

  const handleInsuranceChange = (patientId: string, oldInsurance: string, newInsurance: string) => {
    const patient = activePatients.find(p => p.id === patientId);
    if (!patient) return;

    setInsuranceChangeData({ 
      patientId, 
      oldInsurance, 
      newInsurance,
      patient: { ...patient, insuranceType: newInsurance as keyof typeof insuranceTypes }
    });
    setShowInsuranceChangeModal(true);
  };

  const handleConfirmInsuranceChange = () => {
    if (!insuranceChangeData) return;

    addInsuranceChange({
      id: crypto.randomUUID(),
      patientId: insuranceChangeData.patientId,
      chartNumber: insuranceChangeData.patient.chartNumber,
      patientName: insuranceChangeData.patient.name,
      oldInsurance: insuranceChangeData.oldInsurance as keyof typeof insuranceTypes,
      newInsurance: insuranceChangeData.newInsurance as keyof typeof insuranceTypes,
      changeDate: new Date().toISOString(),
      status: '未対応'
    });

    updatePatient(insuranceChangeData.patient);

    setShowInsuranceChangeModal(false);
    setInsuranceChangeData(null);
  };

  const handleCellChange = (patientId: string, field: string, value: string | null) => {
    const patient = activePatients.find(p => p.id === patientId);
    if (!patient) return;

    const updatedPatient = { ...patient };

    if (field === 'insuranceType') {
      const oldInsurance = patient.insuranceType;
      const newInsurance = value;
      
      if (newInsurance) {
        if (!oldInsurance) {
          updatedPatient.insuranceType = newInsurance as any;
          updatePatient(updatedPatient);
        } 
        else if (oldInsurance !== newInsurance) {
          handleInsuranceChange(patientId, oldInsurance, newInsurance);
          return;
        }
      }
      return;
    }

    switch (field) {
      case 'name':
        updatedPatient[field] = value;
        break;
      case 'nameKana':
      case 'chartNumber':
      case 'notes':
      case 'municipality':
        updatedPatient[field] = value ?? '';
        break;
      case 'medicalType':
        updatedPatient.medicalCertificate.type = value;
        break;
      case 'medicalDeadline':
        updatedPatient.medicalCertificate.deadline = value ? `${value}T00:00:00Z` : undefined;
        break;
      case 'applicationDate':
        updatedPatient.applicationDate = value ? `${value}T00:00:00Z` : undefined;
        break;
    }

    updatedPatient.updatedAt = new Date().toISOString();
    updatePatient(updatedPatient);
  };

  const handleSelectPatient = (patientId: string) => {
    const newSelected = new Set(selectedPatients);
    if (newSelected.has(patientId)) {
      newSelected.delete(patientId);
    } else {
      newSelected.add(patientId);
    }
    setSelectedPatients(newSelected);
  };

  const SortableHeader: React.FC<{
    field: SortField;
    children: React.ReactNode;
  }> = ({ field, children }) => {
    const isActive = sortField === field;
    
    return (
      <th 
        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative"
        onMouseLeave={() => setOpenSortMenu(null)}
      >
        <div 
          className="flex items-center space-x-1 cursor-pointer group"
          onClick={() => setOpenSortMenu(openSortMenu === field ? null : field)}
        >
          <span>{children}</span>
          <ChevronDown className={`h-4 w-4 transition-colors ${
            isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600'
          }`} />
        </div>
        
        {openSortMenu === field && (
          <div className="absolute z-10 mt-1 w-36 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="py-1">
              <button
                className={`block w-full text-left px-4 py-2 text-sm ${
                  isActive && sortDirection === 'asc'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => {
                  setSortField(field);
                  setSortDirection('asc');
                  setOpenSortMenu(null);
                }}
              >
                昇順
              </button>
              <button
                className={`block w-full text-left px-4 py-2 text-sm ${
                  isActive && sortDirection === 'desc'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => {
                  setSortField(field);
                  setSortDirection('desc');
                  setOpenSortMenu(null);
                }}
              >
                降順
              </button>
            </div>
          </div>
        )}
      </th>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">患者一覧</h1>
        <div className="flex items-center space-x-2">
          {selectedPatients.size > 0 && (
            <>
              <button
                onClick={() => {
                  if (confirm('選択した患者を削除してもよろしいですか？')) {
                    deletePatients(Array.from(selectedPatients));
                    setSelectedPatients(new Set());
                  }
                }}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                <Trash2 className="h-5 w-5 mr-2" />
                患者を削除
              </button>
              <button
                onClick={() => {
                  moveToStopList(Array.from(selectedPatients));
                  setSelectedPatients(new Set());
                }}
                className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
              >
                <Ban className="h-5 w-5 mr-2" />
                停止リストへ移動
              </button>
            </>
          )}
          <button
            onClick={handleAddNewPatient}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            新規登録
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="患者名、カルテ番号で検索..."
              className="w-full pl-10 pr-4 py-2 border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
         <select
  value={filterInsurance}
  onChange={(e) => setFilterInsurance(e.target.value)}
  className={`border rounded-md px-4 py-2 ${filterInsurance === '' ? 'text-gray-400' : 'text-gray-900'}`}
>
  <option value="">保険で絞込</option>
  {Object.entries(insuranceTypes).map(([key, value]) => (
    <option key={key} value={key} className="text-gray-900">
      {value}
    </option>
  ))}
</select>

        <select
  value={filterMunicipality}
  onChange={(e) => setFilterMunicipality(e.target.value)}
  className={`border rounded-md px-4 py-2 ${filterMunicipality === '' ? 'text-gray-400' : 'text-gray-900'}`}
>
  <option value="">住所で絞込</option>
  {Object.entries(municipalities).map(([key, value]) => (
    <option key={key} value={key} className="text-gray-900">
      {value}
    </option>
  ))}
</select>

        </div>
      </div>

      <div className="overflow-x-auto rounded-lg shadow ring-1 ring-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                <input
                  type="checkbox"
                  checked={sortedPatients.length > 0 && selectedPatients.size === sortedPatients.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedPatients(new Set(sortedPatients.map(p => p.id)));
                    } else {
                      setSelectedPatients(new Set());
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </th>
              <SortableHeader field="chartNumber">カルテ番号</SortableHeader>
              <SortableHeader field="name">患者名</SortableHeader>
              <SortableHeader field="insuranceType">保険</SortableHeader>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                住所
              </th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                自立支援
              </th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                障害者手帳
              </th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                年金
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                備考
              </th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                ファイル
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedPatients.map((patient) => {
              const selfSupportStatus = getCertificateStatus(patient.selfSupportStatus);
              const disabilityStatus = getCertificateStatus(patient.disabilityStatus);
              const pensionStatus = getCertificateStatus(patient.pensionStatus);

              return (
                <tr key={patient.id}>
                  <td className="w-10 px-3 py-4">
                    <input
                      type="checkbox"
                      checked={selectedPatients.has(patient.id)}
                      onChange={() => handleSelectPatient(patient.id)}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                  </td>
                  <td className="w-32 px-3 py-4">
                    <EditableCell
                      value={patient.chartNumber}
                      onChange={(value) => handleCellChange(patient.id, 'chartNumber', value)}
                      placeholder="カルテ番号"
                      className="w-full"
                    />
                  </td>
                  <td className="w-32 px-3 py-4">
                    <div className="flex items-start space-x-2">
                      <div className="space-y-1 w-full">
                        <EditableCell
                          value={patient.nameKana}
                          onChange={(value) => handleCellChange(patient.id, 'nameKana', value)}
                          placeholder="ふりがな"
                          className="w-full"
                        />
                        <EditableCell
                          value={patient.name}
                          onChange={(value) => handleCellChange(patient.id, 'name', value)}
                          placeholder="患者名"
                          className="w-full"
                        />
                      </div>
                      <button
                        onClick={() => setSelectedPatientForCertificates(patient.id)}
                        className="group relative"
                        title="詳細を表示"
                      >
                        <Info className="h-5 w-5 text-blue-500 hover:text-blue-700" />
                        <span className="absolute left-1/2 -translate-x-1/2 -top-8 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          詳細を表示
                        </span>
                      </button>
                    </div>
                  </td>
                  <td className="w-20 px-3 py-4">
                    <EditableCell
                      value={insuranceTypes[patient.insuranceType] || ''}
                      onChange={(value) => {
                        const key = Object.entries(insuranceTypes).find(([_, v]) => v === value)?.[0];
                        if (key) handleCellChange(patient.id, 'insuranceType', key);
                      }}
                      type="select"
                      options={Object.values(insuranceTypes)}
                      className="w-full"
                      allowEmpty
                    />
                  </td>
                  <td className="w-24 px-3 py-4">
                    <EditableCell
                      value={patient.municipality || ''}
                      onChange={(value) => handleCellChange(patient.id, 'municipality', value)}
                      type="select"
                      options={Object.values(municipalities)}
                      className="w-full"
                    />
                  </td>
                  <td className="w-32 px-3 py-4">
                    <div className="flex justify-center">
                      <div className={`text-sm rounded-md px-2 py-0.5 ${getCertificateStatusStyle(selfSupportStatus)}`}>
                        {selfSupportStatus}
                      </div>
                    </div>
                  </td>
                  <td className="w-32 px-3 py-4">
                    <div className="flex justify-center">
                      <div className={`text-sm rounded-md px-2 py-0.5 ${getCertificateStatusStyle(disabilityStatus)}`}>
                        {disabilityStatus}
                      </div>
                    </div>
                  </td>
                  <td className="w-32 px-3 py-4">
                    <div className="flex justify-center">
                      <div className={`text-sm rounded-md px-2 py-0.5 ${getCertificateStatusStyle(pensionStatus)}`}>
                        {pensionStatus}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4　style={{ width: '700px' }}">
                    <EditableCell
                      value={patient.notes || ''}
                      onChange={(value) => handleCellChange(patient.id, 'notes', value)}
                      placeholder="備考"
                      
                      className="max-w-none" // ← これで max-width 無制限になる
                    />
                  </td>
                  <td className="w-16 px-3 py-4 text-center">
                    <button
                      onClick={() => setOpenFileModalFor(patient.id)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <FileText className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

{selectedPatientForCertificates && (
  <CertificateDetailsModal
    patient={activePatients.find(p => p.id === selectedPatientForCertificates)!}
    onClose={() => setSelectedPatientForCertificates(null)}
    onUpdate={(updatedPatient) => {
      console.log('🟨 PatientList onUpdate受信:', updatedPatient);
      updatePatient(updatedPatient);
    }}
  />
)}

      {openFileModalFor && (
        <FileHistoryModal
          patient={activePatients.find(p => p.id === openFileModalFor)!}
          onClose={() => setOpenFileModalFor(null)}
          onUpload={uploadFileForPatient}
          onDelete={deleteFileForPatient}
        />
      )}

      {showInsuranceChangeModal && insuranceChangeData && (
        <InsuranceChangeConfirmModal
          isOpen={showInsuranceChangeModal}
          onClose={() => {
            updatePatient(insuranceChangeData.patient);
            setShowInsuranceChangeModal(false);
            setInsuranceChangeData(null);
          }}
          onConfirm={handleConfirmInsuranceChange}
          oldInsurance={insuranceTypes[insuranceChangeData.oldInsurance as keyof typeof insuranceTypes]}
          newInsurance={insuranceTypes[insuranceChangeData.newInsurance as keyof typeof insuranceTypes]}
        />
      )}
    </div>
  );
};

export default PatientList;