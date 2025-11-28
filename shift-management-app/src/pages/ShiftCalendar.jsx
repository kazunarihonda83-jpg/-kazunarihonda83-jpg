import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, addMonths, subMonths, isSameMonth, isSameDay, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Edit2, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import useAuthStore from '../store/useAuthStore';
import { shiftAPI, positionAPI } from '../api/config';

const ShiftCalendar = () => {
  const user = useAuthStore(state => state.user);
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const [editingShift, setEditingShift] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const isAdmin = user?.role === 'admin';

  // Calculate date range based on view mode
  const getDateRange = () => {
    if (viewMode === 'month') {
      const start = startOfWeek(startOfMonth(currentDate));
      const end = endOfWeek(endOfMonth(currentDate));
      return { startDate: format(start, 'yyyy-MM-dd'), endDate: format(end, 'yyyy-MM-dd') };
    } else if (viewMode === 'week') {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      return { startDate: format(start, 'yyyy-MM-dd'), endDate: format(end, 'yyyy-MM-dd') };
    } else {
      return { startDate: format(currentDate, 'yyyy-MM-dd'), endDate: format(currentDate, 'yyyy-MM-dd') };
    }
  };

  const { startDate, endDate } = getDateRange();

  const { data: shifts = [], isLoading } = useQuery({
    queryKey: ['shifts', startDate, endDate],
    queryFn: async () => {
      const { data } = await shiftAPI.getShifts({
        storeId: 'store-main',
        startDate,
        endDate
      });
      return data;
    }
  });

  const { data: positions = [] } = useQuery({
    queryKey: ['positions', 'store-main'],
    queryFn: async () => {
      const { data } = await positionAPI.getPositions({ storeId: 'store-main' });
      return data;
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (shiftId) => shiftAPI.deleteShift(shiftId),
    onSuccess: () => {
      toast.success('シフトを削除しました');
      queryClient.invalidateQueries(['shifts']);
    },
    onError: () => {
      toast.error('シフトの削除に失敗しました');
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => shiftAPI.updateShift(id, data),
    onSuccess: () => {
      toast.success('シフトを更新しました');
      queryClient.invalidateQueries(['shifts']);
      setShowEditModal(false);
      setEditingShift(null);
    },
    onError: () => {
      toast.error('シフトの更新に失敗しました');
    }
  });

  const handleEditClick = (shift, e) => {
    e.stopPropagation();
    setEditingShift(shift);
    setShowEditModal(true);
  };

  const handleDeleteClick = (shift, e) => {
    e.stopPropagation();
    if (window.confirm(`${shift.user_name}のシフト（${shift.shift_date} ${shift.start_time}-${shift.end_time}）を削除しますか？`)) {
      deleteMutation.mutate(shift.id);
    }
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    updateMutation.mutate({
      id: editingShift.id,
      data: {
        startTime: formData.get('startTime'),
        endTime: formData.get('endTime'),
        breakMinutes: parseInt(formData.get('breakMinutes')),
        positionId: formData.get('positionId'),
        notes: formData.get('notes')
      }
    });
  };

  const handlePrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(addDays(currentDate, -7));
    } else {
      setCurrentDate(addDays(currentDate, -1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(addDays(currentDate, 7));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDateCal = startOfWeek(monthStart);
    const endDateCal = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: startDateCal, end: endDateCal });

    return (
      <div className="grid grid-cols-7 gap-1">
        {['日', '月', '火', '水', '木', '金', '土'].map(day => (
          <div key={day} className="p-2 text-center font-semibold text-gray-700 bg-gray-100">
            {day}
          </div>
        ))}
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayShifts = shifts.filter(s => s.shift_date === dateStr);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={dateStr}
              className={`min-h-[120px] p-2 border ${
                isCurrentMonth ? 'bg-white' : 'bg-gray-50'
              } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {dayShifts.map(shift => (
                  <div
                    key={shift.id}
                    className="text-xs p-1 rounded truncate group relative"
                    style={{ backgroundColor: shift.position_color + '20', borderLeft: `3px solid ${shift.position_color}` }}
                  >
                    <div className="font-medium">{shift.user_name}</div>
                    <div className="text-gray-600">{shift.start_time}-{shift.end_time}</div>
                    <div className="text-gray-500">{shift.position_name}</div>
                    {isAdmin && (
                      <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 p-1 bg-white rounded shadow-sm">
                        <button
                          onClick={(e) => handleEditClick(shift, e)}
                          className="p-1 hover:bg-blue-100 rounded"
                          title="編集"
                        >
                          <Edit2 className="h-3 w-3 text-blue-600" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(shift, e)}
                          className="p-1 hover:bg-red-100 rounded"
                          title="削除"
                        >
                          <Trash2 className="h-3 w-3 text-red-600" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayShifts = shifts.filter(s => s.shift_date === dateStr);
          const isToday = isSameDay(day, new Date());

          return (
            <div key={dateStr} className={`p-4 border rounded-lg ${isToday ? 'ring-2 ring-blue-500' : ''}`}>
              <div className={`text-center mb-3 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                <div className="text-sm">{format(day, 'E')}</div>
                <div className="text-2xl font-bold">{format(day, 'd')}</div>
              </div>
              <div className="space-y-2">
                {dayShifts.length > 0 ? (
                  dayShifts.map(shift => (
                    <div
                      key={shift.id}
                      className="p-2 rounded text-xs group relative"
                      style={{ backgroundColor: shift.position_color + '20', borderLeft: `3px solid ${shift.position_color}` }}
                    >
                      <div className="font-medium">{shift.user_name}</div>
                      <div className="text-gray-600">{shift.start_time}-{shift.end_time}</div>
                      <div className="text-gray-500">{shift.position_name}</div>
                      {isAdmin && (
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button
                            onClick={(e) => handleEditClick(shift, e)}
                            className="p-1 hover:bg-blue-100 rounded bg-white shadow-sm"
                            title="編集"
                          >
                            <Edit2 className="h-3 w-3 text-blue-600" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteClick(shift, e)}
                            className="p-1 hover:bg-red-100 rounded bg-white shadow-sm"
                            title="削除"
                          >
                            <Trash2 className="h-3 w-3 text-red-600" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 text-xs py-4">シフトなし</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const dayShifts = shifts.filter(s => s.shift_date === dateStr);
    const isToday = isSameDay(currentDate, new Date());

    // Group by time
    const timeSlots = {};
    dayShifts.forEach(shift => {
      const key = `${shift.start_time}-${shift.end_time}`;
      if (!timeSlots[key]) timeSlots[key] = [];
      timeSlots[key].push(shift);
    });

    return (
      <div className="bg-white rounded-lg shadow">
        <div className={`p-6 border-b ${isToday ? 'bg-blue-50' : ''}`}>
          <div className="text-center">
            <div className="text-sm text-gray-600">{format(currentDate, 'yyyy年M月')}</div>
            <div className="text-4xl font-bold text-gray-900">{format(currentDate, 'd日 (E)')}</div>
          </div>
        </div>
        <div className="p-6">
          {Object.keys(timeSlots).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(timeSlots).map(([time, shiftsInSlot]) => (
                <div key={time} className="border-l-4 border-blue-500 pl-4">
                  <div className="text-lg font-semibold text-gray-800 mb-2">{time}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {shiftsInSlot.map(shift => (
                      <div
                        key={shift.id}
                        className="p-4 rounded-lg border group relative"
                        style={{ backgroundColor: shift.position_color + '10', borderColor: shift.position_color }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-medium text-gray-900">{shift.user_name}</div>
                          <div
                            className="px-2 py-1 rounded text-xs font-medium text-white"
                            style={{ backgroundColor: shift.position_color }}
                          >
                            {shift.position_name}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>休憩: {shift.break_minutes}分</div>
                          {shift.notes && <div className="mt-1 text-gray-500">{shift.notes}</div>}
                        </div>
                        {isAdmin && (
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <button
                              onClick={(e) => handleEditClick(shift, e)}
                              className="p-1.5 hover:bg-blue-100 rounded bg-white shadow-md"
                              title="編集"
                            >
                              <Edit2 className="h-4 w-4 text-blue-600" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteClick(shift, e)}
                              className="p-1.5 hover:bg-red-100 rounded bg-white shadow-md"
                              title="削除"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="text-gray-500">この日のシフトはありません</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">シフトカレンダー</h1>
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevious}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleToday}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              今日
            </button>
            <button
              onClick={handleNext}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="text-lg font-semibold text-gray-900 ml-4">
              {viewMode === 'month' && format(currentDate, 'yyyy年 M月')}
              {viewMode === 'week' && `${format(startOfWeek(currentDate), 'M月d日')} - ${format(endOfWeek(currentDate), 'M月d日')}`}
              {viewMode === 'day' && format(currentDate, 'yyyy年 M月d日 (E)')}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                viewMode === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              月
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                viewMode === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              週
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                viewMode === 'day'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              日
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500">読み込み中...</div>
        </div>
      ) : (
        <div>
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'day' && renderDayView()}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingShift && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">シフト編集</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  スタッフ
                </label>
                <input
                  type="text"
                  value={editingShift.user_name}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  日付
                </label>
                <input
                  type="text"
                  value={editingShift.shift_date}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    開始時間
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    defaultValue={editingShift.start_time}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    終了時間
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    defaultValue={editingShift.end_time}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  休憩時間（分）
                </label>
                <input
                  type="number"
                  name="breakMinutes"
                  defaultValue={editingShift.break_minutes}
                  min="0"
                  step="15"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ポジション
                </label>
                <select
                  name="positionId"
                  defaultValue={editingShift.position_id}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {positions.map(pos => (
                    <option key={pos.id} value={pos.id}>{pos.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メモ
                </label>
                <textarea
                  name="notes"
                  defaultValue={editingShift.notes}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {updateMutation.isPending ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftCalendar;
