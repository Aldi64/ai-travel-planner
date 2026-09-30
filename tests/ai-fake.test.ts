import { describe, it, expect } from "vitest";
import { fakeAiPlanner } from "../src/lib/ai/fake";
import type { PlanInput, Place } from "../src/lib/ai/types";
import type { FitResult } from "../src/lib/budget";

const input: PlanInput = {
  originCode: "CGK",
  originCity: "Jakarta",
  startDate: "2026-12-12",
  endDate: "2026-12-17",
  numberOfDays: 5,
  groupSize: 2,
  tripStyles: ["adventure", "cultural"],
  currency: "USD",
  flightsBudget: 400,
  stayBudget: 500,
  foodBudget: 250,
  activitiesBudget: 200,
};

describe("fakeAiPlanner.suggestCandidates", () => {
  it("returns exactly 3 candidates, excluding the origin", async () => {
    const result = await fakeAiPlanner.suggestCandidates(input);
    expect(result).toHaveLength(3);
    expect(result.every((c) => c.airportCode !== input.originCode)).toBe(true);
  });

  it("excludes candidates passed in opts.exclude", async () => {
    const first = await fakeAiPlanner.suggestCandidates(input);
    const second = await fakeAiPlanner.suggestCandidates(input, { exclude: first });
    const firstCodes = new Set(first.map((c) => c.airportCode));
    expect(second.some((c) => firstCodes.has(c.airportCode))).toBe(false);
  });
});

describe("fakeAiPlanner.selectDestination", () => {
  it("picks one of the priced candidates", async () => {
    const priced: FitResult[] = [
      { airportCode: "DAD", city: "Da Nang", flightPrice: 372, hotelTotalPrice: 460, remainingActivitiesFoodBudget: 450 },
    ];
    const result = await fakeAiPlanner.selectDestination(priced, input);
    expect(result.selectedAirportCode).toBe("DAD");
  });
});

describe("fakeAiPlanner.buildItinerary", () => {
  const chosen: FitResult = {
    airportCode: "DAD",
    city: "Da Nang",
    flightPrice: 372,
    hotelTotalPrice: 460,
    remainingActivitiesFoodBudget: 450,
  };
  const places: Place[] = [
    { id: "p1", name: "Marble Mountains", type: "ACTIVITY" },
    { id: "p2", name: "My Khe Beach", type: "ACTIVITY" },
    { id: "p3", name: "Local Lunch Spot", type: "FOOD" },
    { id: "p4", name: "Seafood Dinner", type: "FOOD" },
  ];

  it("returns exactly numberOfDays days", async () => {
    const result = await fakeAiPlanner.buildItinerary(chosen, places, input);
    expect(result.days).toHaveLength(input.numberOfDays);
  });

  it("only uses placeIds from the given places list", async () => {
    const result = await fakeAiPlanner.buildItinerary(chosen, places, input);
    const validIds = new Set(places.map((p) => p.id));
    for (const day of result.days) {
      for (const item of day.items) {
        expect(validIds.has(item.placeId)).toBe(true);
      }
    }
  });

  it("stays within the activities and food budgets", async () => {
    const result = await fakeAiPlanner.buildItinerary(chosen, places, input);
    let activitiesTotal = 0;
    let foodTotal = 0;
    for (const day of result.days) {
      for (const item of day.items) {
        if (item.type === "ACTIVITY") activitiesTotal += item.estimatedCost;
        else foodTotal += item.estimatedCost;
      }
    }
    expect(activitiesTotal).toBeLessThanOrEqual(input.activitiesBudget);
    expect(foodTotal).toBeLessThanOrEqual(input.foodBudget);
  });
});