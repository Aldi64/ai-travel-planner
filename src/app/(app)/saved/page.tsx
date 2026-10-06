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
const CATEGORY_LABELS: Record<AreaCategory, string> = {
  TOURIST_AREA: 'Tourist areas',
  LANDMARK: 'Landmarks',
  NATURE: 'Nature',
  FOOD: 'Food',
  TRANSPORTATION: 'Transportation',
};

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
    <div className="max-w-2xl mx-auto mt-10 px-4 pb-16">
      <h1 className="text-2xl text-ink">Saved places</h1>

      <div className="seg-group mt-4 mb-6">
        <Link href="/saved" data-active={!category} className="seg-tab">
          All
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            href={`/saved?category=${c}`}
            data-active={category === c}
            className="seg-tab"
          >
            {CATEGORY_LABELS[c]}
          </Link>
        ))}
      </div>

      {savedPlaces.length === 0 && (
        <p className="text-ink/60">
          No saved places yet.{' '}
          <Link
            href="/explore"
            className="text-ink underline decoration-ink/30 hover:decoration-ink"
          >
            Start exploring
          </Link>
          .
        </p>
      )}

      {savedPlaces.map((p) => (
        <SavedPlaceCard key={p.id} place={p} />
      ))}
    </div>
  );
}
