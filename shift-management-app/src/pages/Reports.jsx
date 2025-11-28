import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  TrendingUp,
  Users,
  Clock,
  DollarSign,
  Download,
  Calendar,
  BarChart3,
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { attendanceAPI, shiftAPI } from '../api/config';

const Reports = () => {
  const { user } = useAuthStore();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [reportType, setReportType] = useState('monthly');

  // Fetch attendance statistics
  const { data: attendanceStats, isLoading: statsLoading } = useQuery({
    queryKey: ['attendanceStats', format(selectedMonth, 'yyyy-MM')],
    queryFn: async () => {
      const response = await attendanceAPI.getStats();
      return response.data;
    },
  });

  // Fetch attendance records for the month
  const { data: attendanceRecords } = useQuery({
    queryKey: ['attendanceRecords', format(selectedMonth, 'yyyy-MM')],
    queryFn: async () => {
      const start = format(startOfMonth(selectedMonth), 'yyyy-MM-dd');
      const end = format(endOfMonth(selectedMonth), 'yyyy-MM-dd');
      const response = await attendanceAPI.getHistory(start, end);
      return response.data;
    },
  });

  // Fetch shifts for the month
  const { data: shifts } = useQuery({
    queryKey: ['shifts', format(selectedMonth, 'yyyy-MM')],
    queryFn: async () => {
      const start = format(startOfMonth(selectedMonth), 'yyyy-MM-dd');
      const end = format(endOfMonth(selectedMonth), 'yyyy-MM-dd');
      const response = await shiftAPI.getShifts(start, end);
      return response.data;
    },
  });

  // Calculate labor cost
  const calculateLaborCost = () => {
    if (!attendanceRecords) return { totalHours: 0, totalCost: 0, avgCostPerDay: 0 };

    const userHours = {};
    const userWages = {};

    attendanceRecords.forEach((record) => {
      if (record.clock_out_time) {
        const clockIn = new Date(record.clock_in_time);
        const clockOut = new Date(record.clock_out_time);
        const hours = (clockOut - clockIn) / (1000 * 60 * 60);

        if (!userHours[record.user_id]) {
          userHours[record.user_id] = 0;
          userWages[record.user_id] = record.hourly_wage || 1000; // Default wage
        }
        userHours[record.user_id] += hours;
      }
    });

    let totalHours = 0;
    let totalCost = 0;

    Object.keys(userHours).forEach((userId) => {
      const hours = userHours[userId];
      const wage = userWages[userId];
      totalHours += hours;
      totalCost += hours * wage;
    });

    const daysInMonth = eachDayOfInterval({
      start: startOfMonth(selectedMonth),
      end: endOfMonth(selectedMonth),
    }).length;

    return {
      totalHours: totalHours.toFixed(1),
      totalCost: Math.round(totalCost),
      avgCostPerDay: Math.round(totalCost / daysInMonth),
    };
  };

  // Calculate staff statistics
  const calculateStaffStats = () => {
    if (!attendanceRecords) return [];

    const staffStats = {};

    attendanceRecords.forEach((record) => {
      if (!staffStats[record.user_id]) {
        staffStats[record.user_id] = {
          userId: record.user_id,
          userName: record.user_name,
          totalHours: 0,
          totalDays: 0,
          totalCost: 0,
          hourlyWage: record.hourly_wage || 1000,
        };
      }

      if (record.clock_out_time) {
        const clockIn = new Date(record.clock_in_time);
        const clockOut = new Date(record.clock_out_time);
        const hours = (clockOut - clockIn) / (1000 * 60 * 60);

        staffStats[record.user_id].totalHours += hours;
        staffStats[record.user_id].totalDays += 1;
        staffStats[record.user_id].totalCost += hours * staffStats[record.user_id].hourlyWage;
      }
    });

    return Object.values(staffStats)
      .sort((a, b) => b.totalHours - a.totalHours)
      .map((stat) => ({
        ...stat,
        totalHours: stat.totalHours.toFixed(1),
        totalCost: Math.round(stat.totalCost),
      }));
  };

  // Calculate shift statistics
  const calculateShiftStats = () => {
    if (!shifts) return { totalShifts: 0, publishedShifts: 0, unpublishedShifts: 0 };

    const totalShifts = shifts.length;
    const publishedShifts = shifts.filter((s) => s.is_published).length;
    const unpublishedShifts = totalShifts - publishedShifts;

    return { totalShifts, publishedShifts, unpublishedShifts };
  };

  const laborCost = calculateLaborCost();
  const staffStats = calculateStaffStats();
  const shiftStats = calculateShiftStats();

  const handleExportCSV = () => {
    if (!staffStats || staffStats.length === 0) {
      alert('エクスポートするデータがありません');
      return;
    }

    const headers = ['スタッフ名', '出勤日数', '総労働時間', '時給', '人件費'];
    const rows = staffStats.map((staff) => [
      staff.userName,
      staff.totalDays,
      staff.totalHours,
      `¥${staff.hourlyWage.toLocaleString()}`,
      `¥${staff.totalCost.toLocaleString()}`,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
      '',
      `合計,,${laborCost.totalHours},¥${laborCost.totalCost.toLocaleString()}`,
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `勤怠レポート_${format(selectedMonth, 'yyyy年MM月', { locale: ja })}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">レポート</h1>
        <p className="text-gray-600">勤怠統計と人件費分析</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Month Selection */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() =>
                setSelectedMonth(
                  new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1)
                )
              }
              className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
            >
              ←
            </button>
            <span className="font-semibold min-w-[120px] text-center">
              {format(selectedMonth, 'yyyy年MM月', { locale: ja })}
            </span>
            <button
              onClick={() =>
                setSelectedMonth(
                  new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1)
                )
              }
              className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
            >
              →
            </button>
          </div>

          {/* Report Type */}
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="monthly">月次レポート</option>
            <option value="staff">スタッフ別</option>
            <option value="cost">人件費分析</option>
          </select>

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            className="ml-auto flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>CSVエクスポート</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">総労働時間</p>
              <p className="text-3xl font-bold text-gray-900">
                {laborCost.totalHours}
                <span className="text-lg text-gray-600 ml-1">時間</span>
              </p>
            </div>
            <Clock className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">総人件費</p>
              <p className="text-3xl font-bold text-gray-900">
                ¥{laborCost.totalCost.toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">一日平均人件費</p>
              <p className="text-3xl font-bold text-gray-900">
                ¥{laborCost.avgCostPerDay.toLocaleString()}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">総シフト数</p>
              <p className="text-3xl font-bold text-gray-900">
                {shiftStats.totalShifts}
                <span className="text-lg text-gray-600 ml-1">件</span>
              </p>
            </div>
            <Calendar className="w-12 h-12 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Monthly Report */}
      {reportType === 'monthly' && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <span>月次サマリー</span>
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 mb-1">対象期間</p>
                <p className="font-semibold">
                  {format(startOfMonth(selectedMonth), 'yyyy/MM/dd', { locale: ja })} ~{' '}
                  {format(endOfMonth(selectedMonth), 'yyyy/MM/dd', { locale: ja })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">総スタッフ数</p>
                <p className="font-semibold">{staffStats.length}人</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600 mb-1">公開済みシフト</p>
                <p className="text-2xl font-bold text-green-600">{shiftStats.publishedShifts}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600 mb-1">未公開シフト</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {shiftStats.unpublishedShifts}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600 mb-1">総出勤記録</p>
                <p className="text-2xl font-bold text-blue-600">
                  {attendanceRecords?.filter((r) => r.clock_out_time).length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Staff Statistics Table */}
      {(reportType === 'monthly' || reportType === 'staff') && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold flex items-center space-x-2">
              <Users className="w-6 h-6 text-blue-600" />
              <span>スタッフ別統計</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    スタッフ名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    出勤日数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    総労働時間
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    時給
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    人件費
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    比率
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {staffStats.length > 0 ? (
                  staffStats.map((staff, index) => {
                    const costRatio = ((staff.totalCost / laborCost.totalCost) * 100).toFixed(1);
                    return (
                      <tr key={staff.userId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          {staff.userName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{staff.totalDays}日</td>
                        <td className="px-6 py-4 whitespace-nowrap">{staff.totalHours}時間</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          ¥{staff.hourlyWage.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold">
                          ¥{staff.totalCost.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${costRatio}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">{costRatio}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      データがありません
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-gray-50 font-semibold">
                <tr>
                  <td className="px-6 py-4">合計</td>
                  <td className="px-6 py-4">
                    {staffStats.reduce((sum, s) => sum + s.totalDays, 0)}日
                  </td>
                  <td className="px-6 py-4">{laborCost.totalHours}時間</td>
                  <td className="px-6 py-4">-</td>
                  <td className="px-6 py-4">¥{laborCost.totalCost.toLocaleString()}</td>
                  <td className="px-6 py-4">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Labor Cost Analysis */}
      {reportType === 'cost' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <DollarSign className="w-6 h-6 text-green-600" />
            <span>人件費分析</span>
          </h2>

          <div className="space-y-6">
            {/* Cost Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                <p className="text-sm text-gray-600 mb-1">月間総人件費</p>
                <p className="text-2xl font-bold text-blue-900">
                  ¥{laborCost.totalCost.toLocaleString()}
                </p>
              </div>

              <div className="p-4 border-2 border-green-200 rounded-lg bg-green-50">
                <p className="text-sm text-gray-600 mb-1">一日平均人件費</p>
                <p className="text-2xl font-bold text-green-900">
                  ¥{laborCost.avgCostPerDay.toLocaleString()}
                </p>
              </div>

              <div className="p-4 border-2 border-purple-200 rounded-lg bg-purple-50">
                <p className="text-sm text-gray-600 mb-1">総労働時間</p>
                <p className="text-2xl font-bold text-purple-900">{laborCost.totalHours}時間</p>
              </div>
            </div>

            {/* Top 5 Staff by Cost */}
            <div>
              <h3 className="text-lg font-semibold mb-3">人件費上位スタッフ (Top 5)</h3>
              <div className="space-y-2">
                {staffStats.slice(0, 5).map((staff, index) => {
                  const costRatio = ((staff.totalCost / laborCost.totalCost) * 100).toFixed(1);
                  return (
                    <div key={staff.userId} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{staff.userName}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[200px]">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${costRatio}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{costRatio}%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">
                          ¥{staff.totalCost.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">{staff.totalHours}時間</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cost Analysis Insights */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-yellow-900">分析インサイト</h3>
              <ul className="space-y-2 text-sm text-yellow-800">
                <li>
                  • 平均時給:{' '}
                  {staffStats.length > 0
                    ? `¥${Math.round(
                        staffStats.reduce((sum, s) => sum + s.hourlyWage, 0) / staffStats.length
                      ).toLocaleString()}`
                    : '-'}
                </li>
                <li>
                  • 一人当たり平均労働時間:{' '}
                  {staffStats.length > 0
                    ? `${(
                        staffStats.reduce((sum, s) => sum + parseFloat(s.totalHours), 0) /
                        staffStats.length
                      ).toFixed(1)}時間`
                    : '-'}
                </li>
                <li>
                  • 一人当たり平均人件費:{' '}
                  {staffStats.length > 0
                    ? `¥${Math.round(laborCost.totalCost / staffStats.length).toLocaleString()}`
                    : '-'}
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
