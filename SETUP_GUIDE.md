# Quick Start Guide - Authentication & Database

## What's New

Your Finance Tracker now includes:
- ✅ User authentication (signup/login)
- ✅ SQLite database with Prisma ORM
- ✅ Secure password hashing
- ✅ User-specific data isolation
- ✅ RESTful API endpoints
- ✅ Session management with NextAuth.js

## Setup Steps

1. **Environment Variables** (Already configured in `.env`)
   - DATABASE_URL: Points to SQLite database
   - NEXTAUTH_SECRET: Change this in production!
   - NEXTAUTH_URL: Your app URL

2. **Database is Ready**
   - Migration already applied
   - Tables created: User, Transaction, Budget

3. **Start the App**
   ```bash
   npm run dev
   ```

4. **First Time Usage**
   - Navigate to http://localhost:3000
   - You'll be redirected to /login
   - Click "Sign up" to create your first account
   - After signup, you'll be auto-logged in

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login (handled by NextAuth)
- `POST /api/auth/signout` - Logout (handled by NextAuth)

### Transactions (Protected)
- `GET /api/transactions` - Get all user's transactions
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/[id]` - Update transaction
- `DELETE /api/transactions/[id]` - Delete transaction

### Budgets (Protected)
- `GET /api/budgets` - Get all user's budgets
- `POST /api/budgets` - Create new budget
- `DELETE /api/budgets/[id]` - Delete budget

## Database Schema

### User
- id (String, Primary Key)
- email (String, Unique)
- name (String, Optional)
- password (String, Hashed)
- transactions (Relation)
- budgets (Relation)

### Transaction
- id (String, Primary Key)
- type (String: income/expense)
- amount (Float)
- category (String)
- description (String)
- date (DateTime)
- userId (String, Foreign Key)

### Budget
- id (String, Primary Key)
- category (String)
- limit (Float)
- period (String: weekly/monthly)
- userId (String, Foreign Key)

## Key Changes from Previous Version

1. **No more localStorage** - All data stored in database
2. **User accounts required** - Each user sees only their data
3. **API-based** - Frontend communicates with backend via REST API
4. **Async operations** - All data operations are now async/await
5. **Session-based** - Automatic login state management

## Testing

1. Create a test account:
   - Email: test@example.com
   - Password: password123

2. Add some transactions and budgets

3. Sign out and sign in again to verify persistence

4. Create another account to verify data isolation

## Production Deployment

Before deploying:
1. Change `NEXTAUTH_SECRET` to a strong random string
2. Update `NEXTAUTH_URL` to your production URL
3. Consider upgrading from SQLite to PostgreSQL/MySQL for production
4. Add proper error logging
5. Implement rate limiting on auth endpoints

## Troubleshooting

**Can't sign in?**
- Check if user exists in database
- Verify password is at least 6 characters
- Check browser console for errors

**Data not loading?**
- Ensure you're logged in
- Check browser network tab for API errors
- Verify database file exists at `prisma/dev.db`

**Database errors?**
- Run `npx prisma migrate reset` to reset database
- Run `npx prisma generate` to regenerate client

## Useful Commands

```bash
# View database in Prisma Studio
npx prisma studio

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Create new migration after schema changes
npx prisma migrate dev --name describe_changes

# Generate Prisma Client after schema changes
npx prisma generate
```

Enjoy your new authenticated finance tracker! 🎉
