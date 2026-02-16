'use client';

import { useState } from 'react';
import { Customer, Order, ContactLog } from '@/types';
import { sampleCustomers, sampleOrders, sampleContactLogs, membershipTiers } from '@/data/sampleData';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import CustomerList from '@/components/CustomerList';
import CustomerDetail from '@/components/CustomerDetail';
import OrderList from '@/components/OrderList';
import OrderDetail from '@/components/OrderDetail';
import ContactLogComponent from '@/components/ContactLog';
import ContactForm from '@/components/ContactForm';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [customers, setCustomers] = useState<Customer[]>(sampleCustomers);
  const [orders, setOrders] = useState<Order[]>(sampleOrders);
  const [contactLogs, setContactLogs] = useState<ContactLog[]>(sampleContactLogs);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleAddContactLog = (log: Omit<ContactLog, 'id'>) => {
    const newLog: ContactLog = {
      ...log,
      id: `C${Date.now()}`,
    };
    setContactLogs([newLog, ...contactLogs]);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <Dashboard customers={customers} orders={orders} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CustomerList
                customers={customers.slice(0, 4)}
                onSelectCustomer={setSelectedCustomer}
              />
              <OrderList
                orders={orders.slice(0, 4)}
                customers={customers}
                onSelectOrder={setSelectedOrder}
              />
            </div>
          </div>
        );

      case 'customers':
        return (
          <div className="space-y-8">
            <CustomerList
              customers={customers}
              onSelectCustomer={setSelectedCustomer}
            />
          </div>
        );

      case 'orders':
        return (
          <div className="space-y-8">
            <OrderList
              orders={orders}
              customers={customers}
              onSelectOrder={setSelectedOrder}
            />
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-8">
            <ContactForm customers={customers} onSubmit={handleAddContactLog} />
            <ContactLogComponent logs={contactLogs} customers={customers} />
          </div>
        );

      case 'settings':
        return (
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">設定</h2>
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-semibold text-gray-900 mb-2">メンバーシップレベル</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {membershipTiers.map((tier) => (
                    <div key={tier.tier} className="bg-gray-50 rounded-lg p-4">
                      <p className="font-semibold text-gray-900 capitalize">{tier.tier}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        必要ポイント: {tier.pointsRequired}
                      </p>
                      <p className="text-sm text-gray-600">
                        割引: {tier.discountPercentage}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-semibold text-gray-900 mb-2">システム情報</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>顧客数: {customers.length}</li>
                  <li>注文数: {orders.length}</li>
                  <li>連絡ログ: {contactLogs.length}</li>
                  <li>バージョン: 1.0.0</li>
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return <div>ページが見つかりません</div>;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <Header currentPage={currentPage} />
        <main className="flex-1 overflow-auto">
          <div className="container-main">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* モーダル */}
      {selectedCustomer && (
        <CustomerDetail
          customer={selectedCustomer}
          orders={orders}
          membershipTiers={membershipTiers}
          onClose={() => setSelectedCustomer(null)}
        />
      )}

      {selectedOrder && (
        <OrderDetail
          order={selectedOrder}
          customer={customers.find((c) => c.id === selectedOrder.customerId)}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
