import React from 'react';
import { useParams } from 'react-router-dom';
import { Patient } from '../types/patient';

const PatientDetail: React.FC = () => {
  const { id } = useParams();
  const [patient, setPatient] = React.useState<Patient | null>(null);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">患者詳細</h1>
      <div className="bg-white rounded-lg shadow p-6">
        {patient ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h2 className="text-lg font-semibold">基本情報</h2>
                <div className="mt-2 space-y-2">
                  <p>患者ID: {patient.id}</p>
                  <p>名前: {patient.name ?? '－'}</p>
                  <p>ふりがな: {patient.nameKana}</p>
                  <p>カルテ番号: {patient.chartNumber}</p>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold">保険情報</h2>
                <div className="mt-2">
                  <p>保険: {patient.insuranceType}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p>読み込み中...</p>
        )}
      </div>
    </div>
  );
};

export default PatientDetail;