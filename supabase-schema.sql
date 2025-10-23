-- Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budgets table
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  limit_amount NUMERIC NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('weekly', 'monthly')),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recurring transactions table
CREATE TABLE recurring_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  last_run TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Savings goals table
CREATE TABLE savings_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC DEFAULT 0,
  deadline TIMESTAMPTZ,
  category TEXT,
  description TEXT,
  is_completed BOOLEAN DEFAULT false,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts table
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('budget_warning', 'goal_milestone', 'unusual_spending', 'recurring_reminder')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'error')),
  is_read BOOLEAN DEFAULT false,
  metadata JSONB,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_recurring_transactions_user_id ON recurring_transactions(user_id);
CREATE INDEX idx_recurring_transactions_is_active ON recurring_transactions(is_active);
CREATE INDEX idx_savings_goals_user_id ON savings_goals(user_id);
CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_is_read ON alerts(is_read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_transactions_updated_at BEFORE UPDATE ON recurring_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_savings_goals_updated_at BEFORE UPDATE ON savings_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies should be configured based on your authentication method
-- Since you're using NextAuth, you'll need to handle authorization in your API routes
-- If you want to use Supabase Auth instead, uncomment and configure these policies:

/*
-- Users can only read their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
    FOR DELETE USING (auth.uid() = user_id);

-- Budgets policies
CREATE POLICY "Users can view own budgets" ON budgets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own budgets" ON budgets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets" ON budgets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets" ON budgets
    FOR DELETE USING (auth.uid() = user_id);

-- Recurring transactions policies
CREATE POLICY "Users can view own recurring transactions" ON recurring_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own recurring transactions" ON recurring_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recurring transactions" ON recurring_transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recurring transactions" ON recurring_transactions
    FOR DELETE USING (auth.uid() = user_id);

-- Savings goals policies
CREATE POLICY "Users can view own savings goals" ON savings_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own savings goals" ON savings_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own savings goals" ON savings_goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own savings goals" ON savings_goals
    FOR DELETE USING (auth.uid() = user_id);

-- Alerts policies
CREATE POLICY "Users can view own alerts" ON alerts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own alerts" ON alerts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts" ON alerts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts" ON alerts
    FOR DELETE USING (auth.uid() = user_id);
*/
