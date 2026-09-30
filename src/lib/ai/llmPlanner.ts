import type { AiPlanner } from './planner';
import {
  CandidatesResponseSchema,
  SelectionResponseSchema,
  ItineraryResponseSchema,
} from './schemas';
import { generateStructured } from './llm';
import { candidatesPrompt, selectionPrompt, itineraryPrompt } from './prompts';

export const llmAiPlanner: AiPlanner = {
  async suggestCandidates(input, opts) {
    const { system, prompt } = candidatesPrompt(input, {
      exclude: opts?.exclude?.map((c) => c.city),
      cheaper: opts?.cheaper,
    });
    const result = await generateStructured({
      system,
      prompt,
      schema: CandidatesResponseSchema,
    });
    return result.candidates;
  },

  async selectDestination(pricedCandidates, input) {
    const { system, prompt } = selectionPrompt(pricedCandidates, input);
    return generateStructured({
      system,
      prompt,
      schema: SelectionResponseSchema,
    });
  },

  async buildItinerary(chosen, places, input) {
    const { system, prompt } = itineraryPrompt(chosen, places, input);
    return generateStructured({
      system,
      prompt,
      schema: ItineraryResponseSchema,
    });
  },
};
