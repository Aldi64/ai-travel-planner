interface HotelCardProps {
  hotel: {
    name: string;
    pricePerNight: number;
    totalPrice: number;
    rating: number | null;
    address: string | null;
  };
}

export default function HotelCard({ hotel }: HotelCardProps) {
  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: 8,
        padding: 12,
        flex: 1,
      }}
    >
      <h4>Hotel</h4>
      <p>
        {hotel.name} {hotel.rating && `· ${hotel.rating}★`}
      </p>
      <p>{hotel.address}</p>
      <p>
        {hotel.pricePerNight}/night · {hotel.totalPrice} total
      </p>
    </div>
  );
}
