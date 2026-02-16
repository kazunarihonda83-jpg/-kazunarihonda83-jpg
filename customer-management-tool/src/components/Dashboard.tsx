'use client';

import { Customer, Order } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Users, ShoppingCart, TrendingUp, Award } from 'lucide-react';

interface DashboardProps {
  customers: Customer[];
  orders: Order[];
}

export default function Dashboard({ customers, orders }: DashboardProps) {
  const totalRevenue = orders
    .filter((order) => order.status === 'completed')
    .reduce((sum, order) => sum + order.amount, 0);

  const activeCustomers = customers.length;
  const goldPlatinumCustomers = customers.filter(
    (c) => c.membershipTier === 'gold' || c.membershipTier === 'platinum'
  ).length;

  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="stat-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">総顧客数</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{activeCustomers}</p>
          </div>
          <Users className="w-12 h-12 text-blue-600 opacity-20" />
        </div>
      </div>

      <div className="stat-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">VIP顧客</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{goldPlatinumCustomers}</p>
          </div>
          <Award className="w-12 h-12 text-yellow-600 opacity-20" />
        </div>
      </div>

      <div className="stat-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">総売上</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(totalRevenue)}</p>
          </div>
          <TrendingUp className="w-12 h-12 text-green-600 opacity-20" />
        </div>
      </div>

      <div className="stat-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">平均注文額</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(avgOrderValue)}</p>
          </div>
          <ShoppingCart className="w-12 h-12 text-purple-600 opacity-20" />
        </div>
      </div>
    </div>
  );
}
