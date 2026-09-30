import type { Candidate, Selection, ItineraryResponse } from "./schemas";
import type { PlanInput, Place } from "./types";
import type { FitResult } from "../budget";

export interface AiPlanner {
  suggestCandidates(
    input: PlanInput,
    opts?: { exclude?: Candidate[]; cheaper?: boolean }
  ): Promise<Candidate[]>;

  selectDestination(pricedCandidates: FitResult[], input: PlanInput): Promise<Selection>;

  buildItinerary(
    chosen: FitResult,
    places: Place[],
    input: PlanInput
  ): Promise<ItineraryResponse>;
}