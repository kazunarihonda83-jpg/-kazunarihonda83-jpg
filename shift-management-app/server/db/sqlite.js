import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'shift_management.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'staff',
    hourly_wage REAL DEFAULT 0,
    avatar_url TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS stores (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    opening_time TEXT,
    closing_time TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS positions (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id)
  );

  CREATE TABLE IF NOT EXISTS shifts (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    position_id TEXT,
    shift_date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    break_minutes INTEGER DEFAULT 0,
    notes TEXT,
    status TEXT DEFAULT 'draft',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (position_id) REFERENCES positions(id)
  );

  CREATE TABLE IF NOT EXISTS attendances (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    shift_id TEXT,
    clock_in TEXT NOT NULL,
    clock_out TEXT,
    clock_in_method TEXT DEFAULT 'manual',
    clock_out_method TEXT DEFAULT 'manual',
    clock_in_location TEXT,
    clock_out_location TEXT,
    break_minutes INTEGER DEFAULT 0,
    work_hours INTEGER DEFAULT 0,
    status TEXT DEFAULT 'working',
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (shift_id) REFERENCES shifts(id)
  );

  CREATE TABLE IF NOT EXISTS evaluations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    evaluator_id TEXT NOT NULL,
    evaluation_date TEXT NOT NULL,
    period_start TEXT,
    period_end TEXT,
    work_quality INTEGER DEFAULT 3,
    punctuality INTEGER DEFAULT 3,
    teamwork INTEGER DEFAULT 3,
    customer_service INTEGER DEFAULT 3,
    improvement INTEGER DEFAULT 3,
    overall_rating REAL DEFAULT 3.0,
    strengths TEXT,
    areas_for_improvement TEXT,
    goals TEXT,
    comments TEXT,
    status TEXT DEFAULT 'draft',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (evaluator_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS feedback (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    from_user_id TEXT NOT NULL,
    feedback_type TEXT NOT NULL,
    category TEXT,
    message TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (from_user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    target_date TEXT,
    status TEXT DEFAULT 'in_progress',
    progress INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS shift_requests (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    store_id TEXT NOT NULL,
    request_month TEXT NOT NULL,
    request_date TEXT NOT NULL,
    preferred_start_time TEXT,
    preferred_end_time TEXT,
    preferred_position_id TEXT,
    availability TEXT DEFAULT 'available',
    priority INTEGER DEFAULT 1,
    notes TEXT,
    status TEXT DEFAULT 'pending',
    submitted_at TEXT,
    approved_at TEXT,
    approved_by TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (preferred_position_id) REFERENCES positions(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS shift_swaps (
    id TEXT PRIMARY KEY,
    requester_user_id TEXT NOT NULL,
    requester_shift_id TEXT NOT NULL,
    target_user_id TEXT NOT NULL,
    target_shift_id TEXT,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_user_id) REFERENCES users(id),
    FOREIGN KEY (requester_shift_id) REFERENCES shifts(id),
    FOREIGN KEY (target_user_id) REFERENCES users(id),
    FOREIGN KEY (target_shift_id) REFERENCES shifts(id)
  );
`);

// Seed database function
function seedDatabase() {
  const userCheck = db.prepare('SELECT COUNT(*) as count FROM users').get();
  
  if (userCheck.count > 0) {
    console.log('Database already has data. Skipping seed.');
    return;
  }

  console.log('Seeding database...');

  // Hash passwords
  const adminPassword = bcrypt.hashSync('password123', 10);
  const managerPassword = bcrypt.hashSync('password123', 10);
  const staffPassword = bcrypt.hashSync('password123', 10);

  // Insert users
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, hourly_wage)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertUser.run('user-admin', 'admin@test.com', adminPassword, '管理者', 'ユーザー', '090-1234-5678', 'admin', 2000);
  insertUser.run('user-manager', 'manager@test.com', managerPassword, 'マネージャー', '田中', '090-2345-6789', 'manager', 1500);
  insertUser.run('user-staff1', 'staff@test.com', staffPassword, 'スタッフ', '佐藤', '090-3456-7890', 'staff', 1200);
  insertUser.run('user-staff2', 'staff2@test.com', staffPassword, '花子', '鈴木', '090-4567-8901', 'staff', 1200);
  insertUser.run('user-staff3', 'staff3@test.com', staffPassword, '次郎', '山田', '090-5678-9012', 'staff', 1100);

  // Insert store
  const insertStore = db.prepare(`
    INSERT INTO stores (id, name, code, address, phone, opening_time, closing_time)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertStore.run('store-main', '本店カフェ', 'MAIN', '東京都渋谷区1-2-3', '03-1234-5678', '09:00', '22:00');

  // Insert positions
  const insertPosition = db.prepare(`
    INSERT INTO positions (id, store_id, name, code, description, color, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertPosition.run('pos-hall', 'store-main', 'ホールスタッフ', 'HALL', 'フロア接客担当', '#3B82F6', 1);
  insertPosition.run('pos-kitchen', 'store-main', 'キッチンスタッフ', 'KITCHEN', '調理担当', '#10B981', 2);
  insertPosition.run('pos-cashier', 'store-main', 'レジ担当', 'CASHIER', '会計担当', '#F59E0B', 3);
  insertPosition.run('pos-barista', 'store-main', 'バリスタ', 'BARISTA', 'ドリンク作成担当', '#8B5CF6', 4);

  console.log('Sample data seeded successfully!');
  console.log('\nTest Accounts:');
  console.log('Admin: admin@test.com / password123');
  console.log('Manager: manager@test.com / password123');
  console.log('Staff: staff@test.com / password123');
}

// Run seed
seedDatabase();

export default db;
