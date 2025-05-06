import React, { useState, useMemo, useRef, useEffect } from 'react';
import { usePatients } from '../context/PatientContext';
import EditableCell from '../components/EditableCell';
import { Search, ChevronDown } from 'lucide-react';

const insuranceTypes = {
  EMPLOYEE_SELF: '社本',
  EMPLOYEE_FAMILY: '社家',
  LIFE: '生保',
  NATIONAL: '国保'
} as const;

const statusTypes = ['未対応', '書類渡し済み', '変更済み'] as const;

const InsuranceChange: React.FC = () => {
  const { insuranceChanges, updateInsuranceChange } = usePatients();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set());
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredChanges = useMemo(() => {
    let filtered = [...insuranceChanges];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(record => 
        record.patientName.toLowerCase().includes(searchLower) ||
        record.chartNumber.toLowerCase().includes(searchLower)
      );
    }

    if (selectedStatuses.size > 0) {
      filtered = filtered.filter(record => 
        selectedStatuses.has(record.status)
      );
    }

    return filtered;
  }, [insuranceChanges, searchTerm, selectedStatuses]);

  const handleStatusChange = (recordId: string, field: string, value: string) => {
    const record = insuranceChanges.find(r => r.id === recordId);
    if (!record) return;

    const updatedRecord = { ...record };
    if (field === 'status') {
      updatedRecord.status = value as typeof statusTypes[number];
    }

    updateInsuranceChange(updatedRecord);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">保険変更</h1>

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

          <div className="relative" ref={statusDropdownRef}>
            <button
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className="border px-4 py-2 rounded-md bg-white hover:bg-gray-50 min-w-[150px] text-left flex items-center justify-between"
            >
              <span className={selectedStatuses.size === 0 ? 'text-gray-400' : 'text-gray-900'}>
                {selectedStatuses.size === 0
                  ? '状態で絞込'
                  : selectedStatuses.size === statusTypes.length
                    ? '全ての状態'
                    : Array.from(selectedStatuses).join(', ')}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>
            {isStatusDropdownOpen && (
              <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg border">
                <div className="p-2">
                  {statusTypes.map(status => (
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
                変更前
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                変更後
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                変更日
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状態
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                備考
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredChanges.map((record) => (
              <tr key={record.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {record.chartNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {record.patientName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {insuranceTypes[record.oldInsurance as keyof typeof insuranceTypes]}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {insuranceTypes[record.newInsurance as keyof typeof insuranceTypes]}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(record.changeDate).toLocaleDateString('ja-JP')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <EditableCell
                    value={record.status}
                    onChange={(value) => handleStatusChange(record.id, 'status', value)}
                    type="select"
                    options={statusTypes}
                  />
                </td>
                <td className="px-6 py-4">
                  <EditableCell
                    value={record.notes || ''}
                    onChange={(value) => handleStatusChange(record.id, 'notes', value)}
                    placeholder="備考"
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

export default InsuranceChange;