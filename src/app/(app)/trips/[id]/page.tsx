import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import type { Candidate } from '@/lib/ai/schemas';
import BudgetBreakdown from '@/components/trips/BudgetBreakdown';
import FlightCard from '@/components/trips/FlightCard';
import HotelCard from '@/components/trips/HotelCard';
import DayTabs from '@/components/trips/DayTabs';

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

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

  // Same "not found" for a missing trip and someone else's trip -- matches
  // the API route's behavior from step 7, don't leak which one it is.
  if (!trip || trip.userId !== session.user.id) notFound();

  if (trip.status === 'PLANNING') {
    return (
      <p style={{ maxWidth: 640, margin: '40px auto', padding: '0 16px' }}>
        Still planning this trip...
      </p>
    );
  }
  if (trip.status === 'FAILED') {
    return (
      <div style={{ maxWidth: 640, margin: '40px auto', padding: '0 16px' }}>
        <p>
          This trip couldn't be planned
          {trip.failureReason ? ` (${trip.failureReason})` : ''}.
        </p>
      </div>
    );
  }

  const candidates = (trip.candidates as Candidate[] | null) ?? [];
  const otherCandidates = candidates.filter(
    (c) => c.city !== trip.destinationCity,
  );
  const chosenReasoning = candidates.find(
    (c) => c.city === trip.destinationCity,
  )?.reasoning;

  return (
    <div style={{ maxWidth: 640, margin: '40px auto', padding: '0 16px' }}>
      <h1>
        {trip.destinationCity}, {trip.destinationCountry}
      </h1>
      <p style={{ color: '#666' }}>
        {formatDate(trip.startDate)} - {formatDate(trip.endDate)} ·{' '}
        {trip.groupSize} traveler
        {trip.groupSize > 1 ? 's' : ''} · {trip.tripStyles.join(', ')}
      </p>

      <BudgetBreakdown trip={trip} />

      {chosenReasoning && (
        <div style={{ marginTop: 16 }}>
          <h3>Why {trip.destinationCity}</h3>
          <p>{chosenReasoning}</p>
          {otherCandidates.length > 0 && (
            <p style={{ color: '#888' }}>
              Also considered: {otherCandidates.map((c) => c.city).join(', ')}
            </p>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
        {trip.selectedFlight && <FlightCard flight={trip.selectedFlight} />}
        {trip.selectedHotel && <HotelCard hotel={trip.selectedHotel} />}
      </div>

      <div style={{ marginTop: 24 }}>
        <h3>Itinerary</h3>
        <DayTabs days={trip.itineraryDays} />
      </div>
    </div>
  );
}
