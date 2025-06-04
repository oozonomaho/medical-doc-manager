import React from 'react';
import { X } from 'lucide-react';

interface InsuranceChangeConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  oldInsurance: string;
  newInsurance: string;
}

const InsuranceChangeConfirmModal: React.FC<InsuranceChangeConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  oldInsurance,
  newInsurance
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">保険変更の確認</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <p className="mb-4">
          保険を {oldInsurance} から {newInsurance} に変更します。
          <br />
          保険変更タブへ転記しますか？
        </p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            いいえ
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            はい
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsuranceChangeConfirmModal;