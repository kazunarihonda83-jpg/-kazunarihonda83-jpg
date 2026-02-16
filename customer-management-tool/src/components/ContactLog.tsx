'use client';

import { ContactLog, Customer } from '@/types';
import { formatDatetime } from '@/lib/utils';
import { Mail, MessageSquare, Phone, FileText } from 'lucide-react';

interface ContactLogProps {
  logs: ContactLog[];
  customers: Customer[];
}

export default function ContactLogComponent({ logs, customers }: ContactLogProps) {
  const getCustomerName = (customerId: string) => {
    return customers.find((c) => c.id === customerId)?.name || '不明';
  };

  const getContactIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="w-5 h-5 text-blue-600" />;
      case 'sms':
        return <MessageSquare className="w-5 h-5 text-green-600" />;
      case 'call':
        return <Phone className="w-5 h-5 text-purple-600" />;
      case 'note':
        return <FileText className="w-5 h-5 text-gray-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const getContactLabel = (type: string) => {
    switch (type) {
      case 'email':
        return 'メール';
      case 'sms':
        return 'SMS';
      case 'call':
        return '電話';
      case 'note':
        return 'ノート';
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return 'badge-green';
      case 'failed':
        return 'badge-red';
      case 'pending':
        return 'badge-yellow';
      default:
        return 'badge-blue';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'sent':
        return '送信済み';
      case 'failed':
        return '失敗';
      case 'pending':
        return '保留中';
      default:
        return status;
    }
  };

  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">連絡ログ</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {logs.length > 0 ? (
          logs.map((log) => (
            <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-100 rounded-lg">{getContactIcon(log.type)}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {getCustomerName(log.customerId)}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{log.subject}</p>
                    </div>
                    <span
                      className={`badge text-xs text-white whitespace-nowrap ml-4 ${getStatusBadge(
                        log.status
                      )}`}
                    >
                      {getStatusLabel(log.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-2 bg-gray-50 rounded p-2">
                    {log.message}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      {getContactLabel(log.type)}
                    </span>
                    <span>{formatDatetime(log.sentDate)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-gray-500">
            <p>連絡ログがありません</p>
          </div>
        )}
      </div>
    </div>
  );
}
