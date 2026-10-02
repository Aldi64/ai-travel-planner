import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  geocodeCity,
  searchPlaces,
  GEOAPIFY_CATEGORY_MAP,
} from '@/lib/explore/geoapify';
import {
  getFoodRecommendations,
  getTransportationSummary,
} from '@/lib/explore/ai';
import { checkRateLimit } from '@/lib/rateLimit';

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

type Category =
  'TOURIST_AREA' | 'LANDMARK' | 'NATURE' | 'FOOD' | 'TRANSPORTATION';

async function getOrFetch<T>(
  city: string,
  category: Category,
  fetcher: () => Promise<T>,
): Promise<T> {
  const cached = await db.areaSearchCache.findUnique({
    where: { city_category: { city, category } },
  });

  if (cached && Date.now() - cached.fetchedAt.getTime() < CACHE_TTL_MS) {
    return cached.data as T;
  }

  const fresh = await fetcher();

  await db.areaSearchCache.upsert({
    where: { city_category: { city, category } },
    update: { data: fresh as object, fetchedAt: new Date() },
    create: { city, category, data: fresh as object },
  });

  return fresh;
}

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const city = request.nextUrl.searchParams.get('city')?.trim();
  if (!city) {
    return NextResponse.json(
      { error: 'city query param is required' },
      { status: 400 },
    );
  }

  const rate = checkRateLimit(`explore:${session.user.id}`, 20);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Too many searches today. Try again tomorrow.' },
      { status: 429 },
    );
  }

  // Geocode at most once per request, even though up to 3 categories need it --
  // memoized so three parallel calls below share one geocoding lookup.
  let coordsPromise: ReturnType<typeof geocodeCity> | null = null;
  const getCoords = () => (coordsPromise ??= geocodeCity(city));

  try {
    const [touristAreas, landmarks, nature, food, transportation] =
      await Promise.all([
        getOrFetch(city, 'TOURIST_AREA', async () => {
          const coords = await getCoords();
          return coords
            ? searchPlaces(
                GEOAPIFY_CATEGORY_MAP.TOURIST_AREA,
                coords.lat,
                coords.lon,
              )
            : [];
        }),
        getOrFetch(city, 'LANDMARK', async () => {
          const coords = await getCoords();
          return coords
            ? searchPlaces(
                GEOAPIFY_CATEGORY_MAP.LANDMARK,
                coords.lat,
                coords.lon,
              )
            : [];
        }),
        getOrFetch(city, 'NATURE', async () => {
          const coords = await getCoords();
          return coords
            ? searchPlaces(GEOAPIFY_CATEGORY_MAP.NATURE, coords.lat, coords.lon)
            : [];
        }),
        getOrFetch(city, 'FOOD', () => getFoodRecommendations(city)),
        getOrFetch(city, 'TRANSPORTATION', () =>
          getTransportationSummary(city),
        ),
      ]);

    return NextResponse.json({
      city,
      touristAreas,
      landmarks,
      nature,
      food,
      transportation,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Something went wrong fetching results for that city.' },
      { status: 502 },
    );
  }
}
