import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns';
import { ja } from 'date-fns/locale';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  CheckCircle, 
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import useAuthStore from '../store/useAuthStore';
import { shiftRequestAPI, positionAPI } from '../api/config';

const ShiftRequest = () => {
  const user = useAuthStore(state => state.user);
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedRequests, setSelectedRequests] = useState({});
  
  const monthStr = format(currentMonth, 'yyyy-MM');
  const storeId = 'store-main';

  // Get positions
  const { data: positions = [] } = useQuery({
    queryKey: ['positions', storeId],
    queryFn: async () => {
      const { data } = await positionAPI.getPositions({ storeId });
      return data;
    }
  });

  // Get existing shift requests
  const { data: existingRequests = [], isLoading } = useQuery({
    queryKey: ['shiftRequests', user?.id, monthStr],
    queryFn: async () => {
      const { data } = await shiftRequestAPI.getShiftRequests({
        userId: user.id,
        month: monthStr,
        storeId
      });
      return data;
    },
    enabled: !!user?.id
  });

  // Get submission status
  const { data: submissionStatus } = useQuery({
    queryKey: ['shiftRequestStatus', user?.id, monthStr],
    queryFn: async () => {
      const { data } = await shiftRequestAPI.getSubmissionStatus({
        userId: user.id,
        month: monthStr,
        storeId
      });
      return data;
    },
    enabled: !!user?.id
  });

  // Initialize selectedRequests from existing requests
  useState(() => {
    if (existingRequests.length > 0) {
      const requests = {};
      existingRequests.forEach(req => {
        requests[req.request_date] = {
          availability: req.availability,
          preferredStartTime: req.preferred_start_time || '',
          preferredEndTime: req.preferred_end_time || '',
          preferredPositionId: req.preferred_position_id || '',
          priority: req.priority || 1,
          notes: req.notes || ''
        };
      });
      setSelectedRequests(requests);
    }
  });

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const requestsArray = Object.entries(selectedRequests)
        .filter(([_, data]) => data.availability !== 'none')
        .map(([date, data]) => ({
          requestDate: date,
          ...data
        }));

      if (requestsArray.length === 0) {
        throw new Error('少なくとも1日以上選択してください');
      }

      return await shiftRequestAPI.createBulkShiftRequests({
        userId: user.id,
        storeId,
        requestMonth: monthStr,
        requests: requestsArray
      });
    },
    onSuccess: () => {
      toast.success('シフト希望を保存しました');
      queryClient.invalidateQueries(['shiftRequests']);
      queryClient.invalidateQueries(['shiftRequestStatus']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'シフト希望の保存に失敗しました');
    }
  });

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      return await shiftRequestAPI.submitShiftRequests({
        userId: user.id,
        month: monthStr,
        storeId
      });
    },
    onSuccess: () => {
      toast.success('シフト希望を提出しました');
      queryClient.invalidateQueries(['shiftRequests']);
      queryClient.invalidateQueries(['shiftRequestStatus']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'シフト希望の提出に失敗しました');
    }
  });

  const handleDayClick = (day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const current = selectedRequests[dateStr];
    
    if (submissionStatus?.is_submitted) {
      toast.error('提出済みのシフト希望は編集できません');
      return;
    }

    if (!current) {
      setSelectedRequests(prev => ({
        ...prev,
        [dateStr]: {
          availability: 'available',
          preferredStartTime: '',
          preferredEndTime: '',
          preferredPositionId: positions[0]?.id || '',
          priority: 1,
          notes: ''
        }
      }));
    } else {
      // Toggle availability
      const newAvailability = current.availability === 'available' ? 'unavailable' : 'available';
      setSelectedRequests(prev => ({
        ...prev,
        [dateStr]: {
          ...current,
          availability: newAvailability
        }
      }));
    }
  };

  const handleTimeChange = (dateStr, field, value) => {
    setSelectedRequests(prev => ({
      ...prev,
      [dateStr]: {
        ...prev[dateStr],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    saveMutation.mutate();
  };

  const handleSubmit = () => {
    if (Object.keys(selectedRequests).length === 0) {
      toast.error('シフト希望を入力してください');
      return;
    }
    
    if (window.confirm('シフト希望を提出しますか？提出後は編集できません。')) {
      submitMutation.mutate();
    }
  };

  const handlePreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">読み込み中...</div>;
  }

  const isSubmitted = submissionStatus?.is_submitted || false;
  const isApproved = submissionStatus?.approved_count > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">シフト希望提出</h1>
          <p className="text-sm text-gray-600 mt-1">勤務希望日と時間帯を選択してください</p>
        </div>
        
        {/* Status Badge */}
        <div>
          {isApproved && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">承認済み</span>
            </div>
          )}
          {isSubmitted && !isApproved && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">提出済み（承認待ち）</span>
            </div>
          )}
          {!isSubmitted && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">未提出</span>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">使い方</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 日付をクリックして「勤務可能」または「勤務不可」を選択</li>
          <li>• 勤務可能な日は希望時間帯とポジションを選択できます</li>
          <li>• 「保存」ボタンで途中保存、「提出」ボタンで確定提出</li>
          <li>• 提出後は編集できませんのでご注意ください</li>
        </ul>
      </div>

      {/* Month Navigation */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            disabled={isSubmitted}
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
            disabled={isSubmitted}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {['日', '月', '火', '水', '木', '金', '土'].map(day => (
            <div key={day} className="text-center font-semibold text-gray-700 py-2">
              {day}
            </div>
          ))}
          
          {calendarDays.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const request = selectedRequests[dateStr];
            const isAvailable = request?.availability === 'available';
            const isUnavailable = request?.availability === 'unavailable';
            
            return (
              <div key={dateStr} className="aspect-square">
                <button
                  onClick={() => handleDayClick(day)}
                  disabled={isSubmitted}
                  className={`
                    w-full h-full p-2 border rounded-lg transition-all
                    ${isAvailable ? 'bg-green-100 border-green-500 text-green-900' : ''}
                    ${isUnavailable ? 'bg-red-100 border-red-500 text-red-900' : ''}
                    ${!request ? 'bg-white border-gray-300 hover:bg-gray-50' : ''}
                    ${isSubmitted ? 'cursor-not-allowed opacity-60' : 'hover:shadow-md'}
                  `}
                >
                  <div className="text-lg font-semibold">{format(day, 'd')}</div>
                  {isAvailable && <div className="text-xs mt-1">○</div>}
                  {isUnavailable && <div className="text-xs mt-1">×</div>}
                </button>
              </div>
            );
          })}
        </div>

        {/* Selected Dates Details */}
        {Object.keys(selectedRequests).filter(date => 
          selectedRequests[date].availability === 'available'
        ).length > 0 && (
          <div className="mt-6 border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">勤務希望詳細</h3>
            <div className="space-y-4">
              {Object.entries(selectedRequests)
                .filter(([_, data]) => data.availability === 'available')
                .map(([dateStr, data]) => (
                  <div key={dateStr} className="bg-gray-50 rounded-lg p-4">
                    <div className="font-medium text-gray-900 mb-3">
                      {format(new Date(dateStr), 'M月d日(E)', { locale: ja })}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          希望開始時間
                        </label>
                        <input
                          type="time"
                          value={data.preferredStartTime}
                          onChange={(e) => handleTimeChange(dateStr, 'preferredStartTime', e.target.value)}
                          disabled={isSubmitted}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          希望終了時間
                        </label>
                        <input
                          type="time"
                          value={data.preferredEndTime}
                          onChange={(e) => handleTimeChange(dateStr, 'preferredEndTime', e.target.value)}
                          disabled={isSubmitted}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          希望ポジション
                        </label>
                        <select
                          value={data.preferredPositionId}
                          onChange={(e) => handleTimeChange(dateStr, 'preferredPositionId', e.target.value)}
                          disabled={isSubmitted}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        >
                          <option value="">指定なし</option>
                          {positions.map(pos => (
                            <option key={pos.id} value={pos.id}>{pos.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          メモ
                        </label>
                        <input
                          type="text"
                          value={data.notes}
                          onChange={(e) => handleTimeChange(dateStr, 'notes', e.target.value)}
                          disabled={isSubmitted}
                          placeholder="例：午前のみ可能"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!isSubmitted && (
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium disabled:opacity-50"
            >
              {saveMutation.isPending ? '保存中...' : '保存（途中保存）'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitMutation.isPending || Object.keys(selectedRequests).length === 0}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
              {submitMutation.isPending ? '提出中...' : 'シフト希望を提出'}
            </button>
          </div>
        )}

        {isSubmitted && (
          <div className="mt-6 text-center p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-green-800 font-medium">シフト希望は提出済みです</p>
            <p className="text-sm text-green-700 mt-1">管理者の承認をお待ちください</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftRequest;
