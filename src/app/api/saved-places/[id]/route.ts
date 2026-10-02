import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const place = await db.savedPlace.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!place || place.userId !== session.user.id) {
    // Same 404-for-both pattern as the trips routes.
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await db.savedPlace.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
