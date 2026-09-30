import type { HotelProvider, HotelSearchParams, HotelOffer } from "../types";

const BASE_NIGHTLY: Record<string, number> = {
  BKK: 35, DAD: 25, HAN: 28, SGN: 30, KUL: 40, SIN: 90,
  MNL: 32, DPS: 45, HKT: 38, ICN: 70, NRT: 85, HKG: 75,
};

function nightsBetween(checkIn: string, checkOut: string): number {
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
}

export const fakeHotelProvider: HotelProvider = {
  async searchCheapest(params: HotelSearchParams): Promise<HotelOffer | null> {
    const base = BASE_NIGHTLY[params.cityCode] ?? 60;
    const pricePerNight = Math.round(base * (0.9 + Math.random() * 0.4));
    const nights = nightsBetween(params.checkIn, params.checkOut);

    return {
      name: "Fake Central Hotel",
      pricePerNight,
      totalPrice: pricePerNight * nights,
      rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
      address: "123 Placeholder St",
    };
  },
};