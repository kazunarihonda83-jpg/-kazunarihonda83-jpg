import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns';
import { ja } from 'date-fns/locale';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle,
  XCircle,
  Clock,
  User,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import useAuthStore from '../store/useAuthStore';
import { shiftRequestAPI } from '../api/config';

const ShiftRequestApproval = () => {
  const user = useAuthStore(state => state.user);
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStaff, setSelectedStaff] = useState('all');
  
  const monthStr = format(currentMonth, 'yyyy-MM');
  const storeId = 'store-main';

  // Get all shift requests for the month
  const { data: shiftRequests = [], isLoading } = useQuery({
    queryKey: ['shiftRequests', monthStr, storeId],
    queryFn: async () => {
      const { data } = await shiftRequestAPI.getShiftRequests({
        month: monthStr,
        storeId
      });
      return data;
    },
    refetchInterval: 10000 // Auto-refresh every 10 seconds
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async (requestIds) => {
      return await shiftRequestAPI.approveShiftRequests({
        requestIds,
        approvedBy: user.id
      });
    },
    onSuccess: (data, requestIds) => {
      toast.success('シフト希望を承認しました。スタッフ画面にも反映されます。', {
        duration: 4000
      });
      // Invalidate all shift request queries to update all screens
      queryClient.invalidateQueries(['shiftRequests']);
      queryClient.invalidateQueries(['shiftRequestStatus']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'シフト希望の承認に失敗しました');
    }
  });

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Group requests by user
  const requestsByUser = useMemo(() => {
    const grouped = {};
    shiftRequests.forEach(req => {
      if (!grouped[req.user_id]) {
        grouped[req.user_id] = {
          userId: req.user_id,
          userName: req.user_name,
          email: req.user_email,
          requests: []
        };
      }
      grouped[req.user_id].requests.push(req);
    });
    return Object.values(grouped);
  }, [shiftRequests]);

  // Filter by selected staff
  const filteredRequests = useMemo(() => {
    if (selectedStaff === 'all') return requestsByUser;
    return requestsByUser.filter(r => r.userId === selectedStaff);
  }, [requestsByUser, selectedStaff]);

  // Get requests by date for calendar view
  const requestsByDate = useMemo(() => {
    const byDate = {};
    shiftRequests.forEach(req => {
      if (!byDate[req.request_date]) {
        byDate[req.request_date] = [];
      }
      byDate[req.request_date].push(req);
    });
    return byDate;
  }, [shiftRequests]);

  const handleApproveUser = (userId) => {
    const userRequests = shiftRequests.filter(r => 
      r.user_id === userId && r.status === 'submitted'
    );
    
    if (userRequests.length === 0) {
      toast.error('承認可能なシフト希望がありません');
      return;
    }

    const userName = userRequests[0].user_name;
    if (window.confirm(`${userName}さんのシフト希望を承認しますか？\n\n承認後、${userName}さんの画面にも自動的に反映されます。`)) {
      approveMutation.mutate(userRequests.map(r => r.id));
    }
  };

  const handlePreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">読み込み中...</div>;
  }

  // Calculate statistics
  const stats = {
    total: requestsByUser.length,
    submitted: requestsByUser.filter(u => 
      u.requests.some(r => r.status === 'submitted')
    ).length,
    approved: requestsByUser.filter(u => 
      u.requests.every(r => r.status === 'approved')
    ).length,
    pending: requestsByUser.filter(u => 
      u.requests.some(r => r.status === 'pending')
    ).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">シフト希望承認</h1>
        <p className="text-sm text-gray-600 mt-1">スタッフが提出したシフト希望を確認・承認できます</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">総スタッフ数</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <User className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">提出待ち</p>
              <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-amber-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">承認待ち</p>
              <p className="text-2xl font-bold text-blue-600">{stats.submitted}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">承認済み</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Month Navigation & Filter */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                {format(currentMonth, 'yyyy年 M月', { locale: ja })}
              </h2>
            </div>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              スタッフフィルター
            </label>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全スタッフ</option>
              {requestsByUser.map(r => (
                <option key={r.userId} value={r.userId}>{r.userName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Calendar View */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">カレンダービュー</h3>
          <div className="grid grid-cols-7 gap-1">
            {['日', '月', '火', '水', '木', '金', '土'].map(day => (
              <div key={day} className="text-center font-semibold text-gray-700 py-2 text-sm">
                {day}
              </div>
            ))}
            
            {calendarDays.map(day => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayRequests = requestsByDate[dateStr] || [];
              const availableCount = dayRequests.filter(r => r.availability === 'available').length;
              const unavailableCount = dayRequests.filter(r => r.availability === 'unavailable').length;
              
              return (
                <div
                  key={dateStr}
                  className="min-h-[80px] p-2 border rounded bg-white"
                >
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    {format(day, 'd')}
                  </div>
                  {dayRequests.length > 0 && (
                    <div className="space-y-1">
                      {availableCount > 0 && (
                        <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          出勤可: {availableCount}
                        </div>
                      )}
                      {unavailableCount > 0 && (
                        <div className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                          出勤不可: {unavailableCount}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Staff List View */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">スタッフ別一覧</h3>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              シフト希望が提出されていません
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map(staffData => {
                const hasSubmitted = staffData.requests.some(r => r.status === 'submitted');
                const isApproved = staffData.requests.every(r => r.status === 'approved');
                const unavailableDates = staffData.requests.filter(r => r.availability === 'unavailable');
                const specialRequests = staffData.requests.filter(r => 
                  r.availability === 'available' && (r.preferred_start_time || r.preferred_end_time || r.notes)
                );
                
                return (
                  <div key={staffData.userId} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {staffData.userName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{staffData.userName}</h4>
                          <p className="text-sm text-gray-600">{staffData.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {isApproved && (
                          <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            <CheckCircle className="h-4 w-4" />
                            承認済み
                          </span>
                        )}
                        {hasSubmitted && !isApproved && (
                          <>
                            <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                              <Clock className="h-4 w-4" />
                              提出済み
                            </span>
                            <button
                              onClick={() => handleApproveUser(staffData.userId)}
                              disabled={approveMutation.isPending}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                            >
                              承認する
                            </button>
                          </>
                        )}
                        {!hasSubmitted && !isApproved && (
                          <span className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                            <AlertCircle className="h-4 w-4" />
                            未提出
                          </span>
                        )}
                      </div>
                    </div>

                    {hasSubmitted && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {/* Unavailable Dates */}
                        {unavailableDates.length > 0 && (
                          <div className="bg-white rounded-lg p-3">
                            <h5 className="font-medium text-red-700 mb-2 flex items-center gap-2">
                              <XCircle className="h-4 w-4" />
                              出勤不可日（{unavailableDates.length}日）
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {unavailableDates.map(req => (
                                <span key={req.id} className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                                  {format(new Date(req.request_date), 'M/d')}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Special Requests */}
                        {specialRequests.length > 0 && (
                          <div className="bg-white rounded-lg p-3">
                            <h5 className="font-medium text-blue-700 mb-2 flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              時間指定あり（{specialRequests.length}日）
                            </h5>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {specialRequests.map(req => (
                                <div key={req.id} className="text-xs">
                                  <span className="font-medium">
                                    {format(new Date(req.request_date), 'M/d(E)', { locale: ja })}:
                                  </span>
                                  <span className="ml-2">
                                    {req.preferred_start_time && req.preferred_end_time
                                      ? `${req.preferred_start_time}-${req.preferred_end_time}`
                                      : req.preferred_start_time
                                      ? `${req.preferred_start_time}から`
                                      : req.preferred_end_time
                                      ? `${req.preferred_end_time}まで`
                                      : '何時でも可'}
                                  </span>
                                  {req.notes && (
                                    <span className="ml-2 text-gray-600">（{req.notes}）</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShiftRequestApproval;
