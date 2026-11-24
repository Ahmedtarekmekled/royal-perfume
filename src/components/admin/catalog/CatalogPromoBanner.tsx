import { View, Text, Image } from '@react-pdf/renderer';
import { catalogStyles as styles } from './catalogStyles';
import { CatalogBanner, CATALOG_COLORS } from './types';

/** Banner photos are letterboxed to this box onto the banner color, so they're never cropped. */
export const BANNER_IMAGE_BOX = { width: 440, height: 180 };

/** Light text on dark banner colors, dark text on light ones. */
export function isDarkColor(hex: string): boolean {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b < 140;
}

interface CatalogPromoBannerProps {
  banner: CatalogBanner;
  imageSrc?: string;
}

export default function CatalogPromoBanner({ banner, imageSrc }: CatalogPromoBannerProps) {
  const bg = banner.backgroundColor || CATALOG_COLORS.soft;
  const dark = isDarkColor(bg);

  return (
    <View style={[styles.banner, { backgroundColor: bg }]} wrap={false}>
      {imageSrc ? (
        <View style={styles.bannerImageWrap}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image is not an HTML img, no alt prop exists */}
          <Image src={imageSrc} style={BANNER_IMAGE_BOX} />
        </View>
      ) : null}
      {banner.title ? (
        <Text style={[styles.bannerTitle, { color: dark ? '#FFFFFF' : CATALOG_COLORS.ink }]}>{banner.title}</Text>
      ) : null}
      {banner.subtitle ? (
        <Text style={[styles.bannerSubtitle, { color: dark ? '#D6D3CE' : CATALOG_COLORS.body }]}>{banner.subtitle}</Text>
      ) : null}
    </View>
  );
}
