import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { Calendar } from 'lucide-react';
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

  if (!trip || trip.userId !== session.user.id) notFound();

  if (trip.status === 'PLANNING') {
    return (
      <p className="max-w-2xl mx-auto mt-10 px-4 text-ink/70">
        Still planning this trip...
      </p>
    );
  }
  if (trip.status === 'FAILED') {
    return (
      <div className="max-w-2xl mx-auto mt-10 px-4">
        <p className="text-ink">
          This trip couldn&apos;t be planned
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
    <div className="max-w-2xl mx-auto mt-10 px-4 pb-16">
      <h1 className="text-3xl text-ink">
        {trip.destinationCity}, {trip.destinationCountry}
      </h1>
      <p className="text-ink/70 mt-1">
        {formatDate(trip.startDate)} – {formatDate(trip.endDate)} ·{' '}
        {trip.groupSize} traveler
        {trip.groupSize > 1 ? 's' : ''} · {trip.tripStyles.join(', ')}
      </p>

      <BudgetBreakdown trip={trip} />

      {chosenReasoning && (
        <div className="mt-6">
          <h3 className="text-lg text-ink mb-2">Why {trip.destinationCity}</h3>
          <p className="text-ink/80">{chosenReasoning}</p>
          {otherCandidates.length > 0 && (
            <p className="text-sm text-ink/50 mt-2">
              Also considered: {otherCandidates.map((c) => c.city).join(', ')}
            </p>
          )}
        </div>
      )}

      <div className="flex gap-4 mt-6">
        {trip.selectedFlight && (
          <FlightCard
            flight={trip.selectedFlight}
            originCity={trip.origin}
            originCode={trip.originCode}
            destinationCity={trip.destinationCity ?? ''}
            groupSize={trip.groupSize}
          />
        )}
        {trip.selectedHotel && (
          <HotelCard
            hotel={trip.selectedHotel}
            checkIn={trip.startDate}
            checkOut={trip.endDate}
          />
        )}
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={18} className="text-gold" />
          <h3 className="text-lg text-ink font-semibold">Itinerary</h3>
        </div>
        <DayTabs days={trip.itineraryDays} />
      </div>
    </div>
  );
}
