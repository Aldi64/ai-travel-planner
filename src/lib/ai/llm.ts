import { GoogleGenAI } from '@google/genai';
import { z, type ZodType } from 'zod';

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

let client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');
  if (!client) client = new GoogleGenAI({ apiKey });
  return client;
}

async function callGemini(
  system: string,
  prompt: string,
  jsonSchema: object,
): Promise<unknown> {
  const genAI = getClient();
  const response = await genAI.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      systemInstruction: system,
      responseMimeType: 'application/json',
      responseSchema: jsonSchema,
      temperature: 0.7,
    },
  });

  const text = response.text;
  if (!text) throw new Error('Empty response from Gemini');
  return JSON.parse(text);
}

/**
 * Retries on transient errors (429 rate-limited, 5xx server issues -- e.g.
 * "model currently experiencing high demand"), with short backoff. Does NOT
 * retry on other errors (bad request, auth failure, etc.) -- those won't
 * fix themselves on retry.
 */
async function callGeminiWithRetry(
  system: string,
  prompt: string,
  jsonSchema: object,
  attempt = 1,
): Promise<unknown> {
  try {
    return await callGemini(system, prompt, jsonSchema);
  } catch (err) {
    const status = (err as { status?: number })?.status;
    const isTransient =
      status === 429 || (typeof status === 'number' && status >= 500);
    if (isTransient && attempt < 3) {
      await new Promise((r) => setTimeout(r, attempt * 1000)); // 1s, then 2s
      return callGeminiWithRetry(system, prompt, jsonSchema, attempt + 1);
    }
    throw err;
  }
}

/**
 * Calls Gemini, parses the JSON response with `schema`, and retries once
 * (with the validation error appended to the prompt) if it fails.
 */
export async function generateStructured<T>(params: {
  system: string;
  prompt: string;
  schema: ZodType<T>;
}): Promise<T> {
  // target: "openApi3" keeps the schema within the OpenAPI-3-subset Gemini's
  // responseSchema field expects, rather than full JSON Schema with $refs.
  const jsonSchema = z.toJSONSchema(params.schema, { target: 'openapi-3.0' });

  const raw = await callGeminiWithRetry(
    params.system,
    params.prompt,
    jsonSchema,
  );
  const parsed = params.schema.safeParse(raw);
  if (parsed.success) return parsed.data;

  const retryPrompt = `${params.prompt}\n\nYour previous response failed validation:\n${JSON.stringify(
    parsed.error.issues,
  )}\nReturn corrected JSON only, matching the schema exactly.`;

  const raw2 = await callGeminiWithRetry(
    params.system,
    retryPrompt,
    jsonSchema,
  );
  return params.schema.parse(raw2); // throws if still invalid -- caller (planTrip) turns this into AI_INVALID
}
