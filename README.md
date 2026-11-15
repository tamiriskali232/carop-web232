# CarOp

**CarOp** is a gamified career sandbox for US adults aged 25-45 who feel stuck in their job. Live through a career before you spend money or months on it: face a live AI boss, complete role-specific skill tasks and see whether you can handle the job.

**Live link:** _add your Vercel URL here_

## Main flow
1. **Select role:** pick a pixel avatar and a career (Project Manager is free; Customer Success Manager and Data Analyst unlock via test checkout).
2. **Survive the boss:** a 5-turn Slack-style chat. The boss replies live from an LLM with escalating friction and a stress meter reacts to your answers.
3. **Get scored:** four scores (Emotional Tolerance, Communication Clarity, Problem Solving, Composure Under Pressure), a career-fit label and quotes from your own replies.
4. **Career tasks:** five level-by-level tasks per career (for example Excel, SQL and Power BI for a Data Analyst).

Scores are calculated in code from the LLM's strict-JSON per-turn ratings plus measured signals (reply length, acknowledging the boss, a concrete next step, response time). If the AI call fails the app shows an error with Retry, never fake results.

## Tech
React + Vite, plain CSS, two Vercel Edge Functions (`api/boss.js`, `api/score.js`) calling the Anthropic API. Progress and unlocks are kept in `localStorage` (no accounts).

**Required secret:** `LLM_API_KEY` (server-side only). Optional: `LLM_MODEL`.

## Run locally
1. `npm install`
2. `cp .env.example .env` and put your key in `LLM_API_KEY`
3. `npm i -g vercel` (the AI endpoints need the Vercel dev server)
4. `vercel dev`
5. Open the printed local URL. (`npm run dev` runs the UI only, without the AI.)

## Deploy
Push to GitHub, import the repo in Vercel (Vite is auto-detected), add `LLM_API_KEY` under Settings > Environment Variables and deploy.

## Paywall is test mode
Checkout is a simulated test-mode flow: use card `4242 4242 4242 4242`, any future date, any CVC. No real money is charged and card details are never stored.

CarOp is a simulation for self-exploration, not professional career advice.
