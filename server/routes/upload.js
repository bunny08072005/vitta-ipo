import { Router } from 'express';
import multer from 'multer';
import { getIPOBySlug } from '../services/aggregator.js';
import { saveUploadedRHP, MAX_PDF_BYTES } from '../services/drhp.js';
import { getOrGenerateAnalysis } from '../services/analysisService.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PDF_BYTES },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are accepted'));
    }
    cb(null, true);
  },
});

router.post('/:slug/upload-rhp', (req, res) => {
  upload.single('rhp')(req, res, async (err) => {
    if (err) {
      const tooLarge = err.code === 'LIMIT_FILE_SIZE';
      return res.status(tooLarge ? 413 : 400).json({
        error: tooLarge ? `File is too large (max ${Math.round(MAX_PDF_BYTES / 1024 / 1024)}MB)` : err.message,
      });
    }

    const slug = req.params.slug;
    try {
      const ipo = await getIPOBySlug(slug);
      if (!ipo) return res.status(404).json({ error: 'IPO not found' });
      if (!req.file) return res.status(400).json({ error: 'No file uploaded — send it as multipart/form-data field "rhp"' });

      // Basic magic-byte sanity check — a wrong Content-Type header alone
      // (spoofed or misconfigured client) shouldn't get past the filter.
      if (req.file.buffer.slice(0, 5).toString('latin1') !== '%PDF-') {
        return res.status(400).json({ error: 'File does not look like a valid PDF' });
      }

      await saveUploadedRHP(ipo.name, req.file.buffer);
      const analysis = await getOrGenerateAnalysis(ipo);

      res.json({ ...analysis, _uploadedRHP: true });
    } catch (err) {
      console.error(`[routes/upload] failed for "${slug}":`, err);
      res.status(502).json({ error: 'Failed to process the uploaded RHP', detail: err.message });
    }
  });
});

export default router;
