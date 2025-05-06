import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: string;
  date: string;
  targetPatient?: string;
  notes: string;
  author: string;
}

const MessageBoard: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMessage, setNewMessage] = useState({
    notes: '',
    author: '',
    targetPatient: '',
  });

  const handleSubmit = () => {
    const message: Message = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      notes: newMessage.notes,
      author: newMessage.author || user?.username || '未設定',
      targetPatient: newMessage.targetPatient || undefined,
    };

    setMessages(prev => [...prev, message]);
    setNewMessage({ notes: '', author: '', targetPatient: '' });
    setIsModalOpen(false);
  };

  const handleDelete = (messageId: string) => {
    if (confirm('この申送りを削除してもよろしいですか？')) {
      setMessages(prev => prev.filter(message => message.id !== messageId));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">申送り</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          新規登録
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-[100px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                日付
              </th>
              <th className="w-[120px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                対象患者
              </th>
              <th className="px-2 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                備考
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                記入者
              </th>
              <th className="w-[80px] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {messages.map((message) => (
              <tr key={message.id}>
                <td className="w-[100px] px-6 py-4 whitespace-nowrap">
                  {new Date(message.date).toLocaleDateString('ja-JP')}
                </td>
                <td className="w-[120px] px-6 py-4 whitespace-nowrap">
                  {message.targetPatient || '-'}
                </td>
                <td className="px-2 py-4">
                  <div className="whitespace-pre-wrap">{message.notes}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {message.author}
                </td>
                <td className="w-[80px] px-6 py-4 text-center">
                  <button
                    onClick={() => handleDelete(message.id)}
                    className="text-red-500 hover:text-red-700"
                    title="削除"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-lg font-semibold mb-4">新規申送り登録</h2>
            
            <div className="space-y-4">
              <div className="w-[120px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  対象患者
                </label>
                <input
                  type="text"
                  className="w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-2 text-sm"
                  value={newMessage.targetPatient}
                  onChange={(e) => setNewMessage({ ...newMessage, targetPatient: e.target.value })}
                  placeholder="山田太郎"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  備考
                </label>
                <textarea
                  rows={4}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newMessage.notes}
                  onChange={(e) => setNewMessage({ ...newMessage, notes: e.target.value })}
                />
              </div>

              <div className="w-[120px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  記入者
                </label>
                <input
                  type="text"
                  className="w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-2 text-sm"
                  value={newMessage.author}
                  onChange={(e) => setNewMessage({ ...newMessage, author: e.target.value })}
                  placeholder="山田"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                登録
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBoard;