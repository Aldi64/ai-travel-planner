import type { Place } from "../ai/types";

export interface PlaceProvider {
  search(city: string, styles: string[]): Promise<Place[]>;
}

export type { Place };