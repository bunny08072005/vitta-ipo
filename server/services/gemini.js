/**
 * Free-tier AI analysis via Google's Gemini API (Google AI Studio) —
 * no credit card required to get a key, at aistudio.google.com/apikey.
 * As of writing, gemini-3.6-flash's free tier allows roughly 15
 * requests/min and 1,500 requests/day, comfortably covering this app's
 * usage (analysis is generated once per IPO then disk-cached; chat is
 * infrequent, user-driven). Google retires/renames free-tier model IDs
 * periodically — if this model 404s with a "no longer available"
 * message, the error will name its replacement; update GEMINI_MODEL
 * (or this default) accordingly.
 *
 * This is the default provider (see server/services/llmProvider.js).
 * Claude (server/services/anthropic.js) remains available as a paid
 * alternative if you set LLM_PROVIDER=anthropic.
 */
import { GoogleGenAI } from '@google/genai';
import { buildAnalysisPrompt, buildChatPrompt, parseAnalysisJSON } from './promptContext.js';

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

let client = null;
function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_key_here') {
    throw new Error('GEMINI_API_KEY is not configured on the backend');
  }
  if (!client) client = new GoogleGenAI({ apiKey });
  return client;
}

export async function generateAnalysis(context) {
  const text = await callGemini(buildAnalysisPrompt(context));
  return parseAnalysisJSON(text);
}

export async function answerChatQuestion(context, question) {
  const text = await callGemini(buildChatPrompt(context, question));
  return text.trim();
}

async function callGemini(prompt) {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  });
  const text = response.text;
  if (!text) throw new Error('Gemini returned an empty response (it may have been blocked by safety filters)');
  return text;
}
