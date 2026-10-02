import { headers } from 'next/headers';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import SavedPlaceCard from '@/components/explore/SavedPlaceCard';
import type { AreaCategory } from '@/generated/prisma/client';

const CATEGORIES: AreaCategory[] = [
  'TOURIST_AREA',
  'LANDMARK',
  'NATURE',
  'FOOD',
];

export default async function SavedPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const { category } = await searchParams;
  const savedPlaces = await db.savedPlace.findMany({
    where: {
      userId: session.user.id,
      ...(category ? { category: category as AreaCategory } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div style={{ maxWidth: 640, margin: '40px auto', padding: '0 16px' }}>
      <h1>Saved places</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <Link href="/saved">All</Link>
        {CATEGORIES.map((c) => (
          <Link key={c} href={`/saved?category=${c}`}>
            {c}
          </Link>
        ))}
      </div>

      {savedPlaces.length === 0 && (
        <p>
          No saved places yet. <Link href="/explore">Start exploring</Link>.
        </p>
      )}

      {savedPlaces.map((p) => (
        <SavedPlaceCard key={p.id} place={p} />
      ))}
    </div>
  );
}
