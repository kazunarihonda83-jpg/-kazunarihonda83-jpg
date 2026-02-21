import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, ClipboardList, Clock, BarChart3, Users, Star, LogOut, FileText, CheckSquare } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const Layout = ({ children }) => {
  const { user, logout, isManager } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'ダッシュボード', icon: Home },
    { path: '/shifts/calendar', label: 'シフトカレンダー', icon: Calendar },
    ...(isManager() ? [{ path: '/shifts/management', label: 'シフト管理', icon: ClipboardList }] : []),
    ...(isManager() ? [{ path: '/shifts/approval', label: 'シフト希望承認', icon: CheckSquare }] : []),
    ...(!isManager() ? [{ path: '/shifts/request', label: 'シフト希望提出', icon: FileText }] : []),
    { path: '/attendance', label: '勤怠管理', icon: Clock },
    { path: '/evaluations', label: '評価管理', icon: Star },
    ...(isManager() ? [{ path: '/reports', label: 'レポート', icon: BarChart3 }] : []),
    ...(isManager() ? [{ path: '/staff', label: 'スタッフ', icon: Users }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-blue-600">シフト管理</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user?.first_name} {user?.last_name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                <LogOut size={18} />
                <span>ログアウト</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside className="w-64 bg-white shadow-sm min-h-[calc(100vh-4rem)]">
          <nav className="mt-5 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-md mb-1 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
