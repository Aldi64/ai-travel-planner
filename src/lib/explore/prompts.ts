const SYSTEM =
  'You are a precise, honest local-travel assistant. Always return only valid JSON matching the requested schema, with no prose outside the JSON. Never invent specific numbers (exact prices, exact addresses) you cannot be confident about -- prefer general, qualitative descriptions over false precision.';

export function foodPrompt(city: string): { system: string; prompt: string } {
  return {
    system: SYSTEM,
    prompt: `
List 4-8 well-known local food dishes or food spots that are popular with both locals and visitors in ${city}.

For each: a name (dish or place), a 1-2 sentence description, and a general area/neighborhood (NOT a precise street address -- just the district or area name, since exact addresses may be wrong or outdated).
`.trim(),
  };
}

export function transportationPrompt(city: string): {
  system: string;
  prompt: string;
} {
  return {
    system: SYSTEM,
    prompt: `
Give a practical transportation overview for a tourist visiting ${city}: a 1-2 sentence overview, 2-6 transportation options (e.g. ride-hailing apps commonly used there, public transit, taxis, walking), and 1-5 general practical tips.

For costs, use RELATIVE terms only ("inexpensive", "moderate", "pricier than ride-hailing") -- do not state specific prices, since exact fares change often and you cannot verify current rates.
`.trim(),
  };
}
