import { fakeFlightProvider } from "./flights/fake";
import { fakeHotelProvider } from "./hotels/fake";
import type { FlightProvider, HotelProvider } from "./types";

// Real providers get added here later, e.g.:
// import { travelpayoutsFlightProvider } from "./flights/travelpayouts";
const useFake = process.env.USE_FAKE_PROVIDERS !== "false";

export const flightProvider: FlightProvider = useFake
  ? fakeFlightProvider
  : fakeFlightProvider; // swap once a real provider exists

export const hotelProvider: HotelProvider = useFake
  ? fakeHotelProvider
  : fakeHotelProvider; // swap once a real provider exists