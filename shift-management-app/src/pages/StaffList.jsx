import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  UserPlus,
  Search,
  Edit,
  Trash2,
  Shield,
  Mail,
  Phone,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import useAuthStore from '../store/useAuthStore';
import { authAPI } from '../api/config';

const StaffList = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    hourly_wage: 1000,
    phone: '',
    hire_date: new Date().toISOString().split('T')[0],
  });

  // Fetch all staff members
  const { data: staffList, isLoading } = useQuery({
    queryKey: ['staffList'],
    queryFn: async () => {
      // Since we don't have a dedicated staff API endpoint, we'll use a placeholder
      // In a real application, you would have an API endpoint like: /api/users
      // For now, returning mock data
      return [
        {
          id: 1,
          name: '管理者ユーザー',
          email: 'admin@test.com',
          role: 'admin',
          hourly_wage: 2000,
          phone: '090-1234-5678',
          hire_date: '2023-01-01',
          is_active: true,
        },
        {
          id: 2,
          name: 'マネージャー',
          email: 'manager@test.com',
          role: 'manager',
          hourly_wage: 1500,
          phone: '090-2345-6789',
          hire_date: '2023-02-01',
          is_active: true,
        },
        {
          id: 3,
          name: 'スタッフA',
          email: 'staff@test.com',
          role: 'staff',
          hourly_wage: 1000,
          phone: '090-3456-7890',
          hire_date: '2023-03-01',
          is_active: true,
        },
      ];
    },
  });

  // Create staff mutation
  const createStaffMutation = useMutation({
    mutationFn: async (data) => {
      const response = await authAPI.register(data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('スタッフを追加しました');
      queryClient.invalidateQueries(['staffList']);
      setShowAddModal(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'スタッフの追加に失敗しました');
    },
  });

  // Update staff mutation (placeholder)
  const updateStaffMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      // Placeholder for update API
      toast.success('スタッフ情報を更新しました');
      return { id, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['staffList']);
      setShowEditModal(false);
      setSelectedStaff(null);
      resetForm();
    },
  });

  // Delete staff mutation (placeholder)
  const deleteStaffMutation = useMutation({
    mutationFn: async (id) => {
      // Placeholder for delete API
      toast.success('スタッフを削除しました');
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['staffList']);
    },
  });

  const resetForm = () => {
    setStaffForm({
      name: '',
      email: '',
      password: '',
      role: 'staff',
      hourly_wage: 1000,
      phone: '',
      hire_date: new Date().toISOString().split('T')[0],
    });
  };

  const handleAddStaff = () => {
    if (!staffForm.name || !staffForm.email || !staffForm.password) {
      toast.error('必須項目を入力してください');
      return;
    }

    createStaffMutation.mutate(staffForm);
  };

  const handleEditStaff = () => {
    if (!staffForm.name || !staffForm.email) {
      toast.error('必須項目を入力してください');
      return;
    }

    updateStaffMutation.mutate({
      id: selectedStaff.id,
      data: staffForm,
    });
  };

  const handleDeleteStaff = (staff) => {
    if (staff.id === user?.id) {
      toast.error('自分自身を削除することはできません');
      return;
    }

    if (window.confirm(`${staff.name}を削除しますか？`)) {
      deleteStaffMutation.mutate(staff.id);
    }
  };

  const openEditModal = (staff) => {
    setSelectedStaff(staff);
    setStaffForm({
      name: staff.name,
      email: staff.email,
      password: '',
      role: staff.role,
      hourly_wage: staff.hourly_wage,
      phone: staff.phone || '',
      hire_date: staff.hire_date,
    });
    setShowEditModal(true);
  };

  // Filter staff based on search and role filter
  const filteredStaff = staffList?.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || staff.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role) => {
    const badges = {
      admin: {
        color: 'bg-red-100 text-red-800',
        icon: Shield,
        label: '管理者',
      },
      manager: {
        color: 'bg-blue-100 text-blue-800',
        icon: Shield,
        label: 'マネージャー',
      },
      staff: {
        color: 'bg-green-100 text-green-800',
        icon: Users,
        label: 'スタッフ',
      },
    };

    const badge = badges[role] || badges.staff;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.label}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">スタッフ管理</h1>
          <p className="text-gray-600">スタッフの登録・編集・削除</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            <span>スタッフ追加</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">総スタッフ数</p>
              <p className="text-3xl font-bold text-gray-900">{staffList?.length || 0}</p>
            </div>
            <Users className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">管理者</p>
              <p className="text-3xl font-bold text-gray-900">
                {staffList?.filter((s) => s.role === 'admin').length || 0}
              </p>
            </div>
            <Shield className="w-12 h-12 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">マネージャー</p>
              <p className="text-3xl font-bold text-gray-900">
                {staffList?.filter((s) => s.role === 'manager').length || 0}
              </p>
            </div>
            <Shield className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">スタッフ</p>
              <p className="text-3xl font-bold text-gray-900">
                {staffList?.filter((s) => s.role === 'staff').length || 0}
              </p>
            </div>
            <Users className="w-12 h-12 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="スタッフ名またはメールアドレスで検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">すべての役割</option>
            <option value="admin">管理者</option>
            <option value="manager">マネージャー</option>
            <option value="staff">スタッフ</option>
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  スタッフ名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  役割
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  メールアドレス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  電話番号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  時給
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  入社日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状態
                </th>
                {(user?.role === 'admin' || user?.role === 'manager') && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    読み込み中...
                  </td>
                </tr>
              ) : filteredStaff && filteredStaff.length > 0 ? (
                filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {staff.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(staff.role)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {staff.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        {staff.phone || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <DollarSign className="w-4 h-4 mr-1 text-gray-400" />
                        {staff.hourly_wage?.toLocaleString()}円
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {staff.hire_date}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {staff.is_active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          有効
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <XCircle className="w-3 h-3 mr-1" />
                          無効
                        </span>
                      )}
                    </td>
                    {(user?.role === 'admin' || user?.role === 'manager') && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditModal(staff)}
                            className="text-blue-600 hover:text-blue-900"
                            title="編集"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStaff(staff)}
                            className="text-red-600 hover:text-red-900"
                            title="削除"
                            disabled={staff.id === user?.id}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    スタッフが見つかりません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">スタッフ追加</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    氏名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={staffForm.name}
                    onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="山田 太郎"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    メールアドレス <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={staffForm.email}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="staff@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    パスワード <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={staffForm.password}
                    onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="8文字以上"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
                  <input
                    type="tel"
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="090-1234-5678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">役割</label>
                  <select
                    value={staffForm.role}
                    onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="staff">スタッフ</option>
                    <option value="manager">マネージャー</option>
                    <option value="admin">管理者</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">時給（円）</label>
                  <input
                    type="number"
                    value={staffForm.hourly_wage}
                    onChange={(e) =>
                      setStaffForm({ ...staffForm, hourly_wage: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">入社日</label>
                  <input
                    type="date"
                    value={staffForm.hire_date}
                    onChange={(e) => setStaffForm({ ...staffForm, hire_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                キャンセル
              </button>
              <button
                onClick={handleAddStaff}
                disabled={createStaffMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {createStaffMutation.isPending ? '追加中...' : '追加'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditModal && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">スタッフ編集</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    氏名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={staffForm.name}
                    onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    メールアドレス <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={staffForm.email}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    新しいパスワード（変更する場合）
                  </label>
                  <input
                    type="password"
                    value={staffForm.password}
                    onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="変更しない場合は空欄"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
                  <input
                    type="tel"
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">役割</label>
                  <select
                    value={staffForm.role}
                    onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="staff">スタッフ</option>
                    <option value="manager">マネージャー</option>
                    <option value="admin">管理者</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">時給（円）</label>
                  <input
                    type="number"
                    value={staffForm.hourly_wage}
                    onChange={(e) =>
                      setStaffForm({ ...staffForm, hourly_wage: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">入社日</label>
                  <input
                    type="date"
                    value={staffForm.hire_date}
                    onChange={(e) => setStaffForm({ ...staffForm, hire_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedStaff(null);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                キャンセル
              </button>
              <button
                onClick={handleEditStaff}
                disabled={updateStaffMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {updateStaffMutation.isPending ? '更新中...' : '更新'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffList;
