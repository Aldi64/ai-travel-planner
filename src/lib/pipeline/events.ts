export type PlanEvent =
  | {
      type: "step";
      step: "candidates" | "prices" | "selection" | "places" | "itinerary";
      status: "started" | "completed";
      message: string;
    }
  | { type: "done"; tripId: string }
  | { type: "error"; message: string };

export type EmitFn = (event: PlanEvent) => void;