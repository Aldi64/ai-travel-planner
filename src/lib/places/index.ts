import { fakePlaceProvider } from "./fake";
import type { PlaceProvider } from "./types";

const useFake = process.env.USE_FAKE_PLACES !== "false";

export const placesProvider: PlaceProvider = useFake ? fakePlaceProvider : fakePlaceProvider;