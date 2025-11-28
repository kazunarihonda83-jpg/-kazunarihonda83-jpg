import { useQuery } from '@tanstack/react-query';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { Calendar, Users, Clock } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { shiftAPI } from '../api/config';

const Dashboard = () => {
  const user = useAuthStore(state => state.user);
  const storeId = 'store-main';
  
  const today = new Date();
  const weekStart = format(startOfWeek(today), 'yyyy-MM-dd');
  const weekEnd = format(endOfWeek(today), 'yyyy-MM-dd');

  const { data: shifts = [], isLoading } = useQuery({
    queryKey: ['shifts', user?.id, weekStart, weekEnd],
    queryFn: async () => {
      const { data } = await shiftAPI.getShifts({
        userId: user?.id,
        startDate: weekStart,
        endDate: weekEnd
      });
      return data;
    }
  });

  const myShiftsCount = shifts.filter(s => s.user_id === user?.id).length;
  const todayShifts = shifts.filter(s => s.shift_date === format(today, 'yyyy-MM-dd'));
  const totalHours = shifts
    .filter(s => s.user_id === user?.id)
    .reduce((sum, shift) => {
      const start = shift.start_time.split(':');
      const end = shift.end_time.split(':');
      const hours = (parseInt(end[0]) - parseInt(start[0])) + (parseInt(end[1]) - parseInt(start[1])) / 60;
      return sum + Math.max(0, hours - (shift.break_minutes || 0) / 60);
    }, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ダッシュボード</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">今週のシフト</p>
              <p className="text-3xl font-bold text-blue-600">{myShiftsCount}</p>
            </div>
            <Calendar className="h-12 w-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">本日の出勤スタッフ</p>
              <p className="text-3xl font-bold text-green-600">{todayShifts.length}</p>
            </div>
            <Users className="h-12 w-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">今週の労働時間</p>
              <p className="text-3xl font-bold text-purple-600">{totalHours.toFixed(1)}h</p>
            </div>
            <Clock className="h-12 w-12 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">今週のシフト</h2>
        {isLoading ? (
          <p className="text-gray-500">読み込み中...</p>
        ) : shifts.filter(s => s.user_id === user?.id).length > 0 ? (
          <div className="space-y-3">
            {shifts.filter(s => s.user_id === user?.id).map(shift => (
              <div key={shift.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{shift.shift_date}</p>
                  <p className="text-sm text-gray-600">{shift.position_name}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{shift.start_time} - {shift.end_time}</p>
                  <p className="text-sm text-gray-600">
                    休憩 {shift.break_minutes}分
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">今週のシフトはありません</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
