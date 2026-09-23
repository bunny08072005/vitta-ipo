import { Router } from 'express';
import { getIPOBySlug } from '../services/aggregator.js';
import { buildAnalysisContext } from '../services/context.js';
import { answerChatQuestion } from '../services/llmProvider.js';

const router = Router();

router.post('/:slug/chat', async (req, res) => {
  const slug = req.params.slug;
  const question = String(req.body?.question || '').trim();
  if (!question) return res.status(400).json({ error: 'Missing "question" in request body' });
  if (question.length > 500) return res.status(400).json({ error: 'Question is too long (max 500 characters)' });

  try {
    const ipo = await getIPOBySlug(slug);
    if (!ipo) return res.status(404).json({ error: 'IPO not found' });

    const context = await buildAnalysisContext(ipo);
    const answer = await answerChatQuestion(context, question);
    res.json({ answer, drhpFound: context.drhpFound });
  } catch (err) {
    console.error(`[routes/chat] failed for "${slug}":`, err);
    res.status(502).json({ error: 'Chat is unavailable right now', detail: err.message });
  }
});

export default router;
