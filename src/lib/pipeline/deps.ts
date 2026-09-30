import { db } from "../db";
import { aiPlanner } from "../ai";
import { flightProvider, hotelProvider } from "../providers";
import { placesProvider } from "../places";
import type { PlanTripDeps } from "./planTrip";

export const realDeps: PlanTripDeps = {
  ai: aiPlanner,
  flights: flightProvider,
  hotels: hotelProvider,
  places: placesProvider,
  db,
};