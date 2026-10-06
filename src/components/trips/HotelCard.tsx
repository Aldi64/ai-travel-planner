import { BedDouble } from 'lucide-react';

interface HotelCardProps {
  hotel: {
    name: string;
    pricePerNight: number;
    totalPrice: number;
    rating: number | null;
    address: string | null;
  };
  checkIn: Date;
  checkOut: Date;
}

function formatDate(d: Date) {
  return new Date(d).toISOString().slice(0, 10);
}

export default function HotelCard({
  hotel,
  checkIn,
  checkOut,
}: HotelCardProps) {
  // Nights is derived from the trip's own dates -- Hotel doesn't store
  // check-in/out separately, but the trip's start/end ARE the stay dates
  // by design (that's what was passed to the hotel provider).
  const nights = Math.max(
    1,
    Math.round(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );

  return (
    <div className="card-ticket flex-1">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-1.5 text-xs font-medium text-gold tracking-wide">
          <BedDouble size={14} />
          HOTEL VOUCHER
        </div>
        <span className="text-xs text-ink/50">
          {nights} NIGHT{nights > 1 ? 'S' : ''}
        </span>
      </div>

      <div className="mb-1">
        <div className="text-lg font-bold text-ink">
          {hotel.name}
          {hotel.rating != null && (
            <span className="text-gold text-sm font-normal">
              {' '}
              · {hotel.rating}★
            </span>
          )}
        </div>
        {hotel.address && (
          <div className="text-xs text-ink/50 mt-0.5">{hotel.address}</div>
        )}
      </div>

      <hr className="perforated-divider" />

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <div className="text-ink/50 mb-0.5">CHECK IN</div>
          <div className="data-text text-ink">{formatDate(checkIn)}</div>
        </div>
        <div>
          <div className="text-ink/50 mb-0.5">CHECK OUT</div>
          <div className="data-text text-ink">{formatDate(checkOut)}</div>
        </div>
      </div>

      <hr className="perforated-divider" />

      <div className="flex justify-between items-end">
        <div className="text-xs text-ink/50">{hotel.pricePerNight}/night</div>
        <div className="text-right">
          <div className="text-xs text-ink/50 mb-0.5">TOTAL PRICE</div>
          <div className="data-text text-lg font-semibold text-gold">
            {hotel.totalPrice}
          </div>
        </div>
      </div>
    </div>
  );
}
