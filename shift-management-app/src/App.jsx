import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ShiftCalendar from './pages/ShiftCalendar';
import ShiftManagement from './pages/ShiftManagement';
import ShiftRequest from './pages/ShiftRequest';
import AttendanceTracking from './pages/AttendanceTracking';
import EvaluationManagement from './pages/EvaluationManagement';
import Reports from './pages/Reports';
import StaffList from './pages/StaffList';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
      } />
      
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/shifts/calendar" element={<ShiftCalendar />} />
        <Route path="/shifts/management" element={<ShiftManagement />} />
        <Route path="/shifts/request" element={<ShiftRequest />} />
        <Route path="/attendance" element={<AttendanceTracking />} />
        <Route path="/evaluations" element={<EvaluationManagement />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/staff" element={<StaffList />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
