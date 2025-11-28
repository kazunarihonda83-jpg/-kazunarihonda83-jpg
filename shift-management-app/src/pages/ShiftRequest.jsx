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
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import useAuthStore from '../store/useAuthStore';
import { shiftRequestAPI } from '../api/config';

const ShiftRequest = () => {
  const user = useAuthStore(state => state.user);
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [unavailableDates, setUnavailableDates] = useState(new Set());
  const [dateDetails, setDateDetails] = useState({});
  
  const monthStr = format(currentMonth, 'yyyy-MM');
  const storeId = 'store-main';

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

  // Initialize from existing requests
  useState(() => {
    if (existingRequests.length > 0) {
      const unavailable = new Set();
      const details = {};
      
      existingRequests.forEach(req => {
        if (req.availability === 'unavailable') {
          unavailable.add(req.request_date);
        }
        if (req.preferred_start_time || req.preferred_end_time || req.notes) {
          details[req.request_date] = {
            preferredStartTime: req.preferred_start_time || '',
            preferredEndTime: req.preferred_end_time || '',
            notes: req.notes || ''
          };
        }
      });
      
      setUnavailableDates(unavailable);
      setDateDetails(details);
    }
  });

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      // 全日を基本出勤として、不可日のみ送信
      const allDates = calendarDays.map(day => format(day, 'yyyy-MM-dd'));
      const requestsArray = allDates.map(dateStr => {
        const isUnavailable = unavailableDates.has(dateStr);
        const details = dateDetails[dateStr] || {};
        
        return {
          requestDate: dateStr,
          preferredStartTime: details.preferredStartTime || null,
          preferredEndTime: details.preferredEndTime || null,
          availability: isUnavailable ? 'unavailable' : 'available',
          notes: details.notes || null
        };
      });

      // Bulk create
      await shiftRequestAPI.createBulkShiftRequests({
        userId: user.id,
        storeId,
        requestMonth: monthStr,
        requests: requestsArray
      });

      // Then submit
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
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'シフト希望の提出に失敗しました');
    }
  });

  const handleDayClick = (day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    
    if (submissionStatus?.is_submitted) {
      toast.error('提出済みのシフト希望は編集できません');
      return;
    }

    // Toggle unavailable status
    setUnavailableDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dateStr)) {
        newSet.delete(dateStr);
      } else {
        newSet.add(dateStr);
      }
      return newSet;
    });
  };

  const handleTimeChange = (dateStr, field, value) => {
    setDateDetails(prev => ({
      ...prev,
      [dateStr]: {
        ...(prev[dateStr] || {}),
        [field]: value
      }
    }));
  };

  const handleSubmit = () => {
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
          <p className="text-sm text-gray-600 mt-1">出勤できない日を選択してください</p>
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
          <li>• <strong>基本は全日出勤可能</strong>です</li>
          <li>• 出勤できない日をクリックして赤色にしてください</li>
          <li>• 時間帯の希望がある場合は、カレンダー下部で指定できます</li>
          <li>• 時間を指定しない場合は「何時でも可能」として扱われます</li>
          <li>• 「提出」ボタンで確定提出（提出後は編集できません）</li>
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

        {/* Legend */}
        <div className="flex gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-100 border border-green-500 rounded"></div>
            <span>出勤可能（デフォルト）</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-100 border border-red-500 rounded"></div>
            <span>出勤不可</span>
          </div>
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
            const isUnavailable = unavailableDates.has(dateStr);
            const hasDetails = dateDetails[dateStr];
            
            return (
              <div key={dateStr} className="aspect-square">
                <button
                  onClick={() => handleDayClick(day)}
                  disabled={isSubmitted}
                  className={`
                    w-full h-full p-2 border rounded-lg transition-all relative
                    ${isUnavailable ? 'bg-red-100 border-red-500 text-red-900' : 'bg-green-100 border-green-500 text-green-900'}
                    ${isSubmitted ? 'cursor-not-allowed opacity-60' : 'hover:shadow-md'}
                  `}
                >
                  <div className="text-lg font-semibold">{format(day, 'd')}</div>
                  {isUnavailable && <div className="text-xs mt-1">×</div>}
                  {!isUnavailable && <div className="text-xs mt-1">○</div>}
                  {hasDetails && !isUnavailable && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Time Details for Available Dates */}
        {calendarDays.filter(day => !unavailableDates.has(format(day, 'yyyy-MM-dd'))).length > 0 && !isSubmitted && (
          <div className="mt-6 border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">出勤可能日の詳細（任意）</h3>
            <p className="text-sm text-gray-600 mb-4">時間帯の希望がある場合のみ入力してください。未入力の場合は「何時でも可能」として扱われます。</p>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {calendarDays
                .filter(day => !unavailableDates.has(format(day, 'yyyy-MM-dd')))
                .map(day => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const details = dateDetails[dateStr] || {};
                  
                  return (
                    <div key={dateStr} className="bg-gray-50 rounded-lg p-4">
                      <div className="font-medium text-gray-900 mb-3">
                        {format(day, 'M月d日(E)', { locale: ja })}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            希望開始時間
                          </label>
                          <input
                            type="time"
                            value={details.preferredStartTime || ''}
                            onChange={(e) => handleTimeChange(dateStr, 'preferredStartTime', e.target.value)}
                            placeholder="指定なし"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            希望終了時間
                          </label>
                          <input
                            type="time"
                            value={details.preferredEndTime || ''}
                            onChange={(e) => handleTimeChange(dateStr, 'preferredEndTime', e.target.value)}
                            placeholder="指定なし"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            メモ
                          </label>
                          <input
                            type="text"
                            value={details.notes || ''}
                            onChange={(e) => handleTimeChange(dateStr, 'notes', e.target.value)}
                            placeholder="例：午前のみ可能"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Action Button */}
        {!isSubmitted && (
          <div className="mt-6">
            <button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
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
