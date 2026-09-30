import type { Candidate } from "../ai/schemas";
import type { PlanInput } from "../ai/types";
import type { FlightProvider, HotelProvider, FlightOffer, HotelOffer } from "../providers/types";
import { filterFittingCandidates, type FitResult, type PricedCandidate } from "../budget";
import type { EmitFn } from "./events";

export interface PriceAndFilterResult {
  fitting: FitResult[];
  offers: Map<string, { flight: FlightOffer; hotel: HotelOffer }>;
}

export async function priceAndFilter(
  candidates: Candidate[],
  input: PlanInput,
  deps: { flights: FlightProvider; hotels: HotelProvider },
  emit: EmitFn
): Promise<PriceAndFilterResult> {
  const settled = await Promise.allSettled(
    candidates.map(async (c) => {
      const [flight, hotel] = await Promise.all([
        deps.flights.searchCheapest({
          originCode: input.originCode,
          destinationCode: c.airportCode,
          departDate: input.startDate,
          returnDate: input.endDate,
          groupSize: input.groupSize,
          currency: input.currency,
        }),
        deps.hotels.searchCheapest({
          cityCode: c.cityCode,
          checkIn: input.startDate,
          checkOut: input.endDate,
          groupSize: input.groupSize,
          currency: input.currency,
        }),
      ]);
      emit({ type: "step", step: "prices", status: "completed", message: `${c.city}: checked` });
      return { candidate: c, flight, hotel };
    })
  );

  const priced: PricedCandidate[] = [];
  const offers = new Map<string, { flight: FlightOffer; hotel: HotelOffer }>();

  for (const r of settled) {
    if (r.status !== "fulfilled") continue; // one failed lookup just drops that candidate
    const { candidate, flight, hotel } = r.value;
    priced.push({
      airportCode: candidate.airportCode,
      city: candidate.city,
      flightPrice: flight?.price ?? null,
      hotelTotalPrice: hotel?.totalPrice ?? null,
    });
    if (flight && hotel) offers.set(candidate.airportCode, { flight, hotel });
  }

  const fitting = filterFittingCandidates(priced, {
    flightsBudget: input.flightsBudget,
    stayBudget: input.stayBudget,
    foodBudget: input.foodBudget,
    activitiesBudget: input.activitiesBudget,
  });

  return { fitting, offers };
}