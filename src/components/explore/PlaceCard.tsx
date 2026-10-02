interface PlaceCardProps {
  name: string;
  description?: string | null;
  address?: string | null;
  rating?: number | null;
  saved: boolean;
  onSave: () => void;
}

export default function PlaceCard({
  name,
  description,
  address,
  rating,
  saved,
  onSave,
}: PlaceCardProps) {
  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12,
      }}
    >
      <div>
        <strong>{name}</strong>
        {rating != null && <span> · {rating}★</span>}
        {address && <p style={{ color: '#666', margin: '4px 0' }}>{address}</p>}
        {description && <p style={{ margin: '4px 0' }}>{description}</p>}
      </div>
      <button onClick={onSave} disabled={saved}>
        {saved ? 'Saved' : 'Save'}
      </button>
    </div>
  );
}
