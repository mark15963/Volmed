export const extractMkbCode = (text: string | null | undefined): string => {
  if (!text) return '';

  const cleaned = text
    .trim()
    .replace(/[\u2013\u2014–—]/g, '-')
    .replace(/\s*;\s*$/, '')

  const match = cleaned.match(/^([A-Z][0-9]{2})(?:\.([0-9A-Z]{1,2}))?/i);
  
  if (!match) {
    console.warn('Could not extract MKB code from:', text);
    return '-';
  }

  const [, base, ext] = match;

  const code = ext
    ?  `${base.toUpperCase()}.${ext.toUpperCase()}`
    : base.toUpperCase();

  return code;
}