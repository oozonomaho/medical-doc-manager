import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, FileText, ChevronDown, Info } from 'lucide-react';
import { usePatients } from '../context/PatientContext';
import EditableCell from '../components/EditableCell';
import FileHistoryModal from '../components/FileHistoryModal';
import CertificateDetailsModal from '../components/CertificateDetailsModal';

const doctors = {
  '院長': '院長',
  '山中先生': '山中先生'
} as const;

const staffMembers = {
  '竹下先生': '竹下先生',
  '木村先生': '木村先生',
  '山形先生': '山形先生'
} as const;

const certificateTypes = {
  '手帳': '手帳',
  '自立支援': '自立支援',
  '自立支援＋手帳': '自立支援＋手帳',
  '年金': '年金'
} as const;

const certificateStatusTypes = {
  '未': '未',
  '進': '進',
  '済': '済'
} as const;

const priorityTypes = {
  '作成保留': '作成保留',
  '急ぎ': '急ぎ'
} as const;

const renewalTypes = ['新規', '更新'] as const;

const insuranceTypes = {
  EMPLOYEE_SELF: '社本',
  EMPLOYEE_FAMILY: '社家',
  LIFE: '生保',
  NATIONAL: '国保'
} as const;

type SortField = 'chartNumber' | 'name' | 'nameKana' | 'insuranceType' | 'medicalType' | 'medicalDeadline' | 'createdAt' | 'deadline' | 'applicationDate';
type SortDirection = 'asc' | 'desc';

interface CertificateRow {
  id: string;
  patient: any;
  type: string;
  renewalType: string;
  deadline: string | null;
  needsCertificate: boolean;
  priority?: string;
  staff?: string;
  status?: string;
  applicationDate?: string;
}

const MedicalCertificates: React.FC = () => {
  const {
    activePatients,
    updatePatient,
    uploadFileForPatient,
    deleteFileForPatient
  } = usePatients();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | ''>('');
  const [selectedMonths, setSelectedMonths] = useState<Set<number>>(new Set());
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set());
  const [selectedCertificateTypes, setSelectedCertificateTypes] = useState<Set<string>>(new Set());
  const [filterRenewalType, setFilterRenewalType] = useState<string>('');
  const [filterDoctor, setFilterDoctor] = useState('');
  const [filterStaff, setFilterStaff] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [sortField, setSortField] = useState<SortField>('deadline');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [openSortMenu, setOpenSortMenu] = useState<string | null>(null);
  const [openFileModalFor, setOpenFileModalFor] = useState<string | null>(null);
  const [selectedPatientForCertificates, setSelectedPatientForCertificates] = useState<string | null>(null);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const monthDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const [certificateRows, setCertificateRows] = useState<CertificateRow[]>([]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setIsTypeDropdownOpen(false);
      }
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target as Node)) {
        setIsMonthDropdownOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 5; year <= currentYear + 100; year++) {
      years.push(year);
    }
    return years;
  }, []);

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}月`
  }));

  const needsMedicalCertificate = (certificate: any, type: string) => {
    if (!certificate || !certificate.initialStartDate) return true;
    
    const startDate = new Date(certificate.initialStartDate);
    const today = new Date();
    const yearsSinceStart = Math.floor(
      (today.getTime() - startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );

    switch (type) {
      case '自立支援':
        return yearsSinceStart % 2 === 0;
      case '手帳':
      case '年金':
        return true;
      default:
        return false;
    }
  };

  const getCertificateRows = (patient: any) => {
    const rows: CertificateRow[] = [];
  
    if (!patient.medicalCertificate) {
      patient.medicalCertificate = { doctor: '', files: [] };
    }
  
    if (!patient.medicalCertificateStates) {
      patient.medicalCertificateStates = {};
    }
  
if (patient.selfSupportMedicalCertificate?.progress?.requestSent) {
  rows.push({
    id: `${patient.id}-self-new`,
    patient,
    type: '自立支援',
    renewalType: '新規',
    deadline: null,
    needsCertificate: true,
    priority: patient.medicalCertificateStates?.['自立支援']?.priority ?? '',
    staff: patient.medicalCertificateStates?.['自立支援']?.staff ?? '',
    status: patient.medicalCertificateStates?.['自立支援']?.status ?? '未',
    applicationDate: patient.selfSupportStatus?.applicationDate
  });
}

  if (patient.disabilityMedicalCertificate?.progress?.requestSent) {
  rows.push({
    id: `${patient.id}-disability-new`,
    patient,
    type: '手帳',
    renewalType: '新規',
    deadline: null,
    needsCertificate: true,
    priority: patient.medicalCertificateStates?.['手帳']?.priority ?? '',
    staff: patient.medicalCertificateStates?.['手帳']?.staff ?? '',
    status: patient.medicalCertificateStates?.['手帳']?.status ?? '未',
    applicationDate: patient.disabilityStatus?.applicationDate
  });
}


if (patient.pensionMedicalCertificate?.progress?.requestSent) {
  rows.push({
    id: `${patient.id}-pension-new`,
    patient,
    type: '年金',
    renewalType: '新規',
    deadline: null,
    needsCertificate: true,
    priority: patient.medicalCertificateStates?.['年金']?.priority ?? '',
    staff: patient.medicalCertificateStates?.['年金']?.staff ?? '',
    status: patient.medicalCertificateStates?.['年金']?.status ?? '未',
    applicationDate: patient.pensionStatus?.applicationDate
  });
}

    const handleRenewal = () => {
     const self = patient.selfSupportStatus;
const dis = patient.disabilityStatus;
const pen = patient.pensionStatus;

const selfMedical = patient.selfSupportMedicalCertificate;
const disMedical = patient.disabilityMedicalCertificate;
const penMedical = patient.pensionMedicalCertificate;

    
      const selfValidUntil = self?.validUntil;
      const disValidUntil = dis?.validUntil;
      const penValidUntil = pen?.validUntil;
    
      
      
      const canSimultaneousRenew =
        self?.status === 'ACTIVE' &&
        dis?.status === 'ACTIVE' &&
        selfValidUntil &&
        disValidUntil &&
        Math.abs(new Date(selfValidUntil).getTime() - new Date(disValidUntil).getTime()) <= 90 * 24 * 60 * 60 * 1000;
      
      if (canSimultaneousRenew) {
        const needsSelf = needsMedicalCertificate(self, '自立支援');
        const needsDis = needsMedicalCertificate(dis, '手帳');
 rows.push({
  id: `${patient.id}-combined-renewal`,
  patient,
  type: '自立支援＋手帳',
  renewalType: '更新',
  deadline: patient.selfSupportStatus?.validUntil, // どちらか代表でOK
  needsCertificate:
    needsMedicalCertificate(patient.selfSupportStatus, '自立支援') ||
    needsMedicalCertificate(patient.disabilityStatus, '手帳'),
  priority: patient.medicalCertificateStates?.['自立支援']?.priority ?? '',
  staff: patient.medicalCertificateStates?.['自立支援']?.staff ?? '',
  status: patient.medicalCertificateStates?.['自立支援']?.status ?? '',
  applicationDate: patient.selfSupportStatus?.applicationDate
});

      } else {
        if (self?.status === 'ACTIVE' && selfValidUntil) {
     rows.push({
  id: `${patient.id}-self-renewal`,
  patient,
  type: '自立支援',
  renewalType: '更新',
  deadline: patient.selfSupportStatus?.validUntil,
  needsCertificate: needsMedicalCertificate(patient.selfSupportStatus, '自立支援'),
  priority: patient.medicalCertificateStates?.['自立支援']?.priority ?? '',
  staff: patient.medicalCertificateStates?.['自立支援']?.staff ?? '',
  status: patient.medicalCertificateStates?.['自立支援']?.status ?? '',
  applicationDate: patient.selfSupportStatus?.applicationDate
});

        }
      
        if (dis?.status === 'ACTIVE'  && disValidUntil) {
   rows.push({
  id: `${patient.id}-disability-renewal`,
  patient,
  type: '手帳',
  renewalType: '更新',
  deadline: patient.disabilityStatus?.validUntil,
  needsCertificate: needsMedicalCertificate(patient.disabilityStatus, '手帳'),
  priority: patient.medicalCertificateStates?.['手帳']?.priority ?? '',
  staff: patient.medicalCertificateStates?.['手帳']?.staff ?? '',
  status: patient.medicalCertificateStates?.['手帳']?.status ?? '',
  applicationDate: patient.disabilityStatus?.applicationDate
});

        }
      }
      
      if (pen?.status === 'ACTIVE' && penValidUntil) {
rows.push({
  id: `${patient.id}-pension-renewal`,
  patient,
  type: '年金',
  renewalType: '更新',
  deadline: patient.pensionStatus?.validUntil,
  needsCertificate: needsMedicalCertificate(patient.pensionStatus, '年金'),
  priority: patient.medicalCertificateStates?.['年金']?.priority ?? '',
  staff: patient.medicalCertificateStates?.['年金']?.staff ?? '',
  status: patient.medicalCertificateStates?.['年金']?.status ?? '',
  applicationDate: patient.pensionStatus?.applicationDate
});

      }
    };
    

  
    handleRenewal();
    return rows;
  };
  

  useEffect(() => {
    if (certificateRows.length === 0 && activePatients.length > 0) {
      const allRows = activePatients.flatMap(patient => getCertificateRows(patient));
      setCertificateRows(allRows);
    }
  }, [activePatients]);

const updateCertificateRow = (rowId: string, field: 'priority' | 'staff' | 'status', value: string) => {
  setCertificateRows(prevRows => 
    prevRows.map(row => 
      row.id === rowId 
        ? { ...row, [field]: value }
        : row
    )
  );

  const row = certificateRows.find(r => r.id === rowId);
  if (!row) return;

  const patient = activePatients.find(p => p.id === row.patient.id);
  if (!patient) return;

  const updatedPatient = { ...patient };

  if (!updatedPatient.medicalCertificateStates) {
    updatedPatient.medicalCertificateStates = {};
  }

  if (!updatedPatient.medicalCertificateStates[row.type]) {
    updatedPatient.medicalCertificateStates[row.type] = {
      priority: '',
      staff: '',
      status: ''
    };
  }

  updatedPatient.medicalCertificateStates[row.type][field] = value;
  updatedPatient.updatedAt = new Date().toISOString();

  updatePatient(updatedPatient);
};


  const handleDoctorChange = (patientId: string, value: string | null) => {
    const patient = activePatients.find(p => p.id === patientId);
    if (!patient) return;

    const updatedPatient = { ...patient };
    updatedPatient.medicalCertificate.doctor = value as keyof typeof doctors;

    updatedPatient.updatedAt = new Date().toISOString();
    updatePatient(updatedPatient);
  };

  const filteredRows = useMemo(() => {
    let filtered = [...certificateRows];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(row => 
        row.patient.name.toLowerCase().includes(searchLower) ||
        row.patient.nameKana.toLowerCase().includes(searchLower) ||
        row.patient.chartNumber.toLowerCase().includes(searchLower)
      );
    }

    if (selectedCertificateTypes.size > 0) {
      filtered = filtered.filter(row => selectedCertificateTypes.has(row.type));
    }

    if (filterRenewalType) {
      filtered = filtered.filter(row => row.renewalType === filterRenewalType);
    }

    if (filterPriority) {
      filtered = filtered.filter(row => row.priority === filterPriority);
    }

    if (filterDoctor) {
      filtered = filtered.filter(row => row.patient.medicalCertificate.doctor === filterDoctor);
    }

    if (filterStaff) {
      filtered = filtered.filter(row => row.staff === filterStaff);
    }

    if (selectedYear !== '') {
      filtered = filtered.filter(row => {
        if (!row.deadline) return false;
        const deadline = new Date(row.deadline);
        if (deadline.getFullYear() !== selectedYear) return false;
        return selectedMonths.size === 0 || selectedMonths.has(deadline.getMonth() + 1);
      });
    }

    if (selectedStatuses.size > 0) {
      filtered = filtered.filter(row => selectedStatuses.has(row.status || '未'));
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'deadline':
          comparison = new Date(a.deadline || 0).getTime() - new Date(b.deadline || 0).getTime();
          break;
        case 'applicationDate':
          const aDate = a.applicationDate || '';
          const bDate = b.applicationDate || '';
          comparison = aDate.localeCompare(bDate);
          break;
        default:
          comparison = 0;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [
    certificateRows,
    searchTerm,
    selectedCertificateTypes,
    filterRenewalType,
    filterPriority,
    filterDoctor,
    filterStaff,
    selectedYear,
    selectedMonths,
    selectedStatuses,
    sortField,
    sortDirection
  ]);

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
      <h1 className="text-2xl font-bold">診断書管理</h1>

      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="患者名、カルテ番号で検索..."
            className="w-full pl-10 pr-4 py-2 border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex space-x-2">
           <select
  value={selectedYear}
  onChange={(e) => setSelectedYear(e.target.value === '' ? '' : Number(e.target.value))}
  className={`border rounded-md px-3 py-2 ${selectedYear === '' ? 'text-gray-400' : 'text-gray-900'}`}
>

              <option value="">年で絞込</option>
              {yearOptions.map(year => (
                <option key={year} value={year} className="text-gray-900">{year}年</option>
              ))}
            </select>

            <div className="relative" ref={monthDropdownRef}>
              <button
                onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
                className="border px-4 py-2 rounded-md bg-white hover:bg-gray-50 min-w-[150px] text-left flex items-center justify-between"
              >
               <span className={`${selectedMonths.size === 0 ? 'text-gray-400' : 'text-gray-900'}`}>
  {selectedMonths.size === 0
    ? '月で絞込'
    : selectedMonths.size === 12
      ? '全ての月'
      : Array.from(selectedMonths).sort((a, b) => a - b).map(m => `${m}月`).join(', ')}
</span>

                <ChevronDown className="h-4 w-4" />
              </button>
              {isMonthDropdownOpen && (
                <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg border">
                  <div className="p-2">
                    {monthOptions.map(month => (
                      <label key={month.value} className="flex items-center px-2 py-1 hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={selectedMonths.has(month.value)}
                          onChange={(e) => {
                            const newMonths = new Set(selectedMonths);
                            if (e.target.checked) {
                              newMonths.add(month.value);
                            } else {
                              newMonths.delete(month.value);
                            }
                            setSelectedMonths(newMonths);
                          }}
                          className="mr-2"
                        />
                        {month.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={statusDropdownRef}>
              <button
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="border px-4 py-2 rounded-md bg-white hover:bg-gray-50 min-w-[150px] text-left flex items-center justify-between"
              >
         <span className={`${selectedStatuses.size === 0 ? 'text-gray-400' : 'text-gray-900'}`}>
  {selectedStatuses.size === 0
    ? '状態で絞込'
    : selectedStatuses.size === Object.keys(certificateStatusTypes).length
      ? '全ての状態'
      : Array.from(selectedStatuses).join(', ')}
</span>

                <ChevronDown className="h-4 w-4" />
              </button>
              {isStatusDropdownOpen && (
                <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg border">
                  <div className="p-2">
                    {Object.values(certificateStatusTypes).map(status => (
                      <label key={status} className="flex items-center px-2 py-1 hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={selectedStatuses.has(status)}
                          onChange={(e) => {
                            const newStatuses = new Set(selectedStatuses);
                            if (e.target.checked) {
                              newStatuses.add(status);
                            } else {
                              newStatuses.delete(status);
                            }
                            setSelectedStatuses(newStatuses);
                          }}
                          className="mr-2"
                        />
                        {status}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

      <select
  value={filterRenewalType}
  onChange={(e) => setFilterRenewalType(e.target.value)}
  className={`border rounded-md px-3 py-2 ${filterRenewalType === '' ? 'text-gray-400' : 'text-gray-900'}`}
>

            <option value="">新規/更新で絞込</option>
            {renewalTypes.map(type => (
              <option key={type} value={type} className="text-gray-900">{type}</option>
            ))}
          </select>

       
          <select
  value={filterPriority}
  onChange={(e) => setFilterPriority(e.target.value)}
  className={`border rounded-md px-3 py-2 ${filterPriority === '' ? 'text-gray-400' : 'text-gray-900'}`}
>

            <option value="">優先度で絞込</option>
            {Object.values(priorityTypes).map(priority => (
              <option key={priority} value={priority} className="text-gray-900">{priority}</option>
            ))}
          </select>

          <div className="flex space-x-2 ml-auto">
     <select
  value={filterDoctor}
  onChange={(e) => setFilterDoctor(e.target.value)}
  className={`border rounded-md px-3 py-2 text-sm w-32 ${filterDoctor === '' ? 'text-gray-400' : 'text-gray-900'}`}
>

              <option value="">担当医</option>
              {Object.values(doctors).map(doctor => (
                <option key={doctor} value={doctor} className="text-gray-900">{doctor}</option>
              ))}
            </select>

         <select
  value={filterStaff}
  onChange={(e) => setFilterStaff(e.target.value)}
  className={`border rounded-md px-3 py-2 text-sm w-32 ${filterStaff === '' ? 'text-gray-400' : 'text-gray-900'}`}
>

              <option value="">担当者</option>
              {Object.values(staffMembers).map(staff => (
                <option key={staff} value={staff} className="text-gray-900">{staff}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                カルテ番号
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                患者名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                保険
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                新規/更新
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                診断書
              </th>
              <SortableHeader field="applicationDate">新規受付日</SortableHeader>
              <SortableHeader field="deadline">更新期限</SortableHeader>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                優先度
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                担当医
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                担当者
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状態
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                ファイル
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRows.map((row) => (
              <tr 
                key={row.id}
                className={
                  row.renewalType === '新規' ? 'bg-pink-50' :
                  row.renewalType === '更新' ? 'bg-green-50' : ''
                }
              >
                <td className="px-6 py-4">{row.patient.chartNumber}</td>
                <td className="px-6 py-4">
                  <div className="flex items-start space-x-2">
                    <div>
                      <div>{row.patient.name}</div>
                      <div className="text-sm text-gray-500">{row.patient.nameKana}</div>
                    </div>
                    <button
                      onClick={() => setSelectedPatientForCertificates(row.patient.id)}
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
                <td className="px-6 py-4">
                  <span className="text-sm">
                    {insuranceTypes[row.patient.insuranceType]}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm">
                    {row.renewalType || '-'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span>{row.type}</span>
                </td>
                <td className="px-6 py-4">
                  {row.renewalType === '新規' && row.patient[`${row.type === '自立支援' ? 'selfSupportCertificate' : row.type === '手帳' ? 'disabilityCertificate' : 'pensionStatus'}`].progress?.requestSent
                    ? (row.applicationDate
                        ? new Date(row.applicationDate).toLocaleDateString('ja-JP')
                        : '-')
                    : '-'}
                </td>
                <td className="px-6 py-4">
                  {row.renewalType === '新規' ? (
                    <span>-</span>
                  ) : (
                    <span>
                      {row.deadline ? 
                        new Date(row.deadline).toLocaleDateString('ja-JP') :
                        '-'
                      }
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
             <EditableCell
  value={row.patient.medicalCertificateStates?.[row.type]?.priority ?? row.priority ?? ''}
  onChange={(value) => updateCertificateRow(row.id, 'priority', value)}
  type="select"
  options={Object.values(priorityTypes)}
  allowEmpty
/>

                </td>
                <td className="px-6 py-4">
                  <EditableCell
                    value={row.patient.medicalCertificate?.doctor || ''}
                    onChange={(value) => handleDoctorChange(row.patient.id, value)}
                    type="select"
                    options={Object.values(doctors)}
                    allowEmpty
                  />
                </td>
                <td className="px-6 py-4">
     <EditableCell
  value={row.patient.medicalCertificateStates?.[row.type]?.staff ?? row.staff ?? ''}
  onChange={(value) => updateCertificateRow(row.id, 'staff', value)}
  type="select"
  options={Object.values(staffMembers)}
  allowEmpty
/>

                </td>
                <td className="px-6 py-4">
 <EditableCell
  value={row.patient.medicalCertificateStates?.[row.type]?.status ?? row.status ?? ''}
  onChange={(value) => updateCertificateRow(row.id, 'status', value)}
  type="select"
  options={Object.values(certificateStatusTypes)}
  allowEmpty
/>

                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => setOpenFileModalFor(row.patient.id)}
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
          patient={activePatients.find(p => p.id === selectedPatientForCertificates)!}
          onClose={() => setSelectedPatientForCertificates(null)}
          onUpdate={updatePatient}
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
    </div>
  );
};

export default MedicalCertificates;