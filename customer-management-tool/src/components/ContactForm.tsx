'use client';

import { useState } from 'react';
import { Customer, ContactLog } from '@/types';
import { Mail, Send } from 'lucide-react';

interface ContactFormProps {
  customers: Customer[];
  onSubmit: (log: Omit<ContactLog, 'id'>) => void;
}

export default function ContactForm({ customers, onSubmit }: ContactFormProps) {
  const [formData, setFormData] = useState({
    customerId: customers[0]?.id || '',
    type: 'email' as const,
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newLog: Omit<ContactLog, 'id'> = {
      customerId: formData.customerId,
      type: formData.type,
      subject: formData.subject,
      message: formData.message,
      sentDate: new Date(),
      status: 'sent',
    };

    onSubmit(newLog);

    // Reset form
    setFormData({
      customerId: customers[0]?.id || '',
      type: 'email',
      subject: '',
      message: '',
    });
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <Mail className="w-6 h-6 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">新しい連絡を追加</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 顧客選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            顧客
          </label>
          <select
            value={formData.customerId}
            onChange={(e) =>
              setFormData({ ...formData, customerId: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name} ({customer.email})
              </option>
            ))}
          </select>
        </div>

        {/* 連絡タイプ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            連絡タイプ
          </label>
          <select
            value={formData.type}
            onChange={(e) =>
              setFormData({
                ...formData,
                type: e.target.value as 'email' | 'sms' | 'call' | 'note',
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="email">メール</option>
            <option value="sms">SMS</option>
            <option value="call">電話</option>
            <option value="note">ノート</option>
          </select>
        </div>

        {/* 件名 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            件名
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) =>
              setFormData({ ...formData, subject: e.target.value })
            }
            placeholder="例: キャンペーン通知"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* メッセージ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            メッセージ
          </label>
          <textarea
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            placeholder="詳細を入力してください..."
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            required
          />
        </div>

        {/* 送信ボタン */}
        <button
          type="submit"
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          <span>送信</span>
        </button>
      </form>
    </div>
  );
}
