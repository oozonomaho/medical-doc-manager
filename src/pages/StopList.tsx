import React, { useState, useMemo } from 'react';
import { ArrowUpCircle, FileText, Info, Search } from 'lucide-react';
import EditableCell from '../components/EditableCell';
import { usePatients } from '../context/PatientContext';
import FileHistoryModal from '../components/FileHistoryModal';
import CertificateDetailsModal from '../components/CertificateDetailsModal';

const insuranceTypes = {
  EMPLOYEE_SELF: '社本',
  EMPLOYEE_FAMILY: '社家',
  LIFE: '生保',
  NATIONAL: '国保'
} as const;

const municipalities = {
  '鹿': '鹿',
  '姶良': '姶良',
  '霧島': '霧島',
  '鹿屋': '鹿屋',
  '奄美': '奄美'
} as const;

const StopList: React.FC = () => {
  const { stoppedPatients, moveToActiveList, updatePatient, uploadFileForPatient, deleteFileForPatient } = usePatients();
  const [selectedPatients, setSelectedPatients] = useState<Set<string>>(new Set());
  const [openFileModalFor, setOpenFileModalFor] = useState<string | null>(null);
  const [selectedPatientForCertificates, setSelectedPatientForCertificates] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = useMemo(() => {
    if (!searchTerm) return stoppedPatients;

    const searchLower = searchTerm.toLowerCase();
    return stoppedPatients.filter(patient => 
      patient.name.toLowerCase().includes(searchLower) ||
      patient.nameKana.toLowerCase().includes(searchLower) ||
      patient.chartNumber.toLowerCase().includes(searchLower)
    );
  }, [stoppedPatients, searchTerm]);

  const handleSelectPatient = (patientId: string) => {
    const newSelected = new Set(selectedPatients);
    if (newSelected.has(patientId)) {
      newSelected.delete(patientId);
    } else {
      newSelected.add(patientId);
    }
    setSelectedPatients(newSelected);
  };

  const handleBulkMove = () => {
    if (selectedPatients.size > 0) {
      moveToActiveList(Array.from(selectedPatients));
      setSelectedPatients(new Set());
    }
  };

  const handleCellChange = (patientId: string, field: string, value: string) => {
    const patient = stoppedPatients.find(p => p.id === patientId);
    if (!patient) return;

    const updatedPatient = { ...patient };
    switch (field) {
      case 'name':
      case 'nameKana':
      case 'chartNumber':
      case 'notes':
      case 'municipality':
        updatedPatient[field] = value;
        break;
      case 'insuranceType':
        updatedPatient.insuranceType = value as any;
        break;
    }
    updatedPatient.updatedAt = new Date().toISOString();
    updatePatient(updatedPatient);
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">停止リスト</h1>
        {selectedPatients.size > 0 && (
          <button
            onClick={handleBulkMove}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <ArrowUpCircle className="h-5 w-5 mr-2" />
            選択した患者を患者一覧へ戻す
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="relative">
          <input
            type="text"
            placeholder="患者名、カルテ番号で検索..."
            className="w-full pl-10 pr-4 py-2 border rounded-md text-gray-900 placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      <div className="rounded-lg shadow ring-1 ring-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-10" />
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                カルテ番号
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                患者名
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                保険
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                住所
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                自立支援
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                障害者手帳
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                年金
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                停止日
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
            {filteredPatients.map((patient) => (
              <tr key={patient.id}>
                <td className="px-3 py-4">
                  <input
                    type="checkbox"
                    checked={selectedPatients.has(patient.id)}
                    onChange={() => handleSelectPatient(patient.id)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </td>
                <td className="px-3 py-4">
                  <EditableCell
                    value={patient.chartNumber}
                    onChange={(value) => handleCellChange(patient.id, 'chartNumber', value)}
                    placeholder="カルテ番号"
                  />
                </td>
                <td className="px-3 py-4">
                  <div className="flex items-start space-x-2">
                    <div className="space-y-1">
                      <EditableCell
                        value={patient.nameKana}
                        onChange={(value) => handleCellChange(patient.id, 'nameKana', value)}
                        placeholder="ふりがな"
                      />
                      <EditableCell
                        value={patient.name}
                        onChange={(value) => handleCellChange(patient.id, 'name', value)}
                        placeholder="患者名"
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
                <td className="px-3 py-4">
                  <EditableCell
                    value={insuranceTypes[patient.insuranceType]}
                    onChange={(value) => {
                      const key = Object.entries(insuranceTypes).find(([_, v]) => v === value)?.[0];
                      if (key) handleCellChange(patient.id, 'insuranceType', key);
                    }}
                    type="select"
                    options={Object.values(insuranceTypes)}
                  />
                </td>
                <td className="px-3 py-4">
                  <EditableCell
                    value={patient.municipality || ''}
                    onChange={(value) => handleCellChange(patient.id, 'municipality', value)}
                    type="select"
                    options={Object.values(municipalities)}
                  />
                </td>
                <td className="px-3 py-4">
                  <div className="text-sm">
                    {getCertificateStatus(patient.selfSupportCertificate)}
                  </div>
                </td>
                <td className="px-3 py-4">
                  <div className="text-sm">
                    {getCertificateStatus(patient.disabilityCertificate)}
                  </div>
                </td>
                <td className="px-3 py-4">
                  <div className="text-sm">
                    {getCertificateStatus(patient.pensionStatus)}
                  </div>
                </td>
                <td className="px-3 py-4">
  {patient.stoppedAt
    ? new Date(patient.stoppedAt).toLocaleDateString('ja-JP')
    : '-'}
</td>

                <td className="px-3 py-4">
                  <EditableCell
                    value={patient.notes || ''}
                    onChange={(value) => handleCellChange(patient.id, 'notes', value)}
                    placeholder="備考"
                  />
                </td>
                <td className="px-3 py-4 text-center">
                  <button
                    onClick={() => setOpenFileModalFor(patient.id)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FileText className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedPatientForCertificates && (
        <CertificateDetailsModal
          patient={stoppedPatients.find(p => p.id === selectedPatientForCertificates)!}
          onClose={() => setSelectedPatientForCertificates(null)}
          onUpdate={updatePatient}
        />
      )}

      {openFileModalFor && (
        <FileHistoryModal
          patient={stoppedPatients.find(p => p.id === openFileModalFor)!}
          onClose={() => setOpenFileModalFor(null)}
          onUpload={uploadFileForPatient}
          onDelete={deleteFileForPatient}
        />
      )}
    </div>
  );
};

export default StopList;