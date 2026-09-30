export interface CategoryBudgets {
  flightsBudget: number;
  stayBudget: number;
  foodBudget: number;
  activitiesBudget: number;
}

export interface PricedCandidate {
  airportCode: string;
  city: string;
  flightPrice: number | null; // null = no offer found
  hotelTotalPrice: number | null;
}

export interface FitResult {
  airportCode: string;
  city: string;
  flightPrice: number;
  hotelTotalPrice: number;
  remainingActivitiesFoodBudget: number; // what's left for food+activities combined
}

/**
 * A candidate "fits" only if both a flight and a hotel were found,
 * and each is within its own category budget on its own -- no
 * borrowing from other categories. Borrowing is a product decision,
 * not an accident: it keeps "budget per category" meaningful to the
 * user, since we asked them to split it that way on purpose.
 */
export function filterFittingCandidates(
  candidates: PricedCandidate[],
  budgets: CategoryBudgets
): FitResult[] {
  const fitting: FitResult[] = [];

  for (const c of candidates) {
    if (c.flightPrice == null || c.hotelTotalPrice == null) continue;
    if (c.flightPrice > budgets.flightsBudget) continue;
    if (c.hotelTotalPrice > budgets.stayBudget) continue;

    fitting.push({
      airportCode: c.airportCode,
      city: c.city,
      flightPrice: c.flightPrice,
      hotelTotalPrice: c.hotelTotalPrice,
      remainingActivitiesFoodBudget: budgets.foodBudget + budgets.activitiesBudget,
    });
  }

  return fitting;
}

export interface ItineraryCostSummary {
  activitiesTotal: number;
  foodTotal: number;
  grandTotal: number; // flights + hotel + activities + food
}

export function summarizeItineraryCost(
  flightPrice: number,
  hotelTotalPrice: number,
  items: { type: "ACTIVITY" | "FOOD"; estimatedCost: number }[]
): ItineraryCostSummary {
  const activitiesTotal = items
    .filter((i) => i.type === "ACTIVITY")
    .reduce((sum, i) => sum + i.estimatedCost, 0);
  const foodTotal = items
    .filter((i) => i.type === "FOOD")
    .reduce((sum, i) => sum + i.estimatedCost, 0);

  return {
    activitiesTotal,
    foodTotal,
    grandTotal: flightPrice + hotelTotalPrice + activitiesTotal + foodTotal,
  };
}

/**
 * When NO candidate fits, this picks the closest miss so the user
 * gets a useful message ("raise your stay budget by ~$40") instead
 * of a bare failure. "Closest" = smallest total overage across both
 * categories that failed.
 */
export function closestMiss(
  candidates: PricedCandidate[],
  budgets: CategoryBudgets
): { city: string; overBy: number; category: "flights" | "stay" | "both" } | null {
  let best: { city: string; overBy: number; category: "flights" | "stay" | "both" } | null = null;

  for (const c of candidates) {
    if (c.flightPrice == null || c.hotelTotalPrice == null) continue;

    const flightOver = Math.max(0, c.flightPrice - budgets.flightsBudget);
    const stayOver = Math.max(0, c.hotelTotalPrice - budgets.stayBudget);
    const overBy = flightOver + stayOver;

    if (overBy === 0) continue; // this one actually fits; not a miss

    const category = flightOver > 0 && stayOver > 0 ? "both" : flightOver > 0 ? "flights" : "stay";

    if (!best || overBy < best.overBy) {
      best = { city: c.city, overBy, category };
    }
  }

  return best;
}