/**
 * Picks which AI backend generates analysis and chat answers.
 * Defaults to Gemini (free tier, no credit card). Set LLM_PROVIDER=anthropic
 * in server/.env to use Claude instead, if you'd rather pay for it.
 */
import * as gemini from './gemini.js';
import * as anthropic from './anthropic.js';

const PROVIDERS = { gemini, anthropic };

function activeProvider() {
  const name = (process.env.LLM_PROVIDER || 'gemini').toLowerCase();
  const provider = PROVIDERS[name];
  if (!provider) throw new Error(`Unknown LLM_PROVIDER "${name}" — expected "gemini" or "anthropic"`);
  return provider;
}

export async function generateAnalysis(context) {
  return activeProvider().generateAnalysis(context);
}

export async function answerChatQuestion(context, question) {
  return activeProvider().answerChatQuestion(context, question);
}
