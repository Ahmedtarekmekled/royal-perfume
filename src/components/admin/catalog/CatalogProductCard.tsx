import { View, Text, Image } from '@react-pdf/renderer';
import { catalogStyles as styles, cardMetrics } from './catalogStyles';
import { Product } from '@/types';
import { CatalogImageWatermarkConfig, CatalogProductsPerRow, CatalogVisibleFields } from './types';

interface CatalogProductCardProps {
  product: Product;
  /** Pre-letterboxed to the card's exact aspect ratio (see prepareCatalogImages). */
  imageSrc: string;
  groupLabel?: string;
  perRow: CatalogProductsPerRow;
  visibleFields: CatalogVisibleFields;
  imageWatermark: CatalogImageWatermarkConfig;
  imageWatermarkLogoSrc?: string;
  /** Used when imageWatermark.text is left blank. */
  defaultWatermarkText: string;
}

export const formatPrice = (amount: number) =>
  `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// react-pdf's Text has no native outline/stroke — fake it by stacking the same
// string in the outline color at 4 diagonal offsets behind the real text.
const STROKE_OFFSETS: [number, number][] = [
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
];

function ImageWatermarkText({ config, text }: { config: CatalogImageWatermarkConfig; text: string }) {
  const baseTextStyle = {
    fontSize: config.fontSize,
    fontFamily: 'Inter',
    fontWeight: 600 as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    transform: 'rotate(-30deg)',
  };

  return (
    <View style={styles.imageWatermarkStack}>
      {config.strokeWidth > 0 &&
        STROKE_OFFSETS.map(([dx, dy]) => (
          <Text
            key={`${dx}-${dy}`}
            style={[
              styles.imageWatermarkStrokeText,
              baseTextStyle,
              {
                color: config.strokeColor,
                opacity: config.opacity,
                top: dy * config.strokeWidth,
                left: dx * config.strokeWidth,
              },
            ]}
          >
            {text}
          </Text>
        ))}
      <Text style={[baseTextStyle, { color: '#000000', opacity: config.opacity }]}>{text}</Text>
    </View>
  );
}

const clean = (s: string | null | undefined) => (s || '').replace(/\s+/g, ' ').trim();

export default function CatalogProductCard({
  product,
  imageSrc,
  groupLabel,
  perRow,
  visibleFields,
  imageWatermark,
  imageWatermarkLogoSrc,
  defaultWatermarkText,
}: CatalogProductCardProps) {
  const m = cardMetrics(perRow);
  // discount is stored as a flat amount, not a percentage — see ProductCard.tsx
  const hasDiscount = visibleFields.discount && product.discount > 0 && product.price > 0;
  const finalPrice = hasDiscount ? product.price - product.discount : product.price;
  const savePct = hasDiscount ? Math.round((product.discount / product.price) * 100) : 0;
  const showOutOfStock = visibleFields.stock && !product.stock;
  const showPopular = visibleFields.popular && product.is_popular;
  const description = clean(product.description_en);

  return (
    <View style={[styles.slot, { width: m.slotW }]} wrap={false}>
      <View style={[styles.imageBox, { width: m.imageW, height: m.imageH }]}>
        {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image is not an HTML img, no alt prop exists */}
        {imageSrc ? <Image src={imageSrc} style={styles.image} /> : null}
        {imageWatermark.mode === 'text' && (
          <View style={styles.imageWatermarkOverlay}>
            <ImageWatermarkText
              config={imageWatermark}
              text={(imageWatermark.text.trim() || defaultWatermarkText).toUpperCase()}
            />
          </View>
        )}
        {imageWatermark.mode === 'logo' && imageWatermarkLogoSrc && (
          <View style={styles.imageWatermarkOverlay}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image is not an HTML img, no alt prop exists */}
            <Image
              src={imageWatermarkLogoSrc}
              style={{ width: `${imageWatermark.logoSize}%`, objectFit: 'contain', opacity: imageWatermark.opacity }}
            />
          </View>
        )}
        {showPopular ? <Text style={styles.badgePopular}>Bestseller</Text> : null}
        {showOutOfStock ? <Text style={styles.badgeStock}>Sold out</Text> : null}
      </View>

      {visibleFields.category && groupLabel ? (
        <Text style={[styles.cardTag, { maxLines: 1, textOverflow: 'ellipsis' }]}>{groupLabel}</Text>
      ) : null}

      <Text
        style={[
          styles.cardName,
          // Always reserve two lines so prices line up across a row.
          { fontSize: m.nameSize, maxLines: 2, textOverflow: 'ellipsis', minHeight: m.nameSize * 1.25 * 2 },
          visibleFields.category && groupLabel ? {} : { marginTop: 7 },
        ]}
      >
        {clean(product.name_en)}
      </Text>

      {visibleFields.description ? (
        <Text
          style={[
            styles.cardDescription,
            { maxLines: m.descLines, textOverflow: 'ellipsis', minHeight: 6.8 * 1.45 * m.descLines },
          ]}
        >
          {description}
        </Text>
      ) : null}

      {visibleFields.price ? (
        <View style={styles.cardPriceRow}>
          <Text style={[styles.cardPrice, { fontSize: m.priceSize }]}>
            {product.price > 0 ? formatPrice(finalPrice) : 'Price on request'}
          </Text>
          {hasDiscount ? <Text style={styles.cardPriceStrike}>{formatPrice(product.price)}</Text> : null}
          {savePct > 0 ? <Text style={styles.cardSave}>-{savePct}%</Text> : null}
        </View>
      ) : null}
    </View>
  );
}
