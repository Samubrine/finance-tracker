# Finance Tracker App

A comprehensive finance tracking application built with Next.js, TypeScript, and React. Track your income, expenses, budgets, and gain insights into your financial health with secure user authentication and database storage.

## Features

### Authentication & User Management
- **User Registration** - Create new accounts with email and password
- **Secure Login** - Protected authentication with NextAuth.js
- **Session Management** - Persistent user sessions with automatic protection
- **Password Hashing** - Secure password storage with bcrypt

### Core CRUD Operations
1. **Create** - Add new income and expense transactions
2. **Read** - View all transactions with detailed information
3. **Update** - Edit existing transactions
4. **Delete** - Remove transactions with confirmation dialog

### 5 Additional Features

1. **Advanced Filtering & Search**
   - Filter by transaction type (income/expense)
   - Filter by category
   - Search by description
   - Date range filtering
   - Clear all filters option

2. **Data Visualization with Charts**
   - Pie chart showing expense breakdown by category
   - Line chart displaying transaction trends over the last 30 days
   - Income, expense, and net balance visualization
   - Interactive tooltips with detailed information

3. **CSV Export**
   - Export all transactions to CSV format
   - Download transactions for external analysis
   - Includes date, type, category, description, and amount

4. **Budget Tracking**
   - Set budgets for expense categories
   - Choose weekly or monthly budget periods
   - Visual progress bars showing spending vs. budget
   - Alert notifications when approaching or exceeding budget limits
   - Track multiple category budgets simultaneously

5. **Dashboard Analytics**
   - Real-time statistics display
   - Total balance calculation
   - Total income tracking
   - Total expenses tracking
   - Transaction count
   - Color-coded cards for easy reading

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **State Management**: React Context API
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js
- **Password Security**: bcryptjs

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd record-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

4. Initialize the database:
```bash
npx prisma migrate dev
npx prisma generate
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

7. Create an account by clicking "Sign up" or navigating to `/signup`

## Usage

### Authentication

1. **Sign Up**: Navigate to `/signup` or click "Sign up" from the login page
   - Enter your name, email, and password
   - Password must be at least 6 characters
   - Account is created and you're automatically logged in

2. **Sign In**: Navigate to `/login` or the homepage when not authenticated
   - Enter your email and password
   - Session persists until you sign out

3. **Sign Out**: Click the "Sign Out" button in the header

### Adding Transactions
1. Click the "Add Transaction" button in the header
2. Select transaction type (Income or Expense)
3. Enter amount, category, description, and date
4. Click "Add" to save

### Editing Transactions
1. Click the edit icon (pencil) on any transaction
2. Modify the desired fields
3. Click "Update" to save changes

### Deleting Transactions
1. Click the delete icon (trash) on any transaction
2. Confirm deletion in the popup dialog

### Using Filters
1. Navigate to the Transactions tab
2. Use the filter bar to:
   - Search by description
   - Filter by type (income/expense)
   - Filter by category
   - Set date range
3. Click "Clear All" to reset filters

### Setting Budgets
1. Navigate to the Budget tab
2. Click "Add Budget"
3. Select category, set limit, and choose period
4. Monitor spending with visual progress bars
5. Receive alerts when approaching or exceeding limits

### Viewing Analytics
1. Navigate to the Analytics tab
2. View expense distribution pie chart
3. Analyze transaction trends over time
4. See income vs. expense patterns

### Exporting Data
1. Click "Export CSV" button in the header
2. File downloads automatically with current date in filename
3. Open in Excel, Google Sheets, or any spreadsheet application

## Project Structure

```
record-tracker/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/
│   │   │   │   └── route.ts        # NextAuth API routes
│   │   │   └── signup/
│   │   │       └── route.ts        # User registration endpoint
│   │   ├── transactions/
│   │   │   ├── [id]/
│   │   │   │   └── route.ts        # Update/Delete transaction
│   │   │   └── route.ts            # Get/Create transactions
│   │   └── budgets/
│   │       ├── [id]/
│   │       │   └── route.ts        # Delete budget
│   │       └── route.ts            # Get/Create budgets
│   ├── components/
│   │   ├── BudgetTracker.tsx       # Budget management component
│   │   ├── Charts.tsx              # Data visualization
│   │   ├── Dashboard.tsx           # Statistics dashboard
│   │   ├── ExportButton.tsx        # CSV export functionality
│   │   ├── FilterBar.tsx           # Filtering interface
│   │   ├── TransactionForm.tsx     # Add/Edit form
│   │   ├── TransactionItem.tsx     # Individual transaction display
│   │   └── TransactionList.tsx     # Transaction list container
│   ├── context/
│   │   └── TransactionContext.tsx  # Global state management
│   ├── providers/
│   │   └── AuthProvider.tsx        # NextAuth session provider
│   ├── types/
│   │   └── index.ts                # TypeScript definitions
│   ├── login/
│   │   └── page.tsx                # Login page
│   ├── signup/
│   │   └── page.tsx                # Signup page
│   ├── globals.css                 # Global styles
│   ├── layout.tsx                  # Root layout with providers
│   └── page.tsx                    # Main application page
├── lib/
│   ├── auth.ts                     # NextAuth configuration
│   └── prisma.ts                   # Prisma client
├── prisma/
│   ├── schema.prisma               # Database schema
│   └── migrations/                 # Database migrations
├── types/
│   └── next-auth.d.ts              # NextAuth type definitions
├── public/                         # Static assets
├── .env                            # Environment variables
└── package.json                    # Dependencies and scripts
```

## Features in Detail

### State Management
- Uses React Context API for global state
- RESTful API integration for data operations
- Automatic data synchronization with database

### Responsive Design
- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-friendly interface

### Data Persistence
- SQLite database for reliable storage
- Prisma ORM for type-safe database queries
- User-isolated data (each user only sees their own data)
- Data persists across sessions and devices

### User Experience
- Intuitive interface
- Smooth animations and transitions
- Confirmation dialogs for destructive actions
- Real-time updates

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt before storage
- **JWT Sessions**: Secure session management with JSON Web Tokens
- **API Protection**: All transaction and budget endpoints require authentication
- **User Isolation**: Users can only access their own data
- **Environment Variables**: Sensitive credentials stored in .env file

## Database Schema

### User Table
- `id`: Unique identifier
- `email`: User email (unique)
- `name`: User display name
- `password`: Hashed password
- `createdAt`: Account creation timestamp

### Transaction Table
- `id`: Unique identifier
- `type`: Income or expense
- `amount`: Transaction amount
- `category`: Transaction category
- `description`: Transaction details
- `date`: Transaction date
- `userId`: Foreign key to User
- `createdAt`: Record creation timestamp

### Budget Table
- `id`: Unique identifier
- `category`: Budget category
- `limit`: Budget limit amount
- `period`: Weekly or monthly
- `userId`: Foreign key to User
- `createdAt`: Budget creation timestamp

## Future Enhancements

Potential features for future versions:
- Recurring transactions
- Bill reminders
- Category customization
- Multiple currency support
- Dark mode toggle
- Mobile app version
- Export to PDF
- Sharing reports with family members

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
