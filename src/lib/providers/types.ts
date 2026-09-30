export interface FlightOffer {
  carrier: string;
  price: number;
  departTime: string; // ISO datetime
  arriveTime: string; // ISO datetime
  bookingRef?: string;
}

export interface HotelOffer {
  name: string;
  pricePerNight: number;
  totalPrice: number;
  rating?: number;
  address?: string;
}

export interface FlightSearchParams {
  originCode: string;
  destinationCode: string;
  departDate: string; // "YYYY-MM-DD"
  returnDate: string; // "YYYY-MM-DD"
  groupSize: number;
  currency: string;
}

export interface HotelSearchParams {
  cityCode: string;
  checkIn: string; // "YYYY-MM-DD"
  checkOut: string; // "YYYY-MM-DD"
  groupSize: number;
  currency: string;
}

export interface FlightProvider {
  // Returns null when nothing is found for the route/dates, never throws for "no results".
  searchCheapest(params: FlightSearchParams): Promise<FlightOffer | null>;
}

export interface HotelProvider {
  searchCheapest(params: HotelSearchParams): Promise<HotelOffer | null>;
}