import { ask, reply, readPrompt } from "./_llm.js";

export const config = { runtime: "edge" };

export default async function handler(req) {
  const prompt = await readPrompt(req);
  if (!prompt) return reply({ error: "Bad request" }, 400);
  try {
    const raw = await ask(prompt, {
      maxTokens: 900,
      system: "You are an objective rater. Reply with strict JSON only: no prose, no markdown.",
    });
    const json = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
    return reply({ json });
  } catch {
    return reply({ error: "Scoring unavailable" }, 502);
  }
}
