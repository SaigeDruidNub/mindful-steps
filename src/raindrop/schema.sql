-- Walk logs table
CREATE TABLE IF NOT EXISTS walk_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  steps INTEGER NOT NULL,
  distance REAL,
  duration INTEGER,
  created_at TEXT NOT NULL
);

-- User photos table
CREATE TABLE IF NOT EXISTS user_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  uploaded_at TEXT NOT NULL
);

-- User achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  achievement_type TEXT NOT NULL,
  achieved_at TEXT NOT NULL,
  UNIQUE(user_id, achievement_type)
);

-- Daily statistics table
CREATE TABLE IF NOT EXISTS daily_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  steps INTEGER NOT NULL,
  UNIQUE(user_id, date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_walk_logs_user_id ON walk_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_walk_logs_created_at ON walk_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_photos_user_id ON user_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_date ON daily_stats(user_id, date);