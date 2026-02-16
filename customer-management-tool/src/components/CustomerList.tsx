'use client';

import { Customer } from '@/types';
import { getTierColor, getTierLabel, formatDate } from '@/lib/utils';
import { Mail, Phone, Eye } from 'lucide-react';

interface CustomerListProps {
  customers: Customer[];
  onSelectCustomer: (customer: Customer) => void;
}

export default function CustomerList({
  customers,
  onSelectCustomer,
}: CustomerListProps) {
  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">顧客一覧</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                顧客名
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                メンバーシップ
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                ポイント
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                最終購入日
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                アクション
              </th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr
                key={customer.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{customer.name}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {customer.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {customer.phone}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`badge text-white text-xs font-semibold ${getTierColor(
                      customer.membershipTier
                    )}`}
                  >
                    {getTierLabel(customer.membershipTier)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="font-semibold text-gray-900">{customer.points}</p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {customer.lastPurchaseDate
                    ? formatDate(customer.lastPurchaseDate)
                    : '購入なし'}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onSelectCustomer(customer)}
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
