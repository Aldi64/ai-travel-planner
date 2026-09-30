import type { PlaceProvider, Place } from "./types";

const ACTIVITY_TEMPLATES = [
  "Old Town Walking Tour", "Local Market Visit", "Waterfront Park",
  "Historic Temple", "Viewpoint Hike", "Museum of Local History",
  "Bike Tour", "Cooking Class",
];
const FOOD_TEMPLATES = [
  "Riverside Café", "Night Market Food Stalls", "Family-Run Noodle House",
  "Rooftop Restaurant", "Street Food Corner", "Local Seafood Grill",
];

export const fakePlaceProvider: PlaceProvider = {
  async search(city: string, styles: string[]): Promise<Place[]> {
    const styleTag = styles[0] ?? "general";

    const activities: Place[] = ACTIVITY_TEMPLATES.map((t, i) => ({
      id: `${city.toLowerCase().replace(/\s+/g, "-")}-act-${i + 1}`,
      name: `${t} — ${city}`,
      type: "ACTIVITY" as const,
      priceLevel: (i % 4) + 1,
    }));

    const food: Place[] = FOOD_TEMPLATES.map((t, i) => ({
      id: `${city.toLowerCase().replace(/\s+/g, "-")}-food-${i + 1}`,
      name: `${t} — ${city}`,
      type: "FOOD" as const,
      priceLevel: (i % 3) + 1,
    }));

    void styleTag; // real providers would use `styles` to filter/rank results
    return [...activities, ...food];
  },
};