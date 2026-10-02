'use client';

import { useState, useEffect } from 'react';
import PlaceCard from '@/components/explore/PlaceCard';
import TransportationSummary from '@/components/explore/TransportationSummary';

interface GeoPlace {
  externalId: string;
  name: string;
  address: string | null;
}
interface FoodItem {
  name: string;
  description: string;
  area: string;
}
interface TransportData {
  overview: string;
  options: { mode: string; description: string; tip?: string }[];
  generalTips: string[];
}
interface ExploreData {
  city: string;
  touristAreas: GeoPlace[];
  landmarks: GeoPlace[];
  nature: GeoPlace[];
  food: FoodItem[];
  transportation: TransportData;
}

export default function ExplorePage() {
  const [city, setCity] = useState('');
  const [data, setData] = useState<ExploreData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/saved-places')
      .then((res) => res.json())
      .then((json) => {
        const keys = (json.savedPlaces ?? []).map(
          (p: { category: string; name: string; city: string }) =>
            `${p.category}:${p.name}:${p.city}`,
        );
        setSavedKeys(new Set(keys));
      })
      .catch(() => {});
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!city.trim()) return;
    setLoading(true);
    setError(null);

    const res = await fetch(
      `/api/explore?city=${encodeURIComponent(city.trim())}`,
    );
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? 'Something went wrong.');
      setLoading(false);
      return;
    }
    setData(await res.json());
    setLoading(false);
  }

  async function toggleSave(
    category: string,
    place: {
      name: string;
      description?: string | null;
      address?: string | null;
      externalId?: string | null;
    },
    source: 'geoapify' | 'ai',
  ) {
    if (!data) return;
    const key = `${category}:${place.name}:${data.city}`;
    if (savedKeys.has(key)) return;

    await fetch('/api/saved-places', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category,
        source,
        externalId: place.externalId ?? null,
        name: place.name,
        description: place.description ?? null,
        address: place.address ?? null,
        city: data.city,
      }),
    });
    setSavedKeys((prev) => new Set(prev).add(key));
  }

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', padding: '0 16px' }}>
      <h1>Explore</h1>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Search a city, e.g. Jakarta"
          style={{ flex: 1, padding: 8 }}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {data && (
        <div style={{ marginTop: 24 }}>
          <Section title="Tourist areas">
            {data.touristAreas.map((p) => (
              <PlaceCard
                key={p.externalId}
                name={p.name}
                address={p.address}
                saved={savedKeys.has(`TOURIST_AREA:${p.name}:${data.city}`)}
                onSave={() => toggleSave('TOURIST_AREA', p, 'geoapify')}
              />
            ))}
          </Section>

          <Section title="Landmarks">
            {data.landmarks.map((p) => (
              <PlaceCard
                key={p.externalId}
                name={p.name}
                address={p.address}
                saved={savedKeys.has(`LANDMARK:${p.name}:${data.city}`)}
                onSave={() => toggleSave('LANDMARK', p, 'geoapify')}
              />
            ))}
          </Section>

          <Section title="Nature areas">
            {data.nature.map((p) => (
              <PlaceCard
                key={p.externalId}
                name={p.name}
                address={p.address}
                saved={savedKeys.has(`NATURE:${p.name}:${data.city}`)}
                onSave={() => toggleSave('NATURE', p, 'geoapify')}
              />
            ))}
          </Section>

          <Section title="Popular eats">
            {data.food.map((item) => (
              <PlaceCard
                key={item.name}
                name={item.name}
                description={item.description}
                address={item.area}
                saved={savedKeys.has(`FOOD:${item.name}:${data.city}`)}
                onSave={() =>
                  toggleSave(
                    'FOOD',
                    {
                      name: item.name,
                      description: item.description,
                      address: item.area,
                    },
                    'ai',
                  )
                }
              />
            ))}
          </Section>

          <Section title="Getting around">
            <TransportationSummary data={data.transportation} />
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2>{title}</h2>
      {children}
    </div>
  );
}
