import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch all recurring transactions
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const recurringTransactions = await prisma.recurringTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(recurringTransactions);
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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

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

    const recurringTransaction = await prisma.recurringTransaction.create({
      data: {
        type,
        amount: parseFloat(amount),
        category,
        description: description || '',
        frequency,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive !== undefined ? isActive : true,
        userId: user.id,
      },
    });

    return NextResponse.json(recurringTransaction, { status: 201 });
  } catch (error) {
    console.error('Error creating recurring transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create recurring transaction' },
      { status: 500 }
    );
  }
}
