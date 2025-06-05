import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Patient } from '../types/patient';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (patient: Partial<Patient>) => void;
}

const NewPatientModal: React.FC<NewPatientModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    nameKana: '',
    chartNumber: '',
    insuranceType: 'EMPLOYEE_SELF',
    selfSupportStatus: {
      hasSupport: false,
      validUntil: ''
    },
    disabilityStatus: {
      hasDisability: false,
      grade: '',
      validUntil: ''
    },
    pensionStatus: {
      hasPension: false,
      grade: '',
      validUntil: ''
    },
    medicalCertificate: {
      required: false,
      type: '',
      deadline: ''
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      status: 'APPLYING',
      chartProcessing: {
        preProcessing: false,
        postProcessing: false
      }
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">新規患者登録</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-6">
                {/* カルテ番号 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">カルテ番号</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.chartNumber}
                    onChange={(e) => setFormData({ ...formData, chartNumber: e.target.value })}
                  />
                </div>

                {/* 患者名 */}
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">患者名</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ふりがな</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.nameKana}
                      onChange={(e) => setFormData({ ...formData, nameKana: e.target.value })}
                    />
                  </div>
                </div>

                {/* 保険*/}
                <div>
                  <label className="block text-sm font-medium text-gray-700">保険</label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.insuranceType}
                    onChange={(e) => setFormData({ ...formData, insuranceType: e.target.value as any })}
                  >
                    <option value="EMPLOYEE_SELF">社本</option>
                    <option value="EMPLOYEE_FAMILY">社家</option>
                    <option value="LIFE">生保</option>
                    <option value="NATIONAL">国保</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-6">
                {/* 自立支援医療 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      checked={formData.selfSupportStatus.hasSupport}
                      onChange={(e) => setFormData({
                        ...formData,
                        selfSupportStatus: {
                          ...formData.selfSupportStatus,
                          hasSupport: e.target.checked
                        }
                      })}
                    />
                    <span className="ml-2 font-medium">自立支援医療</span>
                  </label>
                  {formData.selfSupportStatus.hasSupport && (
                    <div>
                      <label className="block text-sm text-gray-700">有効期限</label>
                      <input
                        type="date"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={formData.selfSupportStatus.validUntil}
                        onChange={(e) => setFormData({
                          ...formData,
                          selfSupportStatus: {
                            ...formData.selfSupportStatus,
                            validUntil: e.target.value
                          }
                        })}
                      />
                    </div>
                  )}
                </div>

                {/* 障害者手帳 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      checked={formData.disabilityStatus.hasDisability}
                      onChange={(e) => setFormData({
                        ...formData,
                        disabilityStatus: {
                          ...formData.disabilityStatus,
                          hasDisability: e.target.checked
                        }
                      })}
                    />
                    <span className="ml-2 font-medium">障害者手帳</span>
                  </label>
                  {formData.disabilityStatus.hasDisability && (
                    <div className="space-y-2">
                      <div>
                        <label className="block text-sm text-gray-700">等級</label>
                        <input
                          type="text"
                          placeholder="例: 2級"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={formData.disabilityStatus.grade}
                          onChange={(e) => setFormData({
                            ...formData,
                            disabilityStatus: {
                              ...formData.disabilityStatus,
                              grade: e.target.value
                            }
                          })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700">有効期限</label>
                        <input
                          type="date"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={formData.disabilityStatus.validUntil}
                          onChange={(e) => setFormData({
                            ...formData,
                            disabilityStatus: {
                              ...formData.disabilityStatus,
                              validUntil: e.target.value
                            }
                          })}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 年金 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      checked={formData.pensionStatus.hasPension}
                      onChange={(e) => setFormData({
                        ...formData,
                        pensionStatus: {
                          ...formData.pensionStatus,
                          hasPension: e.target.checked
                        }
                      })}
                    />
                    <span className="ml-2 font-medium">年金</span>
                  </label>
                  {formData.pensionStatus.hasPension && (
                    <div className="space-y-2">
                      <div>
                        <label className="block text-sm text-gray-700">等級</label>
                        <input
                          type="text"
                          placeholder="例: 2級"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={formData.pensionStatus.grade}
                          onChange={(e) => setFormData({
                            ...formData,
                            pensionStatus: {
                              ...formData.pensionStatus,
                              grade: e.target.value
                            }
                          })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700">有効期限</label>
                        <input
                          type="date"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={formData.pensionStatus.validUntil}
                          onChange={(e) => setFormData({
                            ...formData,
                            pensionStatus: {
                              ...formData.pensionStatus,
                              validUntil: e.target.value
                            }
                          })}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 診断書 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      checked={formData.medicalCertificate.required}
                      onChange={(e) => setFormData({
                        ...formData,
                        medicalCertificate: {
                          ...formData.medicalCertificate,
                          required: e.target.checked
                        }
                      })}
                    />
                    <span className="ml-2 font-medium">診断書必要</span>
                  </label>
                  {formData.medicalCertificate.required && (
                    <div className="space-y-2">
                      <div>
                        <label className="block text-sm text-gray-700">診断書の種類</label>
                        <input
                          type="text"
                    
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={formData.medicalCertificate.type}
                          onChange={(e) => setFormData({
                            ...formData,
                            medicalCertificate: {
                              ...formData.medicalCertificate,
                              type: e.target.value
                            }
                          })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700">提出期限</label>
                        <input
                          type="date"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={formData.medicalCertificate.deadline}
                          onChange={(e) => setFormData({
                            ...formData,
                            medicalCertificate: {
                              ...formData.medicalCertificate,
                              deadline: e.target.value
                            }
                          })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                登録
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewPatientModal;