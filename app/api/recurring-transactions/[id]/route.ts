import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;

    const recurringTransaction = await prisma.recurringTransaction.findUnique({
      where: { id, userId: user.id },
    });

    if (!recurringTransaction) {
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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.recurringTransaction.findUnique({
      where: { id, userId: user.id },
    });

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
    if (body.startDate !== undefined) updatedData.startDate = new Date(body.startDate);
    if (body.endDate !== undefined) updatedData.endDate = body.endDate ? new Date(body.endDate) : null;
    if (body.isActive !== undefined) updatedData.isActive = body.isActive;
    if (body.lastRun !== undefined) updatedData.lastRun = body.lastRun ? new Date(body.lastRun) : null;

    const recurringTransaction = await prisma.recurringTransaction.update({
      where: { id },
      data: updatedData,
    });

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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;

    const existing = await prisma.recurringTransaction.findUnique({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Recurring transaction not found' },
        { status: 404 }
      );
    }

    await prisma.recurringTransaction.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Recurring transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting recurring transaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete recurring transaction' },
      { status: 500 }
    );
  }
}
