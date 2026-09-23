/**
 * Talks only to our own backend (server/) — no API keys, no upstream URLs,
 * no data-shape guessing here. The backend already returns data in the
 * app's canonical schema.
 */

export async function fetchIPOList() {
  const res = await fetch('/api/ipos');
  if (!res.ok) throw new Error(`Backend returned ${res.status} for /api/ipos`);
  const data = await res.json();
  return data.ipos;
}

export async function fetchIPOAnalysis(slug) {
  const res = await fetch(`/api/ipos/${slug}/analysis`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || body.error || `Backend returned ${res.status} for analysis`);
  }
  return res.json();
}

export async function uploadRHP(slug, file) {
  const formData = new FormData();
  formData.append('rhp', file);
  const res = await fetch(`/api/ipos/${slug}/upload-rhp`, { method: 'POST', body: formData });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || body.error || `Backend returned ${res.status} for upload`);
  }
  return res.json();
}

export async function sendChatQuestion(slug, question) {
  const res = await fetch(`/api/ipos/${slug}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || body.error || `Backend returned ${res.status} for chat`);
  }
  return res.json();
}
