'use client';

import { Order, Customer } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Eye } from 'lucide-react';

interface OrderListProps {
  orders: Order[];
  customers: Customer[];
  onSelectOrder: (order: Order) => void;
}

export default function OrderList({
  orders,
  customers,
  onSelectOrder,
}: OrderListProps) {
  const getCustomerName = (customerId: string) => {
    return customers.find((c) => c.id === customerId)?.name || '不明';
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'badge-green';
      case 'pending':
        return 'badge-yellow';
      case 'cancelled':
        return 'badge-red';
      default:
        return 'badge-blue';
    }
  };

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

  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">注文一覧</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                注文番号
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                顧客名
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                日付
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                金額
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                ステータス
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                アクション
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                <td className="px-6 py-4 text-gray-900">{getCustomerName(order.customerId)}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{formatDate(order.orderDate)}</td>
                <td className="px-6 py-4 font-semibold text-gray-900">
                  {formatCurrency(order.amount)}
                </td>
                <td className="px-6 py-4">
                  <span className={`badge text-xs text-white ${getStatusBadgeClass(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onSelectOrder(order)}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">詳細</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
