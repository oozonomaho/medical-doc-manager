import React from 'react';
import { Patient } from '../types/patient';

const Archive: React.FC = () => {
  const [archivedPatients, setArchivedPatients] = React.useState<Patient[]>([]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">アーカイブ</h1>
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
                状態
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                アーカイブ日
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {archivedPatients.map((patient) => (
              <tr key={patient.id}>
                <td className="px-6 py-4 whitespace-nowrap">{patient.chartNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">{patient.name ?? '－'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{patient.status}</td>
                <td className="px-6 py-4 whitespace-nowrap">{patient.updatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Archive;