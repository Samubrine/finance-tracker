import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch all alerts
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const alerts = await prisma.alert.findMany({
      where: {
        userId: user.id,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to recent 50 alerts
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

// POST - Create a new alert (usually called by system)
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
    const { type, title, message, severity, metadata } = body;

    if (!type || !title || !message || !severity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const alert = await prisma.alert.create({
      data: {
        type,
        title,
        message,
        severity,
        metadata: metadata || null,
        userId: user.id,
      },
    });

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}

// PATCH - Mark alerts as read
export async function PATCH(request: NextRequest) {
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
    const { alertIds, markAllAsRead } = body;

    if (markAllAsRead) {
      // Mark all alerts as read
      await prisma.alert.updateMany({
        where: { userId: user.id, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ message: 'All alerts marked as read' });
    } else if (alertIds && Array.isArray(alertIds)) {
      // Mark specific alerts as read
      await prisma.alert.updateMany({
        where: {
          id: { in: alertIds },
          userId: user.id,
        },
        data: { isRead: true },
      });
      return NextResponse.json({ message: 'Alerts marked as read' });
    } else {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error updating alerts:', error);
    return NextResponse.json(
      { error: 'Failed to update alerts' },
      { status: 500 }
    );
  }
}

// DELETE - Delete alerts
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('id');
    const deleteAll = searchParams.get('deleteAll') === 'true';

    if (deleteAll) {
      await prisma.alert.deleteMany({
        where: { userId: user.id },
      });
      return NextResponse.json({ message: 'All alerts deleted' });
    } else if (alertId) {
      await prisma.alert.deleteMany({
        where: {
          id: alertId,
          userId: user.id,
        },
      });
      return NextResponse.json({ message: 'Alert deleted' });
    } else {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error deleting alerts:', error);
    return NextResponse.json(
      { error: 'Failed to delete alerts' },
      { status: 500 }
    );
  }
}
