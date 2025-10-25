import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// GET - Fetch a single recurring transaction
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const { data: recurringTransaction, error } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !recurringTransaction) {
      return NextResponse.json(
        { error: 'Recurring transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(recurringTransaction);
  } catch (error) {
    console.error('Error fetching recurring transaction:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recurring transaction' },
      { status: 500 }
    );
  }
}

// PUT - Update a recurring transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();

    const { data: existing } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: 'Recurring transaction not found' },
        { status: 404 }
      );
    }

    const updatedData: any = {};
    
    if (body.type !== undefined) updatedData.type = body.type;
    if (body.amount !== undefined) updatedData.amount = parseFloat(body.amount);
    if (body.category !== undefined) updatedData.category = body.category;
    if (body.description !== undefined) updatedData.description = body.description;
    if (body.frequency !== undefined) updatedData.frequency = body.frequency;
    if (body.startDate !== undefined) updatedData.start_date = new Date(body.startDate).toISOString();
    if (body.endDate !== undefined) updatedData.end_date = body.endDate ? new Date(body.endDate).toISOString() : null;
    if (body.isActive !== undefined) updatedData.is_active = body.isActive;
    if (body.lastRun !== undefined) updatedData.last_run = body.lastRun ? new Date(body.lastRun).toISOString() : null;

    const { data: recurringTransaction, error } = await supabase
      .from('recurring_transactions')
      .update(updatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(recurringTransaction);
  } catch (error) {
    console.error('Error updating recurring transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update recurring transaction' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a recurring transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const { data: existing } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: 'Recurring transaction not found' },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from('recurring_transactions')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: 'Recurring transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting recurring transaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete recurring transaction' },
      { status: 500 }
    );
  }
}
