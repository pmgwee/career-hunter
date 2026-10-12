/** Accept the canonical v1.36 stream and the older web-launcher protocol. */
export function parseStreamOffer(line, currentAts, positives = []) {
  const prefix = '@@CAREER_OPS_OFFER@@';
  const text = String(line ?? '').trim();
  const legacy = text.startsWith(prefix);
  if (!legacy && !text.startsWith('{')) return null;
  try {
    const raw = JSON.parse(legacy ? text.slice(prefix.length) : text);
    if (!legacy && raw?.kind !== 'offer') return null;
    return normalizeScanOffer(raw, currentAts, positives);
  } catch {
    return null;
  }
}

/** Normalize external ATS data before it reaches client-side sorting/rendering. */
export function normalizeScanOffer(raw, currentAts, positives = []) {
  if (!raw || typeof raw !== 'object') return null;
  const url = typeof raw.url === 'string' ? raw.url.trim() : '';
  const company = typeof raw.company === 'string' ? raw.company.trim() : '';
  const title = typeof raw.title === 'string' ? raw.title.trim() : '';
  if (!url || !company || !title) return null;
  const source = typeof raw.source === 'string' && raw.source ? raw.source : `${currentAts}-full`;
  const postedAt = typeof raw.postedAt === 'string' && /^\d{4}-\d{2}-\d{2}(?:$|T)/.test(raw.postedAt)
    ? raw.postedAt.slice(0, 10)
    : '';
  const matchedKeyword = positives.find((keyword) => keyword && title.toLowerCase().includes(keyword.toLowerCase()));
  return {
    company, title, url,
    location: typeof raw.location === 'string' ? raw.location : '',
    postedAt,
    ats: source.replace(/-full$/, ''),
    source,
    matchedKeyword,
  };
}
