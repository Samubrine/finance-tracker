import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// GET - Fetch all recurring transactions
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { data: recurringTransactions, error } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(recurringTransactions || []);
  } catch (error) {
    console.error('Error fetching recurring transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recurring transactions' },
      { status: 500 }
    );
  }
}

// POST - Create a new recurring transaction
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { type, amount, category, description, frequency, startDate, endDate, isActive } = body;

    if (!type || !amount || !category || !frequency || !startDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: recurringTransaction, error } = await supabase
      .from('recurring_transactions')
      .insert({
        type,
        amount: parseFloat(amount),
        category,
        description: description || '',
        frequency,
        start_date: new Date(startDate).toISOString(),
        end_date: endDate ? new Date(endDate).toISOString() : null,
        is_active: isActive !== undefined ? isActive : true,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(recurringTransaction, { status: 201 });
  } catch (error) {
    console.error('Error creating recurring transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create recurring transaction' },
      { status: 500 }
    );
  }
}
