import Link from 'next/link';

interface TripCardProps {
  trip: {
    id: string;
    destinationCity: string | null;
    destinationCountry: string | null;
    startDate: Date;
    endDate: Date;
    status: string;
    totalEstimatedCost: number | null;
    currency: string;
    tripStyles: string[];
    groupSize: number;
  };
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export default function TripCard({ trip }: TripCardProps) {
  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: 8,
        padding: 16,
        marginTop: 12,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <strong>
          {trip.destinationCity
            ? `${trip.destinationCity}, ${trip.destinationCountry}`
            : '(no destination)'}
        </strong>
        <span>{trip.status}</span>
      </div>
      <p style={{ color: '#666', margin: '4px 0' }}>
        {formatDate(trip.startDate)} - {formatDate(trip.endDate)} ·{' '}
        {trip.groupSize} traveler
        {trip.groupSize > 1 ? 's' : ''}
        {trip.tripStyles.length > 0 && ` · ${trip.tripStyles.join(', ')}`}
      </p>
      {trip.totalEstimatedCost != null && (
        <p>
          {Math.round(trip.totalEstimatedCost)} {trip.currency}
        </p>
      )}
      {trip.status === 'COMPLETED' && (
        <Link href={`/trips/${trip.id}`}>View trip →</Link>
      )}
      {trip.status === 'FAILED' && (
        <Link href="/plan">Retry with new inputs →</Link>
      )}
      {trip.status === 'PLANNING' && <span>Still planning...</span>}
    </div>
  );
}
