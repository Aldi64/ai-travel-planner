import { describe, it, expect } from "vitest";
import { filterFittingCandidates, summarizeItineraryCost, closestMiss } from "../src/lib/budget";

const budgets = { flightsBudget: 400, stayBudget: 500, foodBudget: 250, activitiesBudget: 200 };

describe("filterFittingCandidates", () => {
  it("keeps a candidate within both budgets", () => {
    const result = filterFittingCandidates(
      [{ airportCode: "DAD", city: "Da Nang", flightPrice: 372, hotelTotalPrice: 460 }],
      budgets
    );
    expect(result).toHaveLength(1);
    expect(result[0].remainingActivitiesFoodBudget).toBe(450);
  });

  it("drops a candidate over the flight budget", () => {
    const result = filterFittingCandidates(
      [{ airportCode: "NRT", city: "Tokyo", flightPrice: 900, hotelTotalPrice: 460 }],
      budgets
    );
    expect(result).toHaveLength(0);
  });

  it("drops a candidate over the stay budget even if flight fits", () => {
    const result = filterFittingCandidates(
      [{ airportCode: "SIN", city: "Singapore", flightPrice: 300, hotelTotalPrice: 900 }],
      budgets
    );
    expect(result).toHaveLength(0);
  });

  it("does not let a cheap flight offset an expensive hotel", () => {
    // 100 under flight budget, but stay is 200 over -- must NOT fit
    const result = filterFittingCandidates(
      [{ airportCode: "SIN", city: "Singapore", flightPrice: 300, hotelTotalPrice: 700 }],
      budgets
    );
    expect(result).toHaveLength(0);
  });

  it("drops a candidate with no flight or hotel offer", () => {
    const result = filterFittingCandidates(
      [{ airportCode: "XXX", city: "Nowhere", flightPrice: null, hotelTotalPrice: 100 }],
      budgets
    );
    expect(result).toHaveLength(0);
  });
});

describe("summarizeItineraryCost", () => {
  it("sums activities and food separately and combines everything", () => {
    const items = [
      { type: "ACTIVITY" as const, estimatedCost: 20 },
      { type: "ACTIVITY" as const, estimatedCost: 15 },
      { type: "FOOD" as const, estimatedCost: 30 },
    ];
    const summary = summarizeItineraryCost(372, 460, items);
    expect(summary.activitiesTotal).toBe(35);
    expect(summary.foodTotal).toBe(30);
    expect(summary.grandTotal).toBe(372 + 460 + 35 + 30);
  });

  it("returns zeros for an empty itinerary", () => {
    const summary = summarizeItineraryCost(100, 200, []);
    expect(summary).toEqual({ activitiesTotal: 0, foodTotal: 0, grandTotal: 300 });
  });
});

describe("closestMiss", () => {
  it("returns null when a candidate actually fits", () => {
    const miss = closestMiss(
      [{ airportCode: "DAD", city: "Da Nang", flightPrice: 372, hotelTotalPrice: 460 }],
      budgets
    );
    expect(miss).toBeNull();
  });

  it("picks the smallest overage among several misses", () => {
    const miss = closestMiss(
      [
        { airportCode: "NRT", city: "Tokyo", flightPrice: 900, hotelTotalPrice: 460 }, // over by 500
        { airportCode: "SIN", city: "Singapore", flightPrice: 420, hotelTotalPrice: 520 }, // over by 40
      ],
      budgets
    );
    expect(miss?.city).toBe("Singapore");
    expect(miss?.overBy).toBe(40);
    expect(miss?.category).toBe("both");
  });

  it("labels the category correctly when only one budget is exceeded", () => {
    const miss = closestMiss(
      [{ airportCode: "SIN", city: "Singapore", flightPrice: 380, hotelTotalPrice: 520 }],
      budgets
    );
    expect(miss?.category).toBe("stay");
  });
});