'use client';

import { Order, Customer } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { X } from 'lucide-react';

interface OrderDetailProps {
  order: Order;
  customer?: Customer;
  onClose: () => void;
}

export default function OrderDetail({ order, customer, onClose }: OrderDetailProps) {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return '完了';
      case 'pending':
        return '保留中';
      case 'cancelled':
        return 'キャンセル';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">注文詳細</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 注文基本情報 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">注文情報</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">注文番号</p>
                <p className="font-semibold text-gray-900 text-lg">{order.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ステータス</p>
                <span
                  className={`badge text-sm font-semibold inline-block mt-1 ${getStatusColor(
                    order.status
                  )}`}
                >
                  {getStatusLabel(order.status)}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">注文日</p>
                <p className="font-semibold text-gray-900">{formatDate(order.orderDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">合計金額</p>
                <p className="font-bold text-lg text-blue-600">{formatCurrency(order.amount)}</p>
              </div>
            </div>
          </section>

          {/* 顧客情報 */}
          {customer && (
            <section className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">顧客情報</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-semibold text-gray-900">{customer.name}</p>
                <p className="text-sm text-gray-600 mt-1">{customer.email}</p>
                <p className="text-sm text-gray-600">{customer.phone}</p>
              </div>
            </section>
          )}

          {/* 注文アイテム */}
          <section className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">注文アイテム</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border border-gray-200 rounded-lg p-4"
                >
                  <div>
                    <p className="font-medium text-gray-900">{item.productName}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      単価: {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">数量</p>
                    <p className="text-2xl font-bold text-gray-900">{item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">小計</p>
                    <p className="text-lg font-bold text-blue-600">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 備考 */}
          {order.notes && (
            <section className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-700">備考</h3>
              <p className="text-gray-600 mt-2">{order.notes}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
