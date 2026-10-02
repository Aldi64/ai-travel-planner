const apiKey = process.env.GEOAPIFY_API_KEY;

interface GeoapifyPlace {
  externalId: string;
  name: string;
  address: string | null;
  photoUrl: null; // Geoapify/OSM data doesn't reliably provide these -- see note above
  rating: null;
  lat: number;
  lon: number;
}

export async function geocodeCity(
  city: string,
): Promise<{ lat: number; lon: number } | null> {
  if (!apiKey) throw new Error('GEOAPIFY_API_KEY is not set');

  const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
    city,
  )}&type=city&format=json&apiKey=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geoapify geocoding failed: ${res.status}`);

  const data = await res.json();
  const first = data.results?.[0];
  if (!first) return null;
  return { lat: first.lat, lon: first.lon };
}

/**
 * categories: a comma-separated Geoapify category string, e.g.
 * "tourism.attraction" or "natural,leisure.park".
 */
export async function searchPlaces(
  categories: string,
  lat: number,
  lon: number,
  opts?: { radiusMeters?: number; limit?: number },
): Promise<GeoapifyPlace[]> {
  if (!apiKey) throw new Error('GEOAPIFY_API_KEY is not set');

  const radius = opts?.radiusMeters ?? 15000; // 15km -- covers most city centers
  const limit = opts?.limit ?? 15;

  const url = `https://api.geoapify.com/v2/places?categories=${encodeURIComponent(
    categories,
  )}&filter=circle:${lon},${lat},${radius}&limit=${limit}&apiKey=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geoapify places search failed: ${res.status}`);

  const data = await res.json();
  const features = data.features ?? [];

  return features.map((f: { properties: Record<string, unknown> }) => {
    const p = f.properties;
    return {
      externalId: String(p.place_id ?? ''),
      name:
        (p.name as string) || (p.address_line1 as string) || 'Unnamed place',
      address: (p.formatted as string) ?? null,
      photoUrl: null,
      rating: null,
      lat: p.lat as number,
      lon: p.lon as number,
    };
  });
}

// Category mapping for the three Geoapify-backed AreaCategory values.
export const GEOAPIFY_CATEGORY_MAP = {
  TOURIST_AREA: 'tourism.attraction',
  LANDMARK: 'tourism.sights',
  NATURE: 'natural,leisure.park',
} as const;
