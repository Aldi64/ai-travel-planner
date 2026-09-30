import type { PrismaClient } from '../../generated/prisma/client';
import type { AiPlanner } from '../ai/planner';
import type { PlanInput } from '../ai/types';
import type { FlightProvider, HotelProvider } from '../providers/types';
import type { PlaceProvider } from '../places/types';
import { validateSelection, validateItinerary } from '../ai/schemas';
import { PipelineError } from '../errors';
import type { EmitFn } from './events';
import { priceAndFilter } from './priceAndFilter';
import { saveCompletedTrip } from './saveTrip';
import { closestMiss } from '../budget';

export interface PlanTripDeps {
  ai: AiPlanner;
  flights: FlightProvider;
  hotels: HotelProvider;
  places: PlaceProvider;
  db: PrismaClient;
}

function noFitMessage(
  input: PlanInput,
  deps: { city: string; overBy: number; category: string } | null,
): string {
  if (!deps) {
    return 'No destination fit your budget. Try raising your flights or stay budget.';
  }
  return `The closest option was ${deps.city}, over budget by about ${Math.round(deps.overBy)} ${input.currency} on ${deps.category}. Try raising that category's budget.`;
}

export async function planTrip(
  tripId: string,
  input: PlanInput,
  emit: EmitFn,
  deps: PlanTripDeps,
): Promise<void> {
  const safeEmit: EmitFn = (event) => {
    try {
      emit(event);
    } catch {
      // client disconnected; keep running so the trip still gets saved
    }
  };
  const step = (
    s: 'candidates' | 'prices' | 'selection' | 'places' | 'itinerary',
    status: 'started' | 'completed',
    message: string,
  ) => safeEmit({ type: 'step', step: s, status, message });

  try {
    // 1. candidates
    step(
      'candidates',
      'started',
      'Picking destinations that match your style...',
    );
    let candidates = await deps.ai.suggestCandidates(input);
    await deps.db.trip.update({
      where: { id: tripId },
      data: { candidates: candidates as object },
    });
    step('candidates', 'completed', candidates.map((c) => c.city).join(', '));

    // 2. prices, with one widened retry if nothing fits
    let { fitting, offers } = await priceAndFilter(
      candidates,
      input,
      deps,
      safeEmit,
    );
    if (fitting.length === 0) {
      const retryCandidates = await deps.ai.suggestCandidates(input, {
        exclude: candidates,
        cheaper: true,
      });
      const retryResult = await priceAndFilter(
        retryCandidates,
        input,
        deps,
        safeEmit,
      );
      candidates = [...candidates, ...retryCandidates];
      fitting = retryResult.fitting;
      offers = new Map([...offers, ...retryResult.offers]); // merge, don't replace -- keep prices from both attempts
    }
    if (fitting.length === 0) {
      const priced = candidates.map((c) => ({
        airportCode: c.airportCode,
        city: c.city,
        flightPrice: offers.get(c.airportCode)?.flight.price ?? null,
        hotelTotalPrice: offers.get(c.airportCode)?.hotel.totalPrice ?? null,
      }));
      const miss = closestMiss(priced, {
        flightsBudget: input.flightsBudget,
        stayBudget: input.stayBudget,
        foodBudget: input.foodBudget,
        activitiesBudget: input.activitiesBudget,
      });
      throw new PipelineError('NO_FIT', noFitMessage(input, miss));
    }

    // 3. selection (skipped when only one candidate fits)
    let chosen = fitting[0];
    if (fitting.length > 1) {
      step('selection', 'started', 'Choosing the best fit for your budget...');
      const sel = await deps.ai.selectDestination(fitting, input);
      validateSelection(sel, fitting);
      chosen = fitting.find((f) => f.airportCode === sel.selectedAirportCode)!;
      step('selection', 'completed', chosen.city);
    }

    const chosenOffers = offers.get(chosen.airportCode)!;
    const chosenCandidate = candidates.find(
      (c) => c.airportCode === chosen.airportCode,
    )!;

    // 4. places
    step('places', 'started', `Finding places in ${chosen.city}...`);
    const placeList = await deps.places.search(chosen.city, input.tripStyles);
    if (placeList.length < 8) {
      throw new PipelineError(
        'UPSTREAM',
        'Not enough places found for that destination.',
      );
    }
    step('places', 'completed', `${placeList.length} places found`);

    // 5. itinerary
    step('itinerary', 'started', 'Building your day-by-day plan...');
    const itinerary = await deps.ai.buildItinerary(chosen, placeList, input);
    validateItinerary(itinerary, {
      numberOfDays: input.numberOfDays,
      validPlaceIds: new Set(placeList.map((p) => p.id)),
      activitiesBudget: input.activitiesBudget,
      foodBudget: input.foodBudget,
    });
    step('itinerary', 'completed', 'Itinerary ready');

    // 6. persist, then finish
    await saveCompletedTrip(
      deps.db,
      tripId,
      { city: chosenCandidate.city, country: chosenCandidate.country },
      chosenOffers.flight,
      chosenOffers.hotel,
      itinerary,
      input,
    );
    safeEmit({ type: 'done', tripId });
  } catch (err) {
    const e =
      err instanceof PipelineError
        ? err
        : new PipelineError(
            'UNKNOWN',
            'Something went wrong while planning your trip.',
          );
    console.error(err);
    await deps.db.trip.update({
      where: { id: tripId },
      data: { status: 'FAILED', failureReason: e.code },
    });
    safeEmit({ type: 'error', message: e.message });
  }
}
