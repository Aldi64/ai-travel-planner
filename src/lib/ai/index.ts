import { fakeAiPlanner } from './fake';
import { llmAiPlanner } from './llmPlanner';
import type { AiPlanner } from './planner';

const useFake = process.env.USE_FAKE_AI !== 'false';

export const aiPlanner: AiPlanner = useFake ? fakeAiPlanner : llmAiPlanner;
