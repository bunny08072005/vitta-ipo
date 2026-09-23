import { Router } from 'express';
import { getIPOBySlug } from '../services/aggregator.js';
import { getOrGenerateAnalysis } from '../services/analysisService.js';

const router = Router();

router.get('/:slug/analysis', async (req, res) => {
  const slug = req.params.slug;
  try {
    const ipo = await getIPOBySlug(slug);
    if (!ipo) return res.status(404).json({ error: 'IPO not found' });

    res.json(await getOrGenerateAnalysis(ipo));
  } catch (err) {
    console.error(`[routes/analysis] failed for "${slug}":`, err);
    res.status(502).json({ error: 'AI analysis unavailable', detail: err.message });
  }
});

export default router;
