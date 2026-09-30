import { headers } from 'next/headers';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import TripCard from '@/components/trips/TripCard';

export default async function TripsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null; // middleware already redirects; this is just a safety net

  const trips = await db.trip.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div style={{ maxWidth: 640, margin: '40px auto', padding: '0 16px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1>My trips</h1>
        <Link href="/plan">+ New trip</Link>
      </div>

      {trips.length === 0 && (
        <p>
          No trips yet. <Link href="/plan">Plan your first trip</Link>.
        </p>
      )}

      {trips.map((trip) => (
        <TripCard key={trip.id} trip={trip} />
      ))}
    </div>
  );
}
