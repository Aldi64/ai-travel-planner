import { z } from "zod";


export const CandidateSchema = z.object({
  city: z.string().min(1),
  country: z.string().min(1),
  airportCode: z.string().length(3).toUpperCase(),
  cityCode: z.string().length(3).toUpperCase(),
  reasoning: z.string().min(10).max(400),
});
export type Candidate = z.infer<typeof CandidateSchema>;

export const CandidatesResponseSchema = z.object({
  candidates: z.array(CandidateSchema).length(3),
});

export const SelectionResponseSchema = z.object({
  selectedAirportCode: z.string().length(3).toUpperCase(),
  reasoning: z.string().min(10).max(600),
});
export type Selection = z.infer<typeof SelectionResponseSchema>;

export const ItineraryItemSchema = z.object({
  type: z.enum(["ACTIVITY", "FOOD"]),
  placeId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().max(300),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  estimatedCost: z.number().min(0),
});

export const ItineraryDaySchema = z.object({
  dayNumber: z.number().int().min(1),
  items: z.array(ItineraryItemSchema).min(2).max(8),
});

export const ItineraryResponseSchema = z.object({
  days: z.array(ItineraryDaySchema).min(1),
});
export type ItineraryResponse = z.infer<typeof ItineraryResponseSchema>;

export function validateSelection(
  sel: Selection,
  pricedCandidates: { airportCode: string }[]
) {
  const ok = pricedCandidates.some((c) => c.airportCode === sel.selectedAirportCode);
  if (!ok) throw new Error("Selected destination was not among priced candidates");
}

export function validateItinerary(
  itin: ItineraryResponse,
  ctx: {
    numberOfDays: number;
    validPlaceIds: Set<string>;
    activitiesBudget: number;
    foodBudget: number;
  }
) {
  if (itin.days.length !== ctx.numberOfDays) {
    throw new Error(`Expected ${ctx.numberOfDays} days, got ${itin.days.length}`);
  }

  let activities = 0;
  let food = 0;

  for (const day of itin.days) {
    for (const item of day.items) {
      if (!ctx.validPlaceIds.has(item.placeId)) {
        throw new Error(`Unknown placeId: ${item.placeId}`);
      }
      if (item.type === "ACTIVITY") activities += item.estimatedCost;
      else food += item.estimatedCost;
    }
  }

  if (activities > ctx.activitiesBudget) {
    throw new Error(`Activities total ${activities} exceeds budget ${ctx.activitiesBudget}`);
  }
  if (food > ctx.foodBudget) {
    throw new Error(`Food total ${food} exceeds budget ${ctx.foodBudget}`);
  }
}