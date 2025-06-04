import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { usePatients } from '../context/PatientContext';
import EditableCell from '../components/EditableCell';

const insuranceTypes = {
  EMPLOYEE_SELF: '社本',
  EMPLOYEE_FAMILY: '社家',
  LIFE: '生保',
  NATIONAL: '国保'
} as const;

const renewalTypes = ['新規', '更新'] as const;

const certificateTypes = {
  '手帳': '手帳',
  '自立支援': '自立支援',
  '自立支援＋手帳': '自立支援＋手帳',
  '年金': '年金'
} as const;

const certificateFees = {
  '5500円': 5500,
  '6160円': 6160
} as const;

const municipalities = ['鹿児島市', 'いちき串木野市'] as const;

const claimStatusTypes = {
  '済': true,
  '未': false
} as const;

const LifeInsurance: React.FC = () => {
  const { activePatients, updatePatient } = usePatients();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClaimStatus, setFilterClaimStatus] = useState<keyof typeof claimStatusTypes | ''>('');
  const [selectedCertificateTypes, setSelectedCertificateTypes] = useState<Set<string>>(new Set());
  const [isCertificateDropdownOpen, setIsCertificateDropdownOpen] = useState(false);
  const certificateDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (certificateDropdownRef.current && !certificateDropdownRef.current.contains(event.target as Node)) {
        setIsCertificateDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const yearOptions = Array.from({ length: 3 }, (_, i) => selectedYear + i - 1);
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}月`
  }));

  const lifeInsurancePatients = useMemo(() => {
    let filtered = activePatients.filter(patient => patient.insuranceType === 'LIFE');

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(patient =>
        (patient.name || '').toLowerCase().includes(searchLower) ||
        patient.nameKana.toLowerCase().includes(searchLower) ||
        patient.chartNumber.toLowerCase().includes(searchLower)
      );
    }

    if (filterClaimStatus !== '') {
      filtered = filtered.filter(patient => 
        patient.claimStatus === claimStatusTypes[filterClaimStatus as keyof typeof claimStatusTypes]
      );
    }

    if (selectedCertificateTypes.size > 0) {
      filtered = filtered.filter(patient => 
        patient.medicalCertificate.type && selectedCertificateTypes.has(patient.medicalCertificate.type)
      );
    }

    return filtered;
  }, [activePatients, searchTerm, filterClaimStatus, selectedCertificateTypes]);

  const handleCellChange = (patientId: string, field: string, value: string | number | boolean) => {
    const patient = lifeInsurancePatients.find(p => p.id === patientId);
    if (!patient) return;

    const updatedPatient = { ...patient };
    switch (field) {
      case 'difference':
        updatedPatient.difference = typeof value === 'string' ? parseInt(value, 10) : value as number;
        break;
      case 'claimRecipient':
        updatedPatient.claimRecipient = value as string;
        break;
      case 'claimDate':
        updatedPatient.claimDate = value as string;
        break;
      case 'notes':
        updatedPatient.notes = value as string;
        break;
      case 'renewalType':
        updatedPatient.medicalCertificate.renewalType = value as typeof renewalTypes[number];
        break;
      case 'certificateType':
        updatedPatient.medicalCertificate.type = value as keyof typeof certificateTypes;
        break;
      case 'certificateFee':
        updatedPatient.medicalCertificate.fee = certificateFees[value as keyof typeof certificateFees];
        break;
      case 'claimStatus':
        updatedPatient.claimStatus = value as boolean;
        break;
    }
    updatedPatient.updatedAt = new Date().toISOString();
    updatePatient(updatedPatient);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">生保管理</h1>

      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="患者名、カルテ番号で検索..."
              className="w-full pl-10 pr-4 py-2 border rounded-md text-gray-900 placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
          </div>

          <div className="relative" ref={certificateDropdownRef}>
            <button
              onClick={() => setIsCertificateDropdownOpen(!isCertificateDropdownOpen)}
              className="border px-4 py-2 rounded-md bg-white hover:bg-gray-50 min-w-[150px] text-left flex items-center justify-between"
            >
              <span className={selectedCertificateTypes.size === 0 ? 'text-gray-400' : 'text-gray-900'}>
                {selectedCertificateTypes.size === 0
                  ? '診断書で絞込'
                  : selectedCertificateTypes.size === Object.keys(certificateTypes).length
                    ? '全ての診断書'
                    : Array.from(selectedCertificateTypes).join(', ')}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>
            {isCertificateDropdownOpen && (
              <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg border">
                <div className="p-2">
                  {Object.values(certificateTypes).map(type => (
                    <label key={type} className="flex items-center px-2 py-1 hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedCertificateTypes.has(type)}
                        onChange={(e) => {
                          const newTypes = new Set(selectedCertificateTypes);
                          if (e.target.checked) {
                            newTypes.add(type);
                          } else {
                            newTypes.delete(type);
                          }
                          setSelectedCertificateTypes(newTypes);
                        }}
                        className="mr-2"
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

<select
  value={filterClaimStatus}
  onChange={(e) => setFilterClaimStatus(e.target.value as keyof typeof claimStatusTypes | '')}
  className={`border rounded-md px-3 py-2 ${filterClaimStatus === '' ? 'text-gray-400' : 'text-gray-900'}`}
>
  <option value="">請求で絞込</option>
  {Object.keys(claimStatusTypes).map(status => (
    <option key={status} value={status} className="text-gray-900">
      {status}
    </option>
  ))}
</select>


        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                カルテ番号
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                名前
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                保険
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                住所
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                新規/更新
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                診断書
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                診断書代
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                請求日
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                請求先
              </th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                請求
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                差額
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                備考
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {lifeInsurancePatients.map((patient) => (
              <tr key={patient.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 w-24">
                  {patient.chartNumber}
                </td>
                <td className="px-3 py-2 w-40">
                  <div>
                    <div>{patient.name ?? '－'}</div>
                    <div className="text-sm text-gray-500">{patient.nameKana}</div>
                  </div>
                </td>
                <td className="px-3 py-2 w-20">
                  {insuranceTypes[patient.insuranceType] || patient.insuranceType}
                </td>
                <td className="px-3 py-2 w-24">
                  {patient.municipality || '-'}
                </td>
                <td className="px-3 py-2 w-24">
                  <EditableCell
                    value={patient.medicalCertificate.renewalType || ''}
                    onChange={(value) => handleCellChange(patient.id, 'renewalType', value)}
                    type="select"
                    options={renewalTypes}
                    className="w-24"
                    allowEmpty
                  />
                </td>
                <td className="px-3 py-2 w-32">
                  <EditableCell
                    value={patient.medicalCertificate.type || ''}
                    onChange={(value) => handleCellChange(patient.id, 'certificateType', value)}
                    type="select"
                    options={Object.values(certificateTypes)}
                    className="w-32"
                    allowEmpty
                  />
                </td>
                <td className="px-3 py-2 w-24">
                  <EditableCell
                    value={`${patient.medicalCertificate.fee || ''}円`}
                    onChange={(value) => handleCellChange(patient.id, 'certificateFee', value)}
                    type="select"
                    options={Object.keys(certificateFees)}
                    className="w-24"
                    allowEmpty
                  />
                </td>
                <td className="px-3 py-2 w-32">
                  <EditableCell
                    value={patient.claimDate?.split('T')[0] || ''}
                    onChange={(value) => handleCellChange(patient.id, 'claimDate', value)}
                    type="date"
                    className="w-32"
                    allowEmpty
                  />
                </td>
                <td className="px-3 py-2 w-32">
                  <EditableCell
                    value={patient.claimRecipient || ''}
                    onChange={(value) => handleCellChange(patient.id, 'claimRecipient', value)}
                    placeholder="請求先"
                    className="w-32"
                  />
                </td>
                <td className="px-3 py-2 w-16 text-center">
                  <input
                    type="checkbox"
                    checked={patient.claimStatus || false}
                    onChange={(e) => handleCellChange(patient.id, 'claimStatus', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-3 py-2 w-20">
                  <div className="flex items-center space-x-1">
                    <EditableCell
                      value={(patient.difference || 0).toString()}
                      onChange={(value) => handleCellChange(patient.id, 'difference', parseInt(value))}
                      type="number"
                      className="w-16"
                    />
                    <span className="text-gray-600">円</span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <EditableCell
                    value={patient.notes || ''}
                    onChange={(value) => handleCellChange(patient.id, 'notes', value)}
                    placeholder="備考"
                    className="w-[600px]"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LifeInsurance;