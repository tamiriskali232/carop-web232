export async function ask(prompt, { maxTokens = 400, system } = {}) {
  const key = process.env.LLM_API_KEY;
  if (!key) throw new Error("LLM_API_KEY is not set");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: process.env.LLM_MODEL || "claude-sonnet-5-5",
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error("LLM error " + res.status);
  const data = await res.json();
  return (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("").trim();
}

export function reply(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

export async function readPrompt(req) {
  if (req.method !== "POST") return null;
  try {
    const { prompt } = await req.json();
    return typeof prompt === "string" && prompt.length > 0 && prompt.length <= 8000 ? prompt : null;
  } catch {
    return null;
  }
}
Click Commit changes, then Commit changes again in the window.

File 2

Click Add file, then Create new file.
Name it api/boss.js.
Paste this:
js
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
