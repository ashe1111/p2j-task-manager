/*
  # P2J - Procrastinator to J-Person Database Schema

  ## Overview
  This migration creates the complete database schema for the P2J application,
  a gamified task management system that helps procrastinators become organized.

  ## Tables Created

  ### 1. users
  - `id` (uuid, primary key) - Unique user identifier
  - `email` (text, optional) - User email for authenticated users
  - `username` (text) - Display name
  - `xp` (integer) - Experience points for gamification
  - `level` (integer) - User level (Bronze P → Gold J)
  - `ai_personality` (text) - Selected AI personality (warm/savage/rational)
  - `daily_goal_count` (integer) - Target number of tasks per day
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. tasks
  - `id` (uuid, primary key) - Unique task identifier
  - `user_id` (uuid, foreign key) - References users table
  - `title` (text) - Task title
  - `description` (text, optional) - Detailed task description
  - `priority` (text) - Priority level (high/medium/low)
  - `status` (text) - Task status (pending/in_progress/completed)
  - `scheduled_date` (date) - When task should be done
  - `scheduled_time` (text, optional) - Suggested time slot
  - `completed_at` (timestamptz, optional) - Completion timestamp
  - `xp_reward` (integer) - XP earned on completion
  - `ai_generated` (boolean) - Whether task was created by AI
  - `created_at` (timestamptz) - Task creation timestamp

  ### 3. daily_moods
  - `id` (uuid, primary key) - Unique mood entry identifier
  - `user_id` (uuid, foreign key) - References users table
  - `mood` (text) - Emoji representation of mood
  - `date` (date) - Date of mood entry
  - `created_at` (timestamptz) - Entry creation timestamp

  ### 4. weekly_reports
  - `id` (uuid, primary key) - Unique report identifier
  - `user_id` (uuid, foreign key) - References users table
  - `week_start` (date) - Start of the week
  - `week_end` (date) - End of the week
  - `completion_rate` (numeric) - Percentage of tasks completed
  - `total_tasks` (integer) - Total tasks for the week
  - `completed_tasks` (integer) - Number of completed tasks
  - `xp_earned` (integer) - Total XP earned this week
  - `ai_summary` (text) - AI-generated weekly summary
  - `created_at` (timestamptz) - Report creation timestamp

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Users can only access their own data
  - Policies enforce user isolation
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  username text NOT NULL DEFAULT 'Anonymous User',
  xp integer DEFAULT 0,
  level integer DEFAULT 1,
  ai_personality text DEFAULT 'warm' CHECK (ai_personality IN ('warm', 'savage', 'rational')),
  daily_goal_count integer DEFAULT 5,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  priority text DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  scheduled_date date NOT NULL,
  scheduled_time text,
  completed_at timestamptz,
  xp_reward integer DEFAULT 10,
  ai_generated boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create daily_moods table
CREATE TABLE IF NOT EXISTS daily_moods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  mood text NOT NULL,
  date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create weekly_reports table
CREATE TABLE IF NOT EXISTS weekly_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  week_start date NOT NULL,
  week_end date NOT NULL,
  completion_rate numeric(5,2) DEFAULT 0,
  total_tasks integer DEFAULT 0,
  completed_tasks integer DEFAULT 0,
  xp_earned integer DEFAULT 0,
  ai_summary text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, week_start)
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_moods ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Tasks policies
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Daily moods policies
CREATE POLICY "Users can view own moods"
  ON daily_moods FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own moods"
  ON daily_moods FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own moods"
  ON daily_moods FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Weekly reports policies
CREATE POLICY "Users can view own reports"
  ON weekly_reports FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own reports"
  ON weekly_reports FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_scheduled_date ON tasks(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_daily_moods_user_date ON daily_moods(user_id, date);
CREATE INDEX IF NOT EXISTS idx_weekly_reports_user_week ON weekly_reports(user_id, week_start);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();