import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authAPI } from '../api/config';
import useAuthStore from '../store/useAuthStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data } = await authAPI.login(email, password);
      setAuth(data.user, data.token, data.stores);
      toast.success('ログインに成功しました');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (role) => {
    if (role === 'admin') {
      setEmail('admin@test.com');
      setPassword('password123');
    } else if (role === 'manager') {
      setEmail('manager@test.com');
      setPassword('password123');
    } else {
      setEmail('staff@test.com');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">シフト管理アプリ</h2>
          <p className="mt-2 text-sm text-gray-600">AI搭載のシフト・勤怠管理システム</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">パスワード</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>

          <div className="mt-6">
            <p className="text-center text-sm text-gray-600 mb-3">デモアカウント（クリックで入力）</p>
            <div className="flex flex-col space-y-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('admin')}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                管理者アカウント
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('manager')}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                マネージャーアカウント
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('staff')}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                スタッフアカウント
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
