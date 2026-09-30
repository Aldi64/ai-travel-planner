interface ItineraryItemRowProps {
  item: {
    type: string;
    name: string;
    description: string | null;
    startTime: string | null;
    estimatedCost: number;
  };
}

export default function ItineraryItemRow({ item }: ItineraryItemRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        padding: '8px 0',
        borderBottom: '1px solid #eee',
      }}
    >
      <span style={{ width: 56, color: '#888' }}>{item.startTime}</span>
      <span style={{ width: 70, fontWeight: 600 }}>{item.type}</span>
      <div style={{ flex: 1 }}>
        <div>{item.name}</div>
        {item.description && (
          <div style={{ color: '#888', fontSize: 14 }}>{item.description}</div>
        )}
      </div>
      <span>{item.estimatedCost}</span>
    </div>
  );
}
