import React, { useRef } from 'react';
import { X, Eye, Download, Trash2 } from 'lucide-react';

type FileRecord = {
  id: string;
  name: string;
  uploadedAt: string;
  url: string;
};

type FileHistoryModalProps = {
  patient: {
    id: string;
    name: string;
    medicalCertificate: {
      files: FileRecord[];
    };
  };
  onClose: () => void;
  onUpload: (file: File, patientId: string) => void;
  onDelete: (fileId: string, patientId: string) => void;
};

const FileHistoryModal: React.FC<FileHistoryModalProps> = ({
  patient,
  onClose,
  onUpload,
  onDelete
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl relative">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">📁 診断書ファイル履歴（{patient.name}）</h2>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-600 hover:text-gray-800" />
          </button>
        </div>

        {/* ファイル一覧 */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {patient.medicalCertificate.files
            ?.slice() // ← 元データを変更しないようにコピー
            .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
            .map((file) => (
              <div key={file.id} className="flex justify-between items-center border-b pb-1">
                <div>
                  <div className="text-sm font-medium">{file.name}</div>
                  <div className="text-xs text-gray-400">{new Date(file.uploadedAt).toLocaleString()}</div>
                </div>
                <div className="flex space-x-2">
                  <a href={file.url} target="_blank" rel="noopener noreferrer">
                    <Eye className="w-5 h-5 text-blue-500 hover:text-blue-700" />
                  </a>
                  <a href={file.url} download>
                    <Download className="w-5 h-5 text-green-500 hover:text-green-700" />
                  </a>
              <button
  onClick={() => {
    if (confirm(`「${file.name}」を本当に削除しますか？`)) {
      onDelete(file.id, patient.id);
    }
  }}
>
  <Trash2 className="w-5 h-5 text-red-500 hover:text-red-700" />
</button>

                </div>
              </div>
            ))}
        </div>

        {/* アップロードボタン */}
        <div className="mt-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            + 新しいファイルをアップロード
          </button>
          <input
            type="file"
            className="hidden"
            accept=".doc,.docx,.pdf"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onUpload(file, patient.id);
                e.target.value = ''; // 同じファイル再選択を許可
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default FileHistoryModal;
