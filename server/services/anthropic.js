/**
 * Paid alternative AI provider (Claude). Not used unless LLM_PROVIDER=anthropic
 * — see server/services/llmProvider.js and server/services/gemini.js (the
 * default, free provider).
 */
import Anthropic from '@anthropic-ai/sdk';
import { buildAnalysisPrompt, buildChatPrompt, parseAnalysisJSON } from './promptContext.js';

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';

let client = null;
function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your_anthropic_key_here') {
    throw new Error('ANTHROPIC_API_KEY is not configured on the backend');
  }
  if (!client) client = new Anthropic({ apiKey });
  return client;
}

export async function generateAnalysis(context) {
  const text = await callClaude(buildAnalysisPrompt(context), 3000);
  return parseAnalysisJSON(text);
}

export async function answerChatQuestion(context, question) {
  return (await callClaude(buildChatPrompt(context, question), 500)).trim();
}

async function callClaude(prompt, maxTokens) {
  const anthropic = getClient();
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });
  return response.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('\n');
}
