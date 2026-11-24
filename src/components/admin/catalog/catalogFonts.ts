import { Font } from '@react-pdf/renderer';

let registered = false;

/**
 * The site's own typefaces (Playfair Display headings, Inter body), served
 * from /public/fonts/pdf — same-origin, so no CSP change. Unlike the built-in
 * Helvetica they also cover Turkish letters, so names no longer garble.
 */
export function registerCatalogFonts() {
  if (registered || typeof window === 'undefined') return;
  registered = true;
  const base = `${window.location.origin}/fonts/pdf`;
  Font.register({
    family: 'Inter',
    fonts: [
      { src: `${base}/Inter_400Regular.ttf`, fontWeight: 400 },
      { src: `${base}/Inter_600SemiBold.ttf`, fontWeight: 600 },
    ],
  });
  Font.register({
    family: 'Playfair',
    fonts: [
      { src: `${base}/PlayfairDisplay_400Regular.ttf`, fontWeight: 400 },
      { src: `${base}/PlayfairDisplay_700Bold.ttf`, fontWeight: 700 },
    ],
  });
  // Product names shouldn't be hyphenated mid-word.
  Font.registerHyphenationCallback((word) => [word]);
}
