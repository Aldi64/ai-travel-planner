import { generateStructured } from '../ai/llm';
import {
  FoodRecommendationsResponseSchema,
  TransportationResponseSchema,
} from './schemas';
import { foodPrompt, transportationPrompt } from './prompts';

export async function getFoodRecommendations(city: string) {
  const { system, prompt } = foodPrompt(city);
  const result = await generateStructured({
    system,
    prompt,
    schema: FoodRecommendationsResponseSchema,
  });
  return result.items;
}

export async function getTransportationSummary(city: string) {
  const { system, prompt } = transportationPrompt(city);
  return generateStructured({
    system,
    prompt,
    schema: TransportationResponseSchema,
  });
}
