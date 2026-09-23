import { Router } from 'express';
import { getAggregatedList, getIPOBySlug } from '../services/aggregator.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const list = await getAggregatedList();
    res.json({ ipos: list, sources: { indianapi: true, nse: process.env.ENABLE_NSE_SOURCE !== 'false' } });
  } catch (err) {
    console.error('[routes/ipos] failed to build IPO list:', err);
    res.status(502).json({ error: 'Failed to fetch live IPO data', detail: err.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const ipo = await getIPOBySlug(req.params.slug);
    if (!ipo) return res.status(404).json({ error: 'IPO not found' });
    res.json(ipo);
  } catch (err) {
    console.error('[routes/ipos] failed to fetch IPO:', err);
    res.status(502).json({ error: 'Failed to fetch live IPO data', detail: err.message });
  }
});

export default router;
