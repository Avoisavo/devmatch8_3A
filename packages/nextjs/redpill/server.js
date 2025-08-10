// Simple Express proxy that wraps the RedPill OpenAI-compatible API.
// Listens on PORT (default 5000) and exposes POST /chat/completions.
// Reads API key from REDPILL or REDPILL_API_KEY environment variable.

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json({ limit: '1mb' }));

const getApiKey = () => process.env.REDPILL || process.env.REDPILL_API_KEY;

// Four AI personas (same endpoint), each with a distinct prompt and optional default model.
// You can override models at request-time via body.model. If a system message is already
// present in the incoming messages, we won't prepend our own prompt.
const AGENTS = {
  general: {
    system: 'You are a helpful, friendly assistant. Be clear and concise.',
    model: 'openai/gpt-4.1-nano',
  },
  coder: {
    system: 'You are an expert software engineer. Provide accurate, production-quality code with brief explanations. Prefer correctness, safety, and clarity. Use best practices.',
    model: 'openai/gpt-4o-mini',
  },
  teacher: {
    system: 'You are a patient teacher. Explain concepts step-by-step, use examples, and check understanding. Avoid jargon unless explained.',
    model: 'anthropic/claude-3.5-sonnet',
  },
  critic: {
    system: 'You are a critical reviewer. Point out flaws, edge cases, risks, and missing details. Offer constructive improvements.',
    model: 'openai/gpt-4.1-nano',
  },
};

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/chat/completions', async (req, res) => {
  const apiKey = getApiKey();
  if (!apiKey) return res.status(500).json({ error: 'Missing REDPILL API key' });

  const { messages, model, temperature = 0.7, stream = false, max_tokens, ai, agent } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages is required and must be a non-empty array' });
  }

  // Resolve agent choice and assemble final messages
  const chosen = String(ai || agent || 'general').toLowerCase();
  const agentCfg = AGENTS[chosen] || AGENTS.general;

  const finalModel = model || agentCfg.model || 'openai/gpt-4.1-nano';

  const hasSystem = messages.length > 0 && messages[0]?.role === 'system';
  const finalMessages = hasSystem ? messages : [{ role: 'system', content: agentCfg.system }, ...messages];

  try {
    const rpRes = await fetch('https://api.redpill.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({ messages: finalMessages, model: finalModel, temperature, stream: Boolean(stream), ...(max_tokens ? { max_tokens } : {}) }),
    });

    if (stream) {
      // Stream through
      res.writeHead(rpRes.status, Object.fromEntries(rpRes.headers));
      if (!rpRes.body) return res.end();
      const reader = rpRes.body.getReader();
      const encoder = new TextEncoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(encoder.encode(new TextDecoder().decode(value)));
      }
      return res.end();
    }

    const data = await rpRes.json().catch(() => null);
    if (!rpRes.ok) {
      return res.status(rpRes.status).json({ error: 'RedPill API error', details: data });
    }
    return res.status(200).json(data);
  } catch (err) {
    console.error('RedPill proxy error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  const hasKey = !!getApiKey();
  console.log(`RedPill Express proxy listening on port ${PORT}`);
  if (!hasKey) {
    console.warn('Warning: REDPILL API key not set. Requests to /chat/completions will fail.');
  }
});