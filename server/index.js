import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import iposRouter from './routes/ipos.js';
import analysisRouter from './routes/analysis.js';
import chatRouter from './routes/chat.js';
import uploadRouter from './routes/upload.js';

const app = express();
const PORT = process.env.PORT || 5174;

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/ipos', iposRouter);
app.use('/api/ipos', analysisRouter);
app.use('/api/ipos', chatRouter);
app.use('/api/ipos', uploadRouter);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () => {
  console.log(`Vitta IPO backend listening on http://localhost:${PORT}`);
  if (!process.env.IPO_API_KEY || process.env.IPO_API_KEY === 'your_indianapi_key_here') {
    console.warn('IPO_API_KEY is not set — the live IndianAPI source will be skipped. Copy server/.env.example to server/.env and fill it in.');
  }

  const provider = (process.env.LLM_PROVIDER || 'gemini').toLowerCase();
  if (provider === 'anthropic') {
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_key_here') {
      console.warn('LLM_PROVIDER=anthropic but ANTHROPIC_API_KEY is not set — AI analysis and chat will return errors until it is configured.');
    } else {
      console.log('AI provider: Anthropic (Claude)');
    }
  } else {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_key_here') {
      console.warn('GEMINI_API_KEY is not set — AI analysis and chat will return errors until it is configured. Get a free key (no card needed) at https://aistudio.google.com/apikey');
    } else {
      console.log('AI provider: Google Gemini (free tier)');
    }
  }
});
