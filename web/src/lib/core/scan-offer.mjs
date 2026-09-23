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
    company,
    title,
    url,
    location: typeof raw.location === 'string' ? raw.location : '',
    postedAt,
    ats: source.replace(/-full$/, ''),
    source,
    matchedKeyword,
  };
}
