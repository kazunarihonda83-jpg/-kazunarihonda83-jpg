import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, addMonths, subMonths, isSameMonth, isSameDay, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { shiftAPI } from '../api/config';

const ShiftCalendar = () => {
  const user = useAuthStore(state => state.user);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week, day

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

  const { data: shifts = [], isLoading, refetch } = useQuery({
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
                    className="text-xs p-1 rounded truncate"
                    style={{ backgroundColor: shift.position_color + '20', borderLeft: `3px solid ${shift.position_color}` }}
                  >
                    <div className="font-medium">{shift.user_name}</div>
                    <div className="text-gray-600">{shift.start_time}-{shift.end_time}</div>
                    <div className="text-gray-500">{shift.position_name}</div>
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
                      className="p-2 rounded text-xs"
                      style={{ backgroundColor: shift.position_color + '20', borderLeft: `3px solid ${shift.position_color}` }}
                    >
                      <div className="font-medium">{shift.user_name}</div>
                      <div className="text-gray-600">{shift.start_time}-{shift.end_time}</div>
                      <div className="text-gray-500">{shift.position_name}</div>
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
                        className="p-4 rounded-lg border"
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
    </div>
  );
};

export default ShiftCalendar;
