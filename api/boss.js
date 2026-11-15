import { ask, reply, readPrompt } from "./_llm.js";

export const config = { runtime: "edge" };

export default async function handler(req) {
  const prompt = await readPrompt(req);
  if (!prompt) return reply({ error: "Bad request" }, 400);
  try {
    const text = await ask(prompt, {
      maxTokens: 200,
      system: "You play a manager in a workplace career simulation. Stay in character and output only the chat message.",
    });
    return reply({ text });
  } catch {
    return reply({ error: "AI unavailable" }, 502);
  }
}
