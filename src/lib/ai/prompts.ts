import type { PlanInput, Place } from './types';
import type { FitResult } from '../budget';

const SYSTEM =
  'You are a precise trip-planning assistant. Always return only valid JSON matching the requested schema, with no prose or explanation outside the JSON.';

export function candidatesPrompt(
  input: PlanInput,
  opts?: { exclude?: string[]; cheaper?: boolean },
): { system: string; prompt: string } {
  const excludeText = opts?.exclude?.length
    ? `Do not suggest these cities again: ${opts.exclude.join(', ')}.`
    : '';
  const cheaperText = opts?.cheaper
    ? 'Prioritize notably cheaper destinations than a typical suggestion -- the budget is tight.'
    : '';

  return {
    system: SYSTEM,
    prompt: `
Suggest exactly 3 real destination cities (each with its main international airport) that fit this trip:
- Origin: ${input.originCity} (${input.originCode})
- Dates: ${input.startDate} to ${input.endDate} (${input.numberOfDays} days)
- Travelers: ${input.groupSize}
- Trip styles (equally weighted, not ranked): ${input.tripStyles.join(', ')}
- Currency: ${input.currency}
- Approximate budget: flights ${input.flightsBudget}, stay ${input.stayBudget}, food ${input.foodBudget}, activities ${input.activitiesBudget} ${input.currency}

${excludeText}
${cheaperText}

For each candidate: city, country, its main airport's IATA code (use the same value for both airportCode and cityCode), and a 1-2 sentence reasoning tied to the requested styles and budget.
`.trim(),
  };
}

export function selectionPrompt(
  pricedCandidates: FitResult[],
  input: PlanInput,
): { system: string; prompt: string } {
  const list = pricedCandidates
    .map(
      (c) =>
        `- ${c.city} (${c.airportCode}): flight ${c.flightPrice} ${input.currency}, hotel ${c.hotelTotalPrice} ${input.currency}, leaving ${c.remainingActivitiesFoodBudget} ${input.currency} for food+activities`,
    )
    .join('\n');

  return {
    system: SYSTEM,
    prompt: `
All of these destinations already fit the traveler's budget. Pick the single best one for trip styles: ${input.tripStyles.join(', ')}.

${list}

Choose based on overall fit for the requested styles and value, not just the lowest price. Return the airportCode of your pick and a short reasoning.
`.trim(),
  };
}

export function itineraryPrompt(
  chosen: FitResult,
  places: Place[],
  input: PlanInput,
): { system: string; prompt: string } {
  const placeList = places
    .map(
      (p) =>
        `- id: ${p.id}, name: "${p.name}", type: ${p.type}${p.priceLevel ? `, priceLevel: ${p.priceLevel}` : ''}`,
    )
    .join('\n');

  return {
    system: SYSTEM,
    prompt: `
Build a ${input.numberOfDays}-day itinerary for ${chosen.city}, for ${input.groupSize} traveler(s), styles: ${input.tripStyles.join(', ')}.

You MUST only use placeId values from this list -- never invent a place:
${placeList}

Remaining budget for the WHOLE trip (not per person): activities ${input.activitiesBudget} ${input.currency}, food ${input.foodBudget} ${input.currency}.

For each day, include 2-6 items mixing ACTIVITY and FOOD types. Each item needs a placeId from the list above, a startTime ("HH:MM"), a short description, and an estimatedCost in ${input.currency} for the whole group. Keep total ACTIVITY costs within the activities budget and total FOOD costs within the food budget.
`.trim(),
  };
}
