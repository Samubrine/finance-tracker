# API Routes Migration Helper

This file contains ready-to-use code for all API routes that need to be updated.

## Files that Need Updates:

1. ✅ `app/api/auth/signup/route.ts` - DONE
2. ⚠️ `app/api/transactions/route.ts`
3. ⚠️ `app/api/transactions/[id]/route.ts`
4. ⚠️ `app/api/budgets/route.ts`
5. ⚠️ `app/api/budgets/[id]/route.ts`
6. ⚠️ `app/api/recurring-transactions/route.ts`
7. ⚠️ `app/api/recurring-transactions/[id]/route.ts`
8. ⚠️ `app/api/savings-goals/route.ts`
9. ⚠️ `app/api/savings-goals/[id]/route.ts`
10. ⚠️ `app/api/alerts/route.ts`

## Quick Find & Replace Patterns

### 1. Import Statement
**Find:** `import { prisma } from "@/lib/prisma"`
**Replace:** `import { supabase } from "@/lib/supabase"`

### 2. Column Names (IMPORTANT!)
Remember: PostgreSQL uses snake_case, not camelCase!

| Prisma (camelCase) | Supabase (snake_case) |
|-------------------|----------------------|
| userId | user_id |
| createdAt | created_at |
| updatedAt | updated_at |
| startDate | start_date |
| endDate | end_date |
| lastRun | last_run |
| isActive | is_active |
| targetAmount | target_amount |
| currentAmount | current_amount |
| isCompleted | is_completed |
| isRead | is_read |

### 3. Table Names
| Prisma Model | Supabase Table |
|-------------|----------------|
| prisma.user | supabase.from('users') |
| prisma.transaction | supabase.from('transactions') |
| prisma.budget | supabase.from('budgets') |
| prisma.recurringTransaction | supabase.from('recurring_transactions') |
| prisma.savingsGoal | supabase.from('savings_goals') |
| prisma.alert | supabase.from('alerts') |

---

## Sample Migrations

### Example 1: GET all transactions

#### Before (Prisma):
```typescript
const transactions = await prisma.transaction.findMany({
  where: { 
    userId: session.user.id,
    type: type as string
  },
  orderBy: {
    date: 'desc'
  }
})
```

#### After (Supabase):
```typescript
let query = supabase
  .from('transactions')
  .select('*')
  .eq('user_id', session.user.id)
  .order('date', { ascending: false })

if (type) {
  query = query.eq('type', type)
}

const { data: transactions, error } = await query

if (error) {
  return NextResponse.json({ error: error.message }, { status: 500 })
}
```

### Example 2: GET one by ID

#### Before (Prisma):
```typescript
const transaction = await prisma.transaction.findUnique({
  where: { id: params.id }
})

if (!transaction || transaction.userId !== session.user.id) {
  return NextResponse.json({ error: "Not found" }, { status: 404 })
}
```

#### After (Supabase):
```typescript
const { data: transaction, error } = await supabase
  .from('transactions')
  .select('*')
  .eq('id', params.id)
  .eq('user_id', session.user.id)
  .single()

if (error || !transaction) {
  return NextResponse.json({ error: "Not found" }, { status: 404 })
}
```

### Example 3: CREATE

#### Before (Prisma):
```typescript
const transaction = await prisma.transaction.create({
  data: {
    type,
    amount,
    category,
    description,
    date,
    userId: session.user.id
  }
})
```

#### After (Supabase):
```typescript
const { data: transaction, error } = await supabase
  .from('transactions')
  .insert({
    type,
    amount,
    category,
    description,
    date,
    user_id: session.user.id
  })
  .select()
  .single()

if (error) {
  return NextResponse.json({ error: error.message }, { status: 500 })
}
```

### Example 4: UPDATE

#### Before (Prisma):
```typescript
const transaction = await prisma.transaction.update({
  where: { id: params.id },
  data: {
    type,
    amount,
    category,
    description,
    date
  }
})
```

#### After (Supabase):
```typescript
const { data: transaction, error } = await supabase
  .from('transactions')
  .update({
    type,
    amount,
    category,
    description,
    date
  })
  .eq('id', params.id)
  .eq('user_id', session.user.id) // Security check
  .select()
  .single()

if (error) {
  return NextResponse.json({ error: error.message }, { status: 500 })
}
```

### Example 5: DELETE

#### Before (Prisma):
```typescript
await prisma.transaction.delete({
  where: { id: params.id }
})
```

#### After (Supabase):
```typescript
const { error } = await supabase
  .from('transactions')
  .delete()
  .eq('id', params.id)
  .eq('user_id', session.user.id) // Security check

if (error) {
  return NextResponse.json({ error: error.message }, { status: 500 })
}
```

### Example 6: UPDATE MANY

#### Before (Prisma):
```typescript
await prisma.alert.updateMany({
  where: { 
    userId: session.user.id,
    isRead: false
  },
  data: { isRead: true }
})
```

#### After (Supabase):
```typescript
const { error } = await supabase
  .from('alerts')
  .update({ is_read: true })
  .eq('user_id', session.user.id)
  .eq('is_read', false)

if (error) {
  return NextResponse.json({ error: error.message }, { status: 500 })
}
```

### Example 7: DELETE MANY

#### Before (Prisma):
```typescript
await prisma.alert.deleteMany({
  where: {
    userId: session.user.id,
    isRead: true
  }
})
```

#### After (Supabase):
```typescript
const { error } = await supabase
  .from('alerts')
  .delete()
  .eq('user_id', session.user.id)
  .eq('is_read', true)

if (error) {
  return NextResponse.json({ error: error.message }, { status: 500 })
}
```

---

## Automated Steps

Would you like me to automatically update all the API route files? I can do them all at once!

Just let me know and I'll:
1. Update all imports
2. Convert all Prisma queries to Supabase
3. Fix all column names (camelCase → snake_case)
4. Add proper error handling

---

## Manual Steps (if you prefer)

1. Open each file in the list above
2. Replace the import statement
3. Find each `prisma.` query
4. Replace with equivalent Supabase query from examples above
5. Remember to change column names to snake_case!
6. Add error handling for each query

---

## Testing Checklist

After migration, test:
- [ ] User signup
- [ ] User login
- [ ] Create transaction
- [ ] View transactions
- [ ] Update transaction
- [ ] Delete transaction
- [ ] Create budget
- [ ] View budgets
- [ ] Delete budget
- [ ] Create recurring transaction
- [ ] View recurring transactions
- [ ] Create savings goal
- [ ] Update savings goal
- [ ] View alerts
- [ ] Mark alerts as read
