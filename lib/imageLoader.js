/**
 * Custom Next.js image loader that fixes malformed product image URLs
 * (e.g. "https://www.madeforsport.https//www.madeforsport.eu/...") before the request.
 * Runs for every next/image, so the wrong URL never reaches the network.
 */

function fixUrlProtocol(url) {
  if (!url || typeof url !== 'string') return url;
  const t = url.trim();
  // Match ".https//" or "https//" and use everything after "https//" as the real URL
  const mHttps = t.match(/\.?https\/\/(.+)$/);
  if (mHttps) return 'https://' + mHttps[1].trim();
  const mHttp = t.match(/\.?http\/\/(.+)$/);
  if (mHttp) return 'http://' + mHttp[1].trim();
  if (t.startsWith('https//')) return 'https://' + t.slice(7);
  if (t.startsWith('http//')) return 'http://' + t.slice(6);
  return t;
}

/** Default Next.js image loader URL shape (same as built-in). */
function defaultLoader({ src, width, quality }) {
  const fixed = fixUrlProtocol(src);
  return `/_next/image?url=${encodeURIComponent(fixed)}&w=${width}&q=${quality || 75}`;
}

module.exports = defaultLoader;
