import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import shiftRoutes from './routes/shifts.js';
import attendanceRoutes from './routes/attendance.js';
import evaluationRoutes from './routes/evaluations.js';
import positionRoutes from './routes/positions.js';
import db from './db/sqlite.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Shift Management API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: '/api/auth/*',
      shifts: '/api/shifts/*',
      attendance: '/api/attendance/*',
      evaluations: '/api/evaluations/*',
      positions: '/api/positions/*'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/positions', positionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════╗
║   Shift Management API Server Started     ║
╠════════════════════════════════════════════╣
║  🚀 Server: http://localhost:${PORT}        ║
║  🔍 Health: http://localhost:${PORT}/health ║
║                                            ║
║  📚 API Endpoints:                         ║
║  • POST /api/auth/login                    ║
║  • POST /api/auth/register                 ║
║  • GET  /api/auth/me                       ║
║  • GET  /api/shifts                        ║
║  • POST /api/shifts                        ║
║  • POST /api/shifts/generate               ║
║  • POST /api/shifts/publish                ║
║  • GET  /api/shifts/simulate/labor-cost    ║
║  • POST /api/attendance/clock-in           ║
║  • POST /api/attendance/clock-out          ║
║  • GET  /api/attendance/all                ║
║  • GET  /api/evaluations                   ║
║  • POST /api/evaluations                   ║
║  • GET  /api/positions                     ║
╚════════════════════════════════════════════╝
  `);
});

export default app;
