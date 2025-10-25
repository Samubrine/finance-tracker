-- Fix RLS Policy for Users Table
-- Run this in your Supabase SQL Editor to allow user signup

-- Disable RLS on users table (since NextAuth handles auth, not Supabase Auth)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- OR if you want to keep RLS enabled, create a policy that allows INSERT for signup
-- Comment out the line above and uncomment these lines instead:

/*
-- Allow anyone to create a user (for signup)
CREATE POLICY "Allow public user creation" ON users
    FOR INSERT WITH CHECK (true);

-- Users can only read their own data (you'll need to implement this check in your API)
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (true);

-- Users can update their own data (you'll need to implement this check in your API)
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (true);
*/

-- Also disable RLS for other tables since you're using NextAuth
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE budgets DISABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE alerts DISABLE ROW LEVEL SECURITY;
