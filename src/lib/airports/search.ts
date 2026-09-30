import airports from "./airports.json";

export interface Airport {
  code: string;
  city: string;
  country: string;
  name: string;
}

export function searchAirports(query: string, limit = 8): Airport[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  return (airports as Airport[])
    .filter(
      (a) =>
        a.city.toLowerCase().includes(q) ||
        a.code.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q)
    )
    .slice(0, limit);
}