'use client';

import { Users, BarChart3 } from 'lucide-react';

interface HeaderProps {
  currentPage: string;
}

export default function Header({ currentPage }: HeaderProps) {
  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard':
        return 'ダッシュボード';
      case 'customers':
        return '顧客管理';
      case 'orders':
        return '注文管理';
      case 'contact':
        return '連絡管理';
      default:
        return '顧客管理ツール';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container-main flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CRM System</h1>
            <p className="text-sm text-gray-500">{getPageTitle()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <BarChart3 className="w-5 h-5" />
          <span className="text-sm">顧客管理ツール</span>
        </div>
      </div>
    </header>
  );
}
