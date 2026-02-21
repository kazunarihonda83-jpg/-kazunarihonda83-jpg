import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Sparkles, Send, Trash2, Edit, X } from 'lucide-react';
import { toast } from 'sonner';
import useAuthStore from '../store/useAuthStore';
import { shiftAPI, positionAPI, authAPI } from '../api/config';

const ShiftManagement = () => {
  const { user, isManager } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [editingShift, setEditingShift] = useState(null);

  const [shiftForm, setShiftForm] = useState({
    userId: '',
    positionId: '',
    shiftDate: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '18:00',
    breakMinutes: 60,
    notes: ''
  });

  const [generateForm, setGenerateForm] = useState({
    startDate: format(startOfWeek(addWeeks(new Date(), 1)), 'yyyy-MM-dd'),
    endDate: format(endOfWeek(addWeeks(new Date(), 1)), 'yyyy-MM-dd')
  });

  const weekStart = format(startOfWeek(currentDate), 'yyyy-MM-dd');
  const weekEnd = format(endOfWeek(currentDate), 'yyyy-MM-dd');

  const { data: shifts = [], isLoading, refetch } = useQuery({
    queryKey: ['shifts-management', weekStart, weekEnd],
    queryFn: async () => {
      const { data } = await shiftAPI.getShifts({ storeId: 'store-main', startDate: weekStart, endDate: weekEnd });
      return data;
    }
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await authAPI.getAllUsers();
      return response.data.map(user => ({
        id: user.id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim()
      }));
    }
  });

  const { data: positions = [] } = useQuery({
    queryKey: ['positions'],
    queryFn: async () => {
      const { data } = await positionAPI.getPositions({ storeId: 'store-main' });
      return data;
    }
  });

  const createMutation = useMutation({
    mutationFn: (data) => shiftAPI.createShift({ ...data, storeId: 'store-main', status: 'draft' }),
    onSuccess: () => {
      toast.success('シフトを追加しました');
      setShowAddModal(false);
      setShiftForm({ userId: '', positionId: '', shiftDate: format(new Date(), 'yyyy-MM-dd'), startTime: '09:00', endTime: '18:00', breakMinutes: 60, notes: '' });
      refetch();
    },
    onError: (error) => toast.error(error.response?.data?.error || 'シフトの追加に失敗しました')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => shiftAPI.updateShift(id, data),
    onSuccess: () => {
      toast.success('シフトを更新しました');
      setEditingShift(null);
      refetch();
    },
    onError: (error) => toast.error(error.response?.data?.error || 'シフトの更新に失敗しました')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => shiftAPI.deleteShift(id),
    onSuccess: () => {
      toast.success('シフトを削除しました');
      refetch();
    },
    onError: (error) => toast.error(error.response?.data?.error || 'シフトの削除に失敗しました')
  });

  const generateMutation = useMutation({
    mutationFn: (data) => shiftAPI.generateShifts(data),
    onSuccess: (response) => {
      toast.success(`${response.data.count}件のシフトを生成しました`);
      setShowGenerateModal(false);
      refetch();
    },
    onError: (error) => toast.error(error.response?.data?.error || 'シフト生成に失敗しました')
  });

  const publishMutation = useMutation({
    mutationFn: (shiftIds) => shiftAPI.publishShifts(shiftIds),
    onSuccess: (response) => {
      toast.success(`${response.data.count}件のシフトを公開しました`);
      refetch();
    },
    onError: (error) => toast.error(error.response?.data?.error || 'シフト公開に失敗しました')
  });

  const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const handleThisWeek = () => setCurrentDate(new Date());

  const handleSubmitShift = (e) => {
    e.preventDefault();
    if (!shiftForm.userId || !shiftForm.positionId) {
      toast.error('スタッフとポジションを選択してください');
      return;
    }
    if (editingShift) {
      updateMutation.mutate({ id: editingShift.id, data: shiftForm });
    } else {
      createMutation.mutate(shiftForm);
    }
  };

  const handleEditShift = (shift) => {
    setEditingShift(shift);
    setShiftForm({
      userId: shift.user_id,
      positionId: shift.position_id,
      shiftDate: shift.shift_date,
      startTime: shift.start_time,
      endTime: shift.end_time,
      breakMinutes: shift.break_minutes || 0,
      notes: shift.notes || ''
    });
    setShowAddModal(true);
  };

  const handleDeleteShift = (shiftId) => {
    if (window.confirm('このシフトを削除しますか？')) {
      deleteMutation.mutate(shiftId);
    }
  };

  const handleGenerateShifts = () => {
    generateMutation.mutate({ storeId: 'store-main', ...generateForm });
  };

  const handlePublishShifts = () => {
    const draftShifts = shifts.filter(s => s.status === 'draft').map(s => s.id);
    if (draftShifts.length === 0) {
      toast.error('公開できる下書きシフトがありません');
      return;
    }
    if (window.confirm(`${draftShifts.length}件のシフトを公開しますか？`)) {
      publishMutation.mutate(draftShifts);
    }
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(currentDate), i));
  const groupedShifts = {};
  weekDays.forEach(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    groupedShifts[dateStr] = shifts.filter(s => s.shift_date === dateStr);
  });

  if (!isManager()) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">この機能は管理者・マネージャーのみアクセス可能です</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">シフト管理</h1>
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <button onClick={handlePrevWeek} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={handleThisWeek} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50">
              今週
            </button>
            <button onClick={handleNextWeek} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="text-lg font-semibold text-gray-900 ml-4">
              {format(startOfWeek(currentDate), 'M月d日')} - {format(endOfWeek(currentDate), 'M月d日')}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              <span>手動追加</span>
            </button>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Sparkles className="h-4 w-4" />
              <span>AI生成</span>
            </button>
            <button
              onClick={handlePublishShifts}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Send className="h-4 w-4" />
              <span>公開</span>
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500">読み込み中...</div>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayShifts = groupedShifts[dateStr] || [];
            return (
              <div key={dateStr} className="bg-white rounded-lg border p-3">
                <div className="text-center mb-3 pb-2 border-b">
                  <div className="text-sm text-gray-600">{format(day, 'E')}</div>
                  <div className="text-xl font-bold">{format(day, 'd')}</div>
                </div>
                <div className="space-y-2">
                  {dayShifts.map(shift => (
                    <div key={shift.id} className="p-2 rounded border text-xs" style={{ borderColor: shift.position_color, backgroundColor: shift.position_color + '10' }}>
                      <div className="flex items-start justify-between mb-1">
                        <div className="font-medium truncate">{shift.user_name}</div>
                        <div className="flex space-x-1">
                          <button onClick={() => handleEditShift(shift)} className="p-0.5 hover:bg-gray-200 rounded">
                            <Edit className="h-3 w-3" />
                          </button>
                          <button onClick={() => handleDeleteShift(shift.id)} className="p-0.5 hover:bg-red-100 rounded text-red-600">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <div className="text-gray-600">{shift.start_time}-{shift.end_time}</div>
                      <div className="text-gray-500 truncate">{shift.position_name}</div>
                      {shift.status === 'draft' && (
                        <div className="mt-1 text-xs text-orange-600 bg-orange-50 px-1 py-0.5 rounded">下書き</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editingShift ? 'シフト編集' : 'シフト追加'}</h2>
              <button onClick={() => { setShowAddModal(false); setEditingShift(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmitShift} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">スタッフ</label>
                <select value={shiftForm.userId} onChange={(e) => setShiftForm({...shiftForm, userId: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required>
                  <option value="">選択してください</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ポジション</label>
                <select value={shiftForm.positionId} onChange={(e) => setShiftForm({...shiftForm, positionId: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required>
                  <option value="">選択してください</option>
                  {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
                <input type="date" value={shiftForm.shiftDate} onChange={(e) => setShiftForm({...shiftForm, shiftDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">開始時刻</label>
                  <input type="time" value={shiftForm.startTime} onChange={(e) => setShiftForm({...shiftForm, startTime: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">終了時刻</label>
                  <input type="time" value={shiftForm.endTime} onChange={(e) => setShiftForm({...shiftForm, endTime: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">休憩時間（分）</label>
                <input type="number" value={shiftForm.breakMinutes} onChange={(e) => setShiftForm({...shiftForm, breakMinutes: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
                <textarea value={shiftForm.notes} onChange={(e) => setShiftForm({...shiftForm, notes: e.target.value})} className="w-full px-3 py-2 border rounded-lg" rows="2" />
              </div>
              <div className="flex space-x-3">
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {editingShift ? '更新' : '追加'}
                </button>
                <button type="button" onClick={() => { setShowAddModal(false); setEditingShift(null); }} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">AIシフト生成</h2>
              <button onClick={() => setShowGenerateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">開始日</label>
                <input type="date" value={generateForm.startDate} onChange={(e) => setGenerateForm({...generateForm, startDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">終了日</label>
                <input type="date" value={generateForm.endDate} onChange={(e) => setGenerateForm({...generateForm, endDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-purple-800">
                  <Sparkles className="h-4 w-4 inline mr-1" />
                  AIが最適なシフトを自動生成します
                </p>
              </div>
              <div className="flex space-x-3">
                <button onClick={handleGenerateShifts} disabled={generateMutation.isPending} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
                  生成開始
                </button>
                <button onClick={() => setShowGenerateModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftManagement;
