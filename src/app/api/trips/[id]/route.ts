import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const trip = await db.trip.findUnique({
    where: { id },
    include: {
      selectedFlight: true,
      selectedHotel: true,
      itineraryDays: {
        orderBy: { dayNumber: 'asc' },
        include: { items: true },
      },
    },
  });

  if (!trip || trip.userId !== session.user.id) {
    // Same response for "doesn't exist" and "not yours" -- don't leak which one it is.
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ trip });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const trip = await db.trip.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!trip || trip.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await db.trip.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
