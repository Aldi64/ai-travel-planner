import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { SavePlaceSchema } from '@/lib/validation/savedPlace';
import type { AreaCategory } from '@/generated/prisma/client';

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const category = request.nextUrl.searchParams.get(
    'category',
  ) as AreaCategory | null;
  const savedPlaces = await db.savedPlace.findMany({
    where: { userId: session.user.id, ...(category ? { category } : {}) },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ savedPlaces });
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = SavePlaceSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const body = parsed.data;

  // Upsert -- re-saving the same place is a no-op, not an error, matching
  // the @@unique([userId, category, name, city]) constraint from the schema.
  const saved = await db.savedPlace.upsert({
    where: {
      userId_category_name_city: {
        userId: session.user.id,
        category: body.category,
        name: body.name,
        city: body.city,
      },
    },
    update: {},
    create: {
      userId: session.user.id,
      category: body.category,
      source: body.source,
      externalId: body.externalId ?? null,
      name: body.name,
      description: body.description ?? null,
      address: body.address ?? null,
      photoUrl: body.photoUrl ?? null,
      rating: body.rating ?? null,
      city: body.city,
    },
  });

  return NextResponse.json({ savedPlace: saved });
}
