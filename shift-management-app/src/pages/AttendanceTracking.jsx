import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Calendar, Clock, MapPin, QrCode, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import useAuthStore from '../store/useAuthStore';
import { attendanceAPI } from '../api/config';

const AttendanceTracking = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showClockInModal, setShowClockInModal] = useState(false);
  const [clockInMethod, setClockInMethod] = useState('manual');
  const [location, setLocation] = useState(null);

  // Get current location for GPS clock-in
  useEffect(() => {
    if (clockInMethod === 'gps' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          toast.error('位置情報の取得に失敗しました');
        }
      );
    }
  }, [clockInMethod]);

  // Fetch attendance records for current month
  const { data: attendanceRecords, isLoading } = useQuery({
    queryKey: ['attendance', format(currentDate, 'yyyy-MM')],
    queryFn: async () => {
      const start = format(startOfMonth(currentDate), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentDate), 'yyyy-MM-dd');
      const response = await attendanceAPI.getHistory(start, end);
      return response.data;
    },
  });

  // Fetch today's attendance
  const { data: todayAttendance } = useQuery({
    queryKey: ['todayAttendance'],
    queryFn: async () => {
      const response = await attendanceAPI.getToday();
      return response.data;
    },
  });

  // Fetch all attendance records (for admin/manager)
  const { data: allAttendance } = useQuery({
    queryKey: ['allAttendance'],
    queryFn: async () => {
      const response = await attendanceAPI.getAll();
      return response.data;
    },
    enabled: user?.role === 'admin' || user?.role === 'manager',
  });

  // Clock-in mutation
  const clockInMutation = useMutation({
    mutationFn: async (data) => {
      const response = await attendanceAPI.clockIn(data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('出勤打刻が完了しました');
      queryClient.invalidateQueries(['attendance']);
      queryClient.invalidateQueries(['todayAttendance']);
      queryClient.invalidateQueries(['allAttendance']);
      setShowClockInModal(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || '出勤打刻に失敗しました');
    },
  });

  // Clock-out mutation
  const clockOutMutation = useMutation({
    mutationFn: async (attendanceId) => {
      const response = await attendanceAPI.clockOut(attendanceId);
      return response.data;
    },
    onSuccess: () => {
      toast.success('退勤打刻が完了しました');
      queryClient.invalidateQueries(['attendance']);
      queryClient.invalidateQueries(['todayAttendance']);
      queryClient.invalidateQueries(['allAttendance']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || '退勤打刻に失敗しました');
    },
  });

  const handleClockIn = () => {
    const data = {
      method: clockInMethod,
    };

    if (clockInMethod === 'gps' && location) {
      data.latitude = location.latitude;
      data.longitude = location.longitude;
    } else if (clockInMethod === 'qr') {
      // QR code would be scanned and verified here
      data.qrCode = 'STORE_QR_CODE'; // This would come from QR scanner
    }

    clockInMutation.mutate(data);
  };

  const handleClockOut = (attendanceId) => {
    if (window.confirm('退勤打刻を行いますか？')) {
      clockOutMutation.mutate(attendanceId);
    }
  };

  // Calculate total hours for the month
  const calculateTotalHours = (records) => {
    if (!records) return 0;
    return records.reduce((total, record) => {
      if (record.clock_out_time) {
        const clockIn = new Date(record.clock_in_time);
        const clockOut = new Date(record.clock_out_time);
        const hours = (clockOut - clockIn) / (1000 * 60 * 60);
        return total + hours;
      }
      return total;
    }, 0);
  };

  // Filter records based on status and search
  const filteredRecords = attendanceRecords?.filter((record) => {
    const statusMatch =
      filterStatus === 'all' ||
      (filterStatus === 'present' && record.clock_out_time) ||
      (filterStatus === 'working' && !record.clock_out_time);

    const searchMatch =
      searchQuery === '' ||
      record.user_name?.toLowerCase().includes(searchQuery.toLowerCase());

    return statusMatch && searchMatch;
  });

  // Check if user is currently clocked in
  const isCurrentlyClockedIn = todayAttendance?.some(
    (record) => record.user_id === user?.id && !record.clock_out_time
  );

  const currentAttendanceId = todayAttendance?.find(
    (record) => record.user_id === user?.id && !record.clock_out_time
  )?.id;

  const totalHours = calculateTotalHours(attendanceRecords);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">勤怠管理</h1>
        <p className="text-gray-600">出退勤の打刻と勤怠記録の管理</p>
      </div>

      {/* Clock In/Out Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">打刻</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-4xl font-bold text-gray-800">
              {format(new Date(), 'HH:mm:ss', { locale: ja })}
            </div>
            <div className="text-gray-600">
              {format(new Date(), 'yyyy年MM月dd日 (E)', { locale: ja })}
            </div>
          </div>
          <div className="flex space-x-3">
            {!isCurrentlyClockedIn ? (
              <button
                onClick={() => setShowClockInModal(true)}
                className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-5 h-5" />
                <span>出勤打刻</span>
              </button>
            ) : (
              <button
                onClick={() => handleClockOut(currentAttendanceId)}
                className="flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                disabled={clockOutMutation.isPending}
              >
                <XCircle className="w-5 h-5" />
                <span>退勤打刻</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">今月の総労働時間</p>
              <p className="text-3xl font-bold text-gray-900">
                {totalHours.toFixed(1)}
                <span className="text-lg text-gray-600 ml-1">時間</span>
              </p>
            </div>
            <Clock className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">今月の出勤日数</p>
              <p className="text-3xl font-bold text-gray-900">
                {attendanceRecords?.filter((r) => r.clock_out_time).length || 0}
                <span className="text-lg text-gray-600 ml-1">日</span>
              </p>
            </div>
            <Calendar className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">現在の出勤者</p>
              <p className="text-3xl font-bold text-gray-900">
                {todayAttendance?.filter((r) => !r.clock_out_time).length || 0}
                <span className="text-lg text-gray-600 ml-1">人</span>
              </p>
            </div>
            <CheckCircle className="w-12 h-12 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Month Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() =>
                setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
              }
              className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
            >
              ←
            </button>
            <span className="font-semibold">
              {format(currentDate, 'yyyy年MM月', { locale: ja })}
            </span>
            <button
              onClick={() =>
                setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
              }
              className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
            >
              →
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">すべて</option>
            <option value="present">出勤済み</option>
            <option value="working">勤務中</option>
          </select>

          {/* Search */}
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="スタッフ名で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  日付
                </th>
                {(user?.role === 'admin' || user?.role === 'manager') && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    スタッフ名
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  出勤時刻
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  退勤時刻
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  労働時間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  打刻方法
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状態
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    読み込み中...
                  </td>
                </tr>
              ) : filteredRecords?.length > 0 ? (
                filteredRecords.map((record) => {
                  const clockIn = new Date(record.clock_in_time);
                  const clockOut = record.clock_out_time ? new Date(record.clock_out_time) : null;
                  const hours = clockOut
                    ? ((clockOut - clockIn) / (1000 * 60 * 60)).toFixed(1)
                    : '-';

                  return (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {format(clockIn, 'yyyy/MM/dd (E)', { locale: ja })}
                      </td>
                      {(user?.role === 'admin' || user?.role === 'manager') && (
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          {record.user_name}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {format(clockIn, 'HH:mm')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {clockOut ? format(clockOut, 'HH:mm') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{hours}時間</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="flex items-center space-x-1">
                          {record.clock_in_method === 'manual' && (
                            <>
                              <Clock className="w-4 h-4" />
                              <span>手動</span>
                            </>
                          )}
                          {record.clock_in_method === 'qr' && (
                            <>
                              <QrCode className="w-4 h-4" />
                              <span>QR</span>
                            </>
                          )}
                          {record.clock_in_method === 'gps' && (
                            <>
                              <MapPin className="w-4 h-4" />
                              <span>GPS</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {clockOut ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            完了
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            勤務中
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    勤怠記録がありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clock-in Modal */}
      {showClockInModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">出勤打刻</h3>

            <div className="space-y-4">
              {/* Clock-in Method Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  打刻方法
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="manual"
                      checked={clockInMethod === 'manual'}
                      onChange={(e) => setClockInMethod(e.target.value)}
                      className="form-radio text-blue-600"
                    />
                    <Clock className="w-5 h-5 text-gray-600" />
                    <span>手動打刻</span>
                  </label>

                  <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="qr"
                      checked={clockInMethod === 'qr'}
                      onChange={(e) => setClockInMethod(e.target.value)}
                      className="form-radio text-blue-600"
                    />
                    <QrCode className="w-5 h-5 text-gray-600" />
                    <span>QRコード打刻</span>
                  </label>

                  <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="gps"
                      checked={clockInMethod === 'gps'}
                      onChange={(e) => setClockInMethod(e.target.value)}
                      className="form-radio text-blue-600"
                    />
                    <MapPin className="w-5 h-5 text-gray-600" />
                    <span>GPS打刻</span>
                  </label>
                </div>
              </div>

              {/* GPS Location Info */}
              {clockInMethod === 'gps' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  {location ? (
                    <p className="text-sm text-blue-800">
                      位置情報を取得しました
                      <br />
                      緯度: {location.latitude.toFixed(6)}
                      <br />
                      経度: {location.longitude.toFixed(6)}
                    </p>
                  ) : (
                    <p className="text-sm text-blue-800">位置情報を取得中...</p>
                  )}
                </div>
              )}

              {/* QR Code Info */}
              {clockInMethod === 'qr' && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    店舗のQRコードをスキャンしてください
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowClockInModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                キャンセル
              </button>
              <button
                onClick={handleClockIn}
                disabled={
                  clockInMutation.isPending ||
                  (clockInMethod === 'gps' && !location)
                }
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {clockInMutation.isPending ? '打刻中...' : '出勤打刻'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTracking;
