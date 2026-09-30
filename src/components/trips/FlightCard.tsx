interface FlightCardProps {
  flight: {
    carrier: string;
    price: number;
    departTime: Date;
    arriveTime: Date;
  };
}

function formatTime(d: Date) {
  return new Date(d).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function FlightCard({ flight }: FlightCardProps) {
  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: 8,
        padding: 12,
        flex: 1,
      }}
    >
      <h4>Flight</h4>
      <p>{flight.carrier}</p>
      <p>
        {formatTime(flight.departTime)} → {formatTime(flight.arriveTime)}
      </p>
      <p>{flight.price}</p>
    </div>
  );
}
