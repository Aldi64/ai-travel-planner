import { Plane } from 'lucide-react';

interface FlightCardProps {
  flight: {
    carrier: string;
    price: number;
    departTime: Date;
    arriveTime: Date;
  };
  originCity: string;
  originCode: string;
  destinationCity: string;
  groupSize: number;
}

function formatDate(d: Date) {
  return new Date(d).toISOString().slice(0, 10);
}
function formatClock(d: Date) {
  return new Date(d).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export default function FlightCard({
  flight,
  originCity,
  originCode,
  destinationCity,
  groupSize,
}: FlightCardProps) {
  return (
    <div className="card-ticket flex-1">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-1.5 text-xs font-medium text-gold tracking-wide">
          <Plane size={14} />
          BOARDING PASS
        </div>
        {/* Reference image showed a flight number + cabin class -- neither
            exists in the Flight schema, so this shows the real carrier
            name instead rather than inventing data. */}
        <span className="text-xs text-ink/50">{flight.carrier}</span>
      </div>

      <div className="flex items-end gap-3 mb-1">
        <div>
          <div className="text-2xl font-bold text-ink data-text">
            {originCode}
          </div>
          <div className="text-xs text-ink/50">{originCity}</div>
        </div>
        <span className="text-ink/40 mb-4">→</span>
        <div>
          <div className="text-2xl font-bold text-ink">{destinationCity}</div>
          {/* No destination airport code is stored on Trip or Flight, so
              only the city name is shown here -- not a fabricated code. */}
        </div>
      </div>

      <hr className="perforated-divider" />

      <div className="grid grid-cols-3 gap-3 text-xs">
        <div>
          <div className="text-ink/50 mb-0.5">DATE</div>
          <div className="data-text text-ink">
            {formatDate(flight.departTime)}
          </div>
        </div>
        <div>
          <div className="text-ink/50 mb-0.5">DEPART</div>
          <div className="data-text text-ink">
            {formatClock(flight.departTime)}
          </div>
        </div>
        <div>
          <div className="text-ink/50 mb-0.5">ARRIVE</div>
          <div className="data-text text-ink">
            {formatClock(flight.arriveTime)}
          </div>
        </div>
      </div>

      <hr className="perforated-divider" />

      <div className="flex justify-between items-end">
        <div className="text-xs">
          <div className="text-ink/50 mb-0.5">PASSENGERS</div>
          <div className="text-ink">
            {groupSize} traveler{groupSize > 1 ? 's' : ''}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-ink/50 mb-0.5">TOTAL PRICE</div>
          <div className="data-text text-lg font-semibold text-gold">
            {flight.price}
          </div>
        </div>
      </div>
    </div>
  );
}
