import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import { z, type ZodType } from 'zod';

const geminiApiKey = process.env.GEMINI_API_KEY;
const geminiModelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

const groqApiKey = process.env.GROQ_API_KEY;
const groqModelName = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!geminiApiKey) throw new Error('GEMINI_API_KEY is not set');
  if (!geminiClient) geminiClient = new GoogleGenAI({ apiKey: geminiApiKey });
  return geminiClient;
}

let groqClient: OpenAI | null = null;
function getGroqClient(): OpenAI {
  if (!groqApiKey) throw new Error('GROQ_API_KEY is not set');
  if (!groqClient)
    groqClient = new OpenAI({
      apiKey: groqApiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  return groqClient;
}

async function callGemini(
  system: string,
  prompt: string,
  jsonSchema: object,
): Promise<unknown> {
  const genAI = getGeminiClient();
  const response = await genAI.models.generateContent({
    model: geminiModelName,
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

async function callGroq(
  system: string,
  prompt: string,
  jsonSchema: object,
): Promise<unknown> {
  const client = getGroqClient();
  // Groq's JSON mode doesn't enforce a schema server-side the way Gemini's
  // responseSchema does -- so the schema is embedded as instructions in the
  // prompt, and OUR OWN zod validation + retry (below) does the enforcement.
  const schemaInstructions = `Respond with ONLY a JSON object matching this JSON Schema exactly, no extra text:\n${JSON.stringify(
    jsonSchema,
  )}`;

  const response = await client.chat.completions.create({
    model: groqModelName,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: `${prompt}\n\n${schemaInstructions}` },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  const text = response.choices[0]?.message?.content;
  if (!text) throw new Error('Empty response from Groq');
  return JSON.parse(text);
}

type CallFn = (
  system: string,
  prompt: string,
  jsonSchema: object,
) => Promise<unknown>;

function isTransient(err: unknown): boolean {
  const status = (err as { status?: number })?.status;
  return status === 429 || (typeof status === 'number' && status >= 500);
}

async function callWithRetry(
  call: CallFn,
  system: string,
  prompt: string,
  jsonSchema: object,
  attempt = 1,
): Promise<unknown> {
  try {
    return await call(system, prompt, jsonSchema);
  } catch (err) {
    if (isTransient(err) && attempt < 3) {
      await new Promise((r) => setTimeout(r, attempt * 1000)); // 1s, then 2s
      return callWithRetry(call, system, prompt, jsonSchema, attempt + 1);
    }
    throw err;
  }
}

async function tryProvider<T>(
  call: CallFn,
  system: string,
  prompt: string,
  jsonSchema: object,
  schema: ZodType<T>,
): Promise<T> {
  const raw = await callWithRetry(call, system, prompt, jsonSchema);
  const parsed = schema.safeParse(raw);
  if (parsed.success) return parsed.data;

  const retryPrompt = `${prompt}\n\nYour previous response failed validation:\n${JSON.stringify(
    parsed.error.issues,
  )}\nReturn corrected JSON only, matching the schema exactly.`;
  const raw2 = await callWithRetry(call, system, retryPrompt, jsonSchema);
  return schema.parse(raw2); // throws if still invalid
}

/**
 * Tries Gemini first (with its own transient-error retries and one
 * validation retry). Only if that's fully exhausted, falls back to Groq
 * (same retry treatment). If GROQ_API_KEY isn't set, no fallback happens --
 * the original Gemini error surfaces as before.
 */
export async function generateStructured<T>(params: {
  system: string;
  prompt: string;
  schema: ZodType<T>;
}): Promise<T> {
  const jsonSchema = z.toJSONSchema(params.schema, { target: 'openapi-3.0' });

  try {
    return await tryProvider(
      callGemini,
      params.system,
      params.prompt,
      jsonSchema,
      params.schema,
    );
  } catch (geminiErr) {
    if (!groqApiKey) throw geminiErr;
    console.error('Gemini failed, falling back to Groq:', geminiErr);
    try {
      return await tryProvider(
        callGroq,
        params.system,
        params.prompt,
        jsonSchema,
        params.schema,
      );
    } catch (groqErr) {
      console.error('Groq fallback also failed:', groqErr);
      throw groqErr;
    }
  }
}
