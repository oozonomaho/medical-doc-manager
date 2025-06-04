import React, { useState, useMemo } from 'react';
import { Clock, Search, ChevronDown, Info } from 'lucide-react';
import { usePatients } from '../context/PatientContext';
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

const PendingClaims: React.FC = () => {
  const { activePatients, updatePatient } = usePatients();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [selectedPatientForCertificates, setSelectedPatientForCertificates] = useState<string | null>(null);

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

  const filteredPatients = useMemo(() => {
    let filtered = activePatients.filter(patient => {
      // Only check completion date and status
     const completionDate = patient.selfSupportStatus?.completionDate;
   const status = patient.selfSupportStatus?.status;
      
      // Must have completion date and be in ONHOLD status
      if (!completionDate || status !== 'ONHOLD') return false;

      const completeDate = new Date(completionDate);
      const completeYear = completeDate.getFullYear();
      const completeMonth = completeDate.getMonth() + 1;

      // Only show patients in months after or equal to their completion date
      if (selectedYear < completeYear || 
         (selectedYear === completeYear && selectedMonth < completeMonth)) {
        return false;
      }

      return true;
    });

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(patient => 
        patient.name.toLowerCase().includes(searchLower) ||
        patient.nameKana.toLowerCase().includes(searchLower) ||
        patient.chartNumber.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [activePatients, searchTerm, selectedYear, selectedMonth]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">保留中</h1>

      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 relative">
            <button
              onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
              className="flex items-center justify-between px-3 py-2 border rounded-md bg-white hover:bg-gray-50 min-w-[120px]"
            >
              <span className="truncate mr-2">{selectedYear}年</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isYearDropdownOpen ? 'transform rotate-180' : ''}`} />
            </button>
            {isYearDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-36 bg-white rounded-md shadow-lg z-10 border max-h-60 overflow-y-auto">
                <div className="p-2">
                  {yearOptions.map(year => (
                    <button
                      key={year}
                      onClick={() => {
                        setSelectedYear(year);
                        setIsYearDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2 py-1 text-sm hover:bg-gray-50 rounded ${
                        selectedYear === year ? 'bg-blue-50 text-blue-700' : ''
                      }`}
                    >
                      {year}年
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 relative">
            <button
              onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
              className="flex items-center justify-between px-3 py-2 border rounded-md bg-white hover:bg-gray-50 min-w-[120px]"
            >
              <span className="truncate mr-2">{selectedMonth}月</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isMonthDropdownOpen ? 'transform rotate-180' : ''}`} />
            </button>
            {isMonthDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-36 bg-white rounded-md shadow-lg z-10 border">
                <div className="p-2">
                  {monthOptions.map(month => (
                    <button
                      key={month.value}
                      onClick={() => {
                        setSelectedMonth(month.value);
                        setIsMonthDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2 py-1 text-sm hover:bg-gray-50 rounded ${
                        selectedMonth === month.value ? 'bg-blue-50 text-blue-700' : ''
                      }`}
                    >
                      {month.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="患者名、ふりがな、カルテ番号で検索..."
            className="w-full pl-10 pr-4 py-2 border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {filteredPatients.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          <Clock className="h-12 w-12 mx-auto mb-2" />
          <p>保留中はありません</p>
        </div>
      ) : (
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
                  住所
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  自立支援
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  新規申請日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  備考
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <tr key={patient.id}>
                  <td className="px-6 py-4">{patient.chartNumber}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-2">
                      <div>
                        <div>{patient.name}</div>
                        <div className="text-sm text-gray-500">{patient.nameKana}</div>
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
                  <td className="px-6 py-4">
                    {insuranceTypes[patient.insuranceType]}
                  </td>
                  <td className="px-6 py-4">
                    {patient.municipality || '-'}
                  </td>
                  <td className="px-6 py-4">保留中</td>
                  <td className="px-6 py-4">
{patient.selfSupportStatus?.completionDate
  ? new Date(patient.selfSupportStatus.completionDate).toLocaleDateString('ja-JP')
  : '-'}

</td>
                  <td className="px-6 py-4">
                    {patient.notes || '-'}
                  </td>
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

export default PendingClaims;