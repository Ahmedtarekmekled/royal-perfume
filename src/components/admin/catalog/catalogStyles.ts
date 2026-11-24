import { StyleSheet } from '@react-pdf/renderer';
import { CATALOG_COLORS as C, CATALOG_IMAGE_ASPECT, CatalogProductsPerRow } from './types';

// A4 in points.
export const PAGE_W = 595.28;
export const MARGIN_X = 36;
const CONTENT_W = PAGE_W - MARGIN_X * 2;
const SLOT_PAD = 5;

/** Card metrics per column count — the image box always matches the letterboxed photo's aspect ratio. */
export function cardMetrics(perRow: CatalogProductsPerRow) {
  const slotW = CONTENT_W / perRow;
  const imageW = slotW - SLOT_PAD * 2;
  return {
    slotW,
    imageW,
    imageH: imageW / CATALOG_IMAGE_ASPECT,
    nameSize: perRow === 2 ? 12 : perRow === 3 ? 10 : 8.6,
    priceSize: perRow === 2 ? 12 : perRow === 3 ? 10 : 9,
    descLines: perRow === 2 ? 4 : 3,
  };
}

const SERIF = 'Playfair';
const SANS = 'Inter';

export const catalogStyles = StyleSheet.create({
  page: {
    paddingTop: 70,
    paddingBottom: 58,
    paddingHorizontal: MARGIN_X,
    fontFamily: SANS,
    fontSize: 9,
    color: C.ink,
    backgroundColor: '#FFFFFF',
  },

  // ── Cover ─────────────────────────────────────────────────────────
  coverPage: {
    fontFamily: SANS,
    color: C.ink,
    backgroundColor: '#FFFFFF',
  },
  coverFrame: {
    position: 'absolute',
    top: 22,
    left: 22,
    right: 22,
    bottom: 22,
    borderWidth: 0.75,
    borderColor: C.ink,
  },
  coverFrameInner: {
    position: 'absolute',
    top: 27,
    left: 27,
    right: 27,
    bottom: 27,
    borderWidth: 0.4,
    borderColor: C.gold,
  },
  coverBody: {
    flexGrow: 1,
    paddingTop: 64,
    paddingHorizontal: 64,
    alignItems: 'center',
  },
  coverLogo: {
    width: 116,
    height: 116,
    objectFit: 'contain',
  },
  coverEyebrow: {
    marginTop: 24,
    fontSize: 8,
    letterSpacing: 3.5,
    textTransform: 'uppercase',
    color: C.gold,
    textAlign: 'center',
  },
  coverTitle: {
    marginTop: 10,
    fontFamily: SERIF,
    fontWeight: 700,
    fontSize: 36,
    lineHeight: 1.15,
    textAlign: 'center',
  },
  coverRule: {
    width: 46,
    height: 1,
    backgroundColor: C.ink,
    marginTop: 16,
    marginBottom: 14,
  },
  coverSubtitle: {
    fontSize: 9,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    color: C.body,
    textAlign: 'center',
  },
  coverDescription: {
    marginTop: 12,
    maxWidth: 360,
    fontFamily: SERIF,
    fontSize: 11,
    lineHeight: 1.6,
    color: C.body,
    textAlign: 'center',
  },
  coverImageWrap: {
    marginTop: 22,
    alignItems: 'center',
  },
  coverStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  coverStat: {
    alignItems: 'center',
    paddingHorizontal: 22,
  },
  coverStatDivider: {
    width: 0.5,
    backgroundColor: C.rule,
  },
  coverStatValue: {
    fontFamily: SERIF,
    fontWeight: 700,
    fontSize: 20,
  },
  coverStatLabel: {
    marginTop: 3,
    fontSize: 6.5,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: C.muted,
  },
  coverBand: {
    marginHorizontal: 27,
    marginBottom: 27,
    backgroundColor: C.ink,
    paddingVertical: 20,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  coverBandCompany: {
    fontFamily: SERIF,
    fontWeight: 700,
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  coverBandLine: {
    marginTop: 5,
    fontSize: 7.5,
    color: '#D6D3CE',
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  coverBandDate: {
    marginTop: 9,
    fontSize: 6.5,
    color: C.gold,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // ── Contents ──────────────────────────────────────────────────────
  tocEyebrow: {
    fontSize: 7.5,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: C.gold,
  },
  tocTitle: {
    marginTop: 6,
    fontFamily: SERIF,
    fontWeight: 700,
    fontSize: 30,
  },
  tocRule: {
    width: 46,
    height: 1,
    backgroundColor: C.ink,
    marginTop: 14,
    marginBottom: 18,
  },
  tocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 0.5,
    borderBottomColor: C.rule,
    textDecoration: 'none',
    color: C.ink,
  },
  tocIndex: {
    width: 26,
    fontSize: 7.5,
    color: C.muted,
  },
  tocName: {
    flexGrow: 1,
    flexShrink: 1,
    fontFamily: SERIF,
    fontSize: 11.5,
  },
  tocCount: {
    fontSize: 7,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: C.muted,
  },

  // ── Running header / footer ───────────────────────────────────────
  headerRow: {
    position: 'absolute',
    top: 24,
    left: MARGIN_X,
    right: MARGIN_X,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: C.ink,
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 24,
    height: 24,
    objectFit: 'contain',
    marginRight: 7,
  },
  headerCompany: {
    fontFamily: SERIF,
    fontWeight: 700,
    fontSize: 10,
  },
  headerTitle: {
    fontSize: 6.5,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: C.muted,
  },
  footerRow: {
    position: 'absolute',
    bottom: 22,
    left: MARGIN_X,
    right: MARGIN_X,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 7,
    borderTopWidth: 0.5,
    borderTopColor: C.rule,
  },
  footerText: {
    fontSize: 6.5,
    color: C.muted,
    letterSpacing: 0.3,
  },
  footerPage: {
    fontSize: 6.5,
    color: C.ink,
    letterSpacing: 1,
  },

  // ── Section heading ───────────────────────────────────────────────
  groupHeader: {
    marginTop: 6,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 7,
    borderBottomWidth: 1.2,
    borderBottomColor: C.ink,
  },
  groupEyebrow: {
    fontSize: 6.5,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    color: C.gold,
    marginBottom: 3,
  },
  groupHeading: {
    fontFamily: SERIF,
    fontWeight: 700,
    fontSize: 20,
    lineHeight: 1.15,
  },
  groupCount: {
    fontSize: 6.5,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: C.muted,
    paddingBottom: 3,
  },

  // ── Product grid ──────────────────────────────────────────────────
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SLOT_PAD,
  },
  slot: {
    paddingHorizontal: SLOT_PAD,
    marginBottom: 16,
  },
  imageBox: {
    borderWidth: 0.5,
    borderColor: C.rule,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    // Photos arrive pre-letterboxed to this box; contain is a safety net only.
    objectFit: 'contain',
  },
  badgePopular: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: C.ink,
    color: '#FFFFFF',
    fontSize: 5.5,
    fontWeight: 600,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    paddingVertical: 2.5,
    paddingHorizontal: 5,
  },
  badgeStock: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: C.red,
    color: C.red,
    fontSize: 5.5,
    fontWeight: 600,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    paddingVertical: 2,
    paddingHorizontal: 5,
  },
  cardTag: {
    marginTop: 7,
    fontSize: 6,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: C.gold,
  },
  cardName: {
    marginTop: 3,
    fontFamily: SERIF,
    fontWeight: 700,
    lineHeight: 1.25,
  },
  cardDescription: {
    marginTop: 4,
    fontSize: 6.8,
    lineHeight: 1.45,
    color: C.body,
  },
  cardPriceRow: {
    marginTop: 6,
    paddingTop: 5,
    borderTopWidth: 0.5,
    borderTopColor: C.rule,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  cardPrice: {
    fontWeight: 600,
  },
  cardPriceStrike: {
    marginLeft: 5,
    marginBottom: 1,
    fontSize: 7,
    color: C.muted,
    textDecoration: 'line-through',
  },
  cardSave: {
    marginLeft: 'auto',
    marginBottom: 1,
    fontSize: 6,
    fontWeight: 600,
    letterSpacing: 0.8,
    color: C.red,
    textTransform: 'uppercase',
  },

  // ── Promo banner ──────────────────────────────────────────────────
  banner: {
    marginTop: 8,
    marginBottom: 22,
    paddingVertical: 26,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  bannerImageWrap: {
    marginBottom: 14,
    alignItems: 'center',
  },
  bannerTitle: {
    fontFamily: SERIF,
    fontWeight: 700,
    fontSize: 20,
    textAlign: 'center',
  },
  bannerSubtitle: {
    marginTop: 6,
    fontSize: 8,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },

  // ── Watermarks ────────────────────────────────────────────────────
  pageWatermark: {
    position: 'absolute',
    top: '46%',
    left: -100,
    right: -100,
    alignItems: 'center',
    justifyContent: 'center',
    transform: 'rotate(-35deg)',
  },
  pageWatermarkText: {
    fontSize: 60,
    fontFamily: SERIF,
    fontWeight: 700,
    color: '#000000',
    opacity: 0.05,
    textTransform: 'uppercase',
    letterSpacing: 6,
  },
  imageWatermarkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWatermarkStack: {
    position: 'relative',
  },
  imageWatermarkStrokeText: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
