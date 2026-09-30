import type { AiPlanner } from "./planner";
import type { Candidate, Selection, ItineraryResponse } from "./schemas";
import type { PlanInput, Place } from "./types";
import type { FitResult } from "../budget";
import airports from "../airports/airports.json";

interface AirportEntry {
  code: string;
  city: string;
  country: string;
  name: string;
}

export const fakeAiPlanner: AiPlanner = {
  async suggestCandidates(input, opts) {
    const excludedCodes = new Set((opts?.exclude ?? []).map((c) => c.airportCode));
    excludedCodes.add(input.originCode);

    const pool = (airports as AirportEntry[]).filter((a) => !excludedCodes.has(a.code));
    const picked = pool.slice(0, 3);

    const styleText = input.tripStyles.join(" and ") || "general";

    return picked.map(
      (a): Candidate => ({
        city: a.city,
        country: a.country,
        airportCode: a.code,
        cityCode: a.code, // fake dataset has no separate city code
        reasoning: `${a.city} is a plausible fit for a ${styleText} trip within the stated budget (fake data, no real cost basis).`,
      })
    );
  },

  async selectDestination(pricedCandidates: FitResult[], _input: PlanInput): Promise<Selection> {
    const pick = pricedCandidates[0];
    return {
      selectedAirportCode: pick.airportCode,
      reasoning: `${pick.city} had the lowest combined flight and hotel cost among the candidates that fit the budget (fake selection logic).`,
    };
  },

  async buildItinerary(
    chosen: FitResult,
    places: Place[],
    input: PlanInput
  ): Promise<ItineraryResponse> {
    const activities = places.filter((p) => p.type === "ACTIVITY");
    const food = places.filter((p) => p.type === "FOOD");

    // Leave a 10% margin under budget so the fake output always passes
    // validateItinerary even with small place lists.
    const perActivity =
      activities.length > 0 ? (input.activitiesBudget * 0.9) / Math.max(activities.length, input.numberOfDays * 1) : 0;
    const perFood =
      food.length > 0 ? (input.foodBudget * 0.9) / Math.max(food.length, input.numberOfDays * 2) : 0;

    const days = [];
    for (let day = 1; day <= input.numberOfDays; day++) {
      const dayActivity = activities[(day - 1) % Math.max(activities.length, 1)];
      const dayFoodLunch = food[(2 * (day - 1)) % Math.max(food.length, 1)];
      const dayFoodDinner = food[(2 * (day - 1) + 1) % Math.max(food.length, 1)];

      const items = [];
      if (dayActivity) {
        items.push({
          type: "ACTIVITY" as const,
          placeId: dayActivity.id,
          name: dayActivity.name,
          description: `Visit ${dayActivity.name} (fake itinerary data).`,
          startTime: "09:00",
          estimatedCost: Math.round(perActivity),
        });
      }
      if (dayFoodLunch) {
        items.push({
          type: "FOOD" as const,
          placeId: dayFoodLunch.id,
          name: dayFoodLunch.name,
          description: `Lunch at ${dayFoodLunch.name} (fake itinerary data).`,
          startTime: "12:30",
          estimatedCost: Math.round(perFood),
        });
      }
      if (dayFoodDinner) {
        items.push({
          type: "FOOD" as const,
          placeId: dayFoodDinner.id,
          name: dayFoodDinner.name,
          description: `Dinner at ${dayFoodDinner.name} (fake itinerary data).`,
          startTime: "19:00",
          estimatedCost: Math.round(perFood),
        });
      }

      // Every day needs at least 2 items per the schema; pad with a
      // repeated activity slot if the fake place list is too short.
      while (items.length < 2 && activities.length > 0) {
        items.push({
          type: "ACTIVITY" as const,
          placeId: activities[0].id,
          name: activities[0].name,
          description: `Free time near ${activities[0].name} (fake itinerary data).`,
          startTime: "15:00",
          estimatedCost: 0,
        });
      }

      days.push({ dayNumber: day, items });
    }

    return { days };
  },
};