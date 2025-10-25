import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// GET - Fetch a single savings goal
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

    const { data: savingsGoal, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !savingsGoal) {
      return NextResponse.json(
        { error: 'Savings goal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(savingsGoal);
  } catch (error) {
    console.error('Error fetching savings goal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch savings goal' },
      { status: 500 }
    );
  }
}

// PUT - Update a savings goal
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
      .from('savings_goals')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: 'Savings goal not found' },
        { status: 404 }
      );
    }

    const updatedData: any = {};
    
    if (body.name !== undefined) updatedData.name = body.name;
    if (body.targetAmount !== undefined) updatedData.target_amount = parseFloat(body.targetAmount);
    if (body.currentAmount !== undefined) updatedData.current_amount = parseFloat(body.currentAmount);
    if (body.deadline !== undefined) updatedData.deadline = body.deadline ? new Date(body.deadline).toISOString() : null;
    if (body.category !== undefined) updatedData.category = body.category;
    if (body.description !== undefined) updatedData.description = body.description;
    if (body.isCompleted !== undefined) updatedData.is_completed = body.isCompleted;

    const { data: savingsGoal, error } = await supabase
      .from('savings_goals')
      .update(updatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(savingsGoal);
  } catch (error) {
    console.error('Error updating savings goal:', error);
    return NextResponse.json(
      { error: 'Failed to update savings goal' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a savings goal
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
      .from('savings_goals')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: 'Savings goal not found' },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: 'Savings goal deleted successfully' });
  } catch (error) {
    console.error('Error deleting savings goal:', error);
    return NextResponse.json(
      { error: 'Failed to delete savings goal' },
      { status: 500 }
    );
  }
}
