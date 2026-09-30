export interface PlanInput {
  originCode: string;
  originCity: string;
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
  numberOfDays: number;
  groupSize: number;
  tripStyles: string[];
  currency: string;
  flightsBudget: number;
  stayBudget: number;
  foodBudget: number;
  activitiesBudget: number;
}

export interface Place {
  id: string;
  name: string;
  type: "ACTIVITY" | "FOOD";
  priceLevel?: number; // rough 1-4 indicator, provider-dependent
}