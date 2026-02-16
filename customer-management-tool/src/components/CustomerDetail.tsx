'use client';

import { Customer, Order } from '@/types';
import { getTierColor, getTierLabel, formatDate, formatCurrency } from '@/lib/utils';
import { X, Mail, Phone, MapPin, Building2 } from 'lucide-react';

interface CustomerDetailProps {
  customer: Customer;
  orders: Order[];
  membershipTiers: any[];
  onClose: () => void;
}

export default function CustomerDetail({
  customer,
  orders,
  membershipTiers,
  onClose,
}: CustomerDetailProps) {
  const currentTier = membershipTiers.find((t) => t.tier === customer.membershipTier);
  const customerOrders = orders.filter((o) => o.customerId === customer.id);
  const totalSpent = customerOrders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.amount, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{customer.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 基本情報 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">メールアドレス</p>
                  <p className="font-medium text-gray-900">{customer.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">電話番号</p>
                  <p className="font-medium text-gray-900">{customer.phone}</p>
                </div>
              </div>
              {customer.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">住所</p>
                    <p className="font-medium text-gray-900">{customer.address}</p>
                  </div>
                </div>
              )}
              {customer.company && (
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">企業</p>
                    <p className="font-medium text-gray-900">{customer.company}</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* メンバーシップ情報 */}
          <section className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">メンバーシップ情報</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">ランク</span>
                <span
                  className={`badge text-white ${getTierColor(customer.membershipTier)}`}
                >
                  {getTierLabel(customer.membershipTier)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">現在のポイント</span>
                <span className="text-2xl font-bold text-blue-600">{customer.points}</span>
              </div>
              {currentTier && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">特典:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {currentTier.benefits.map((benefit: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>

          {/* 購買履歴 */}
          <section className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">購買履歴</h3>
            {customerOrders.length > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600">総購買額</p>
                    <p className="text-xl font-bold text-blue-600">{formatCurrency(totalSpent)}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600">注文数</p>
                    <p className="text-xl font-bold text-green-600">{customerOrders.length}</p>
                  </div>
                </div>
                {customerOrders.slice(0, 3).map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">{order.id}</p>
                      <span
                        className={`badge text-xs ${
                          order.status === 'completed'
                            ? 'badge-green'
                            : order.status === 'pending'
                            ? 'badge-yellow'
                            : 'badge-red'
                        }`}
                      >
                        {order.status === 'completed' ? '完了' : order.status === 'pending' ? '保留中' : 'キャンセル'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{formatDate(order.orderDate)}</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(order.amount)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">注文履歴がありません</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
