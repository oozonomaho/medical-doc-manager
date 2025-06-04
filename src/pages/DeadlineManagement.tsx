import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Clock, Info, ChevronDown } from 'lucide-react';
import { usePatients } from '../context/PatientContext';
import EditableCell from '../components/EditableCell';
import CertificateDetailsModal from '../components/CertificateDetailsModal';

type DeadlineType = '自立支援' | '障害者手帳' | '年金';
const allDeadlineTypes: DeadlineType[] = ['自立支援', '障害者手帳', '年金'];

const DeadlineManagement: React.FC = () => {
  const today = new Date();
  const [selectedTypes, setSelectedTypes] = useState<DeadlineType[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>(today.getFullYear().toString());
  const [selectedMonths, setSelectedMonths] = useState<Set<number>>(new Set());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [selectedPatientForCertificates, setSelectedPatientForCertificates] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const monthDropdownRef = useRef<HTMLDivElement>(null);
  const { activePatients, updatePatient } = usePatients();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target as Node)) {
        setMonthDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const yearOptions = useMemo(() => {
    const currentYear = today.getFullYear();
    const startYear = currentYear - 5;
    const endYear = currentYear + 100;
    return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
  }, [today]);

  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      return {
        value: month,
        label: `${month}月`
      };
    });
  }, []);

  const toggleType = (type: DeadlineType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

const getNextAction = (medical: any) => {
  const progress = medical?.progress || {};
  if (!progress.docsReady) return '書類準備';
  if (!progress.docsHanded) return '書類渡し';
  if (!progress.docsReceived) return '書類受取';
  if (!progress.docsSent) return '送付';
  return '完了';
};


const getCertificateType = (patient: any, type: DeadlineType) => {
  switch (type) {
    case '自立支援':
      return patient.selfSupportStatus?.status === 'ACTIVE' ? '自立支援' : '不要';
    case '障害者手帳':
      return patient.disabilityStatus?.status === 'ACTIVE' ? '手帳' : '不要';
    case '年金':
      return patient.pensionStatus?.status === 'ACTIVE' ? '年金' : '不要';
    default:
      return '-';
  }
};

const isSimultaneousApplicationPossible = (patient: any, type: DeadlineType) => {
  if (type === '年金') return null;

  const selfSupportDate = new Date(patient.selfSupportStatus?.validUntil);
  const disabilityDate = new Date(patient.disabilityStatus?.validUntil);

  if (!selfSupportDate || !disabilityDate || isNaN(selfSupportDate) || isNaN(disabilityDate)) return false;

  const diffTime = Math.abs(selfSupportDate.getTime() - disabilityDate.getTime());
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  return diffDays <= 90;
};


  const deadlinePatients = useMemo(() => {
    const results: any[] = [];

    activePatients.forEach((patient) => {
      selectedTypes.forEach((type) => {
        let deadline;
         let status;
         let medical;
        let hasRequirement = false;

switch (type) {
  case '自立支援':
    status = patient.selfSupportStatus;
    medical = patient.selfSupportMedicalCertificate;
    deadline = status?.validUntil;
    hasRequirement = status?.status === 'ACTIVE';
    break;
  case '障害者手帳':
    status = patient.disabilityStatus;
    medical = patient.disabilityMedicalCertificate;
    deadline = status?.validUntil;
    hasRequirement = status?.status === 'ACTIVE';
    break;
  case '年金':
    status = patient.pensionStatus;
    medical = patient.pensionMedicalCertificate;
    deadline = status?.validUntil;
    hasRequirement = status?.status === 'ACTIVE';
    break;
}


        if (!deadline || !hasRequirement) return;

        const date = new Date(deadline);
        const year = date.getFullYear().toString();
        const month = date.getMonth() + 1;

        if (year === selectedYear && (selectedMonths.size === 0 || selectedMonths.has(month))) {
          const simultaneousApplication = isSimultaneousApplicationPossible(patient, type);
          
          let certificateType = '';
          switch (type) {
            case '自立支援':
              certificateType = '自立支援';
              break;
            case '障害者手帳':
              certificateType = '手帳';
              break;
            case '年金':
              certificateType = '年金';
              break;
          }

          results.push({
            id: patient.id,
            name: patient.name,
            nameKana: patient.nameKana,
            type,
            certificateType: getCertificateType(patient, type),
            deadline,
           
            nextAction: getNextAction(medical),
certificateStatus: status?.status || '未',

            notes: patient.notes,
            simultaneousApplication
          });
        }
      });
    });

    return results.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [activePatients, selectedYear, selectedMonths, selectedTypes]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">期限管理</h1>

      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex space-x-4">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border rounded-md px-4 py-2 w-28"
          >
            {yearOptions.map(year => (
              <option key={year} value={year}>{year}年</option>
            ))}
          </select>

          <div className="relative" ref={monthDropdownRef}>
            <button
              onClick={() => setMonthDropdownOpen(!monthDropdownOpen)}
              className="border px-4 py-2 rounded-md bg-white text-left min-h-[38px] min-w-[200px] flex items-center justify-between"
            >
              <span className={selectedMonths.size === 0 ? 'text-gray-400' : ''}>
                {selectedMonths.size === 0
                  ? '月で絞込'
                  : selectedMonths.size === 12
                    ? '全ての月'
                    : Array.from(selectedMonths).sort((a, b) => a - b).map(m => `${m}月`).join(', ')}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>
            {monthDropdownOpen && (
              <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  {monthOptions.map(month => (
                    <label key={month.value} className="flex items-center px-4 py-2 hover:bg-gray-100">
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

          <div className="relative w-52" ref={dropdownRef}>
            <button
              className="border px-4 py-2 w-full rounded-md bg-white text-left min-h-[38px]"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {selectedTypes.length === 0
                ? <span className="text-gray-400">期限タイプを選択</span>
                : selectedTypes.length === allDeadlineTypes.length
                  ? '全種類'
                  : selectedTypes.join(', ')}
            </button>
            {dropdownOpen && (
              <div className="absolute z-10 bg-white shadow border mt-1 rounded-md w-full max-h-60 overflow-auto">
                {allDeadlineTypes.map(type => (
                  <label key={type} className="flex items-center px-4 py-2 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type)}
                      onChange={() => toggleType(type)}
                      className="mr-2"
                    />
                    {type}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {deadlinePatients.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          <Clock className="h-12 w-12 mx-auto mb-2" />
          <p>選択した期間に更新期限を迎える書類はありません</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">患者名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">種類</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">期限</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">次のアクション</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">診断書状況</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">同時申請</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">備考</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deadlinePatients.map((entry) => (
                <tr key={`${entry.id}-${entry.type}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-start space-x-2">
                      <div>
                        <div>{entry.name}</div>
                        <div className="text-sm text-gray-500">{entry.nameKana}</div>
                      </div>
                      <button
                        onClick={() => setSelectedPatientForCertificates(entry.id)}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {entry.certificateType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(entry.deadline).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {entry.nextAction}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {entry.certificateStatus}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {entry.simultaneousApplication === null ? (
                      '-'
                    ) : entry.simultaneousApplication ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        同時申請可能
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4">{entry.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedPatientForCertificates && (
        <CertificateDetailsModal
          patient={activePatients.find(p => p.id === selectedPatientForCertificates)!}
          onClose={() => setSelectedPatientForCertificates(null)}
          onUpdate={updatePatient}
        />
      )}
    </div>
  );
};

export default DeadlineManagement;