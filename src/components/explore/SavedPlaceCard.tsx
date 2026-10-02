'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SavedPlaceCardProps {
  place: {
    id: string;
    name: string;
    description: string | null;
    address: string | null;
    city: string;
    category: string;
  };
}

export default function SavedPlaceCard({ place }: SavedPlaceCardProps) {
  const router = useRouter();
  const [removing, setRemoving] = useState(false);

  async function handleRemove() {
    setRemoving(true);
    await fetch(`/api/saved-places/${place.id}`, { method: 'DELETE' });
    router.refresh(); // re-runs the server component's data fetch below
  }

  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <strong>{place.name}</strong>{' '}
        <span style={{ color: '#888' }}>
          · {place.category} · {place.city}
        </span>
        {place.address && (
          <p style={{ color: '#666', margin: '4px 0' }}>{place.address}</p>
        )}
        {place.description && (
          <p style={{ margin: '4px 0' }}>{place.description}</p>
        )}
      </div>
      <button onClick={handleRemove} disabled={removing}>
        {removing ? 'Removing...' : 'Remove'}
      </button>
    </div>
  );
}
