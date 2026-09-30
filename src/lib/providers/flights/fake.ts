import type { FlightProvider, FlightSearchParams, FlightOffer } from "../types";

// Rough one-way base fares in USD, used only to make fake results feel plausible.
const BASE_FARES: Record<string, number> = {
  BKK: 180, DAD: 150, HAN: 170, SGN: 160, KUL: 160, SIN: 220,
  MNL: 190, DPS: 90, HKT: 140, ICN: 260, NRT: 300, HKG: 210,
};

export const fakeFlightProvider: FlightProvider = {
  async searchCheapest(params: FlightSearchParams): Promise<FlightOffer | null> {
    const base = BASE_FARES[params.destinationCode] ?? 350;
    const perPerson = Math.round(base * (0.85 + Math.random() * 0.3));
    const price = perPerson * params.groupSize;

    const departTime = new Date(`${params.departDate}T08:00:00Z`);
    const arriveTime = new Date(departTime.getTime() + 3 * 60 * 60 * 1000);

    return {
      carrier: "FakeAir",
      price,
      departTime: departTime.toISOString(),
      arriveTime: arriveTime.toISOString(),
      bookingRef: `FAKE-${params.originCode}-${params.destinationCode}`,
    };
  },
};