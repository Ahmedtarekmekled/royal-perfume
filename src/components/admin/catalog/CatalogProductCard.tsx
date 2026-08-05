import { View, Text, Image } from '@react-pdf/renderer';
import { catalogStyles as styles } from './catalogStyles';
import { Product } from '@/types';
import { CatalogVisibleFields } from './types';

interface CatalogProductCardProps {
  product: Product;
  imageSrc: string;
  groupLabel?: string;
  visibleFields: CatalogVisibleFields;
}

const formatPrice = (amount: number) => `$${amount.toFixed(2)}`;

export default function CatalogProductCard({
  product,
  imageSrc,
  groupLabel,
  visibleFields,
}: CatalogProductCardProps) {
  // discount is stored as a flat amount, not a percentage — see ProductCard.tsx
  const hasDiscount = visibleFields.discount && product.discount > 0;
  const finalPrice = hasDiscount ? product.price - product.discount : product.price;
  const showOutOfStock = visibleFields.stock && !product.stock;
  const showPopular = visibleFields.popular && product.is_popular;

  return (
    <View style={styles.card} wrap={false}>
      <View style={styles.cardImageWrap}>
        {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image is not an HTML img, no alt prop exists */}
        <Image src={imageSrc} style={styles.cardImage} />
      </View>

      <Text style={styles.cardName}>{product.name_en}</Text>

      {visibleFields.category && groupLabel ? <Text style={styles.cardTag}>{groupLabel}</Text> : null}

      {showPopular || showOutOfStock ? (
        <View style={styles.cardBadgeRow}>
          {showPopular ? <Text style={styles.cardBadgePopular}>★ Popular</Text> : null}
          {showOutOfStock ? <Text style={styles.cardBadgeOutOfStock}>Out of Stock</Text> : null}
        </View>
      ) : null}

      {visibleFields.description && product.description_en ? (
        <Text style={styles.cardDescription}>
          {product.description_en.length > 140
            ? `${product.description_en.slice(0, 140)}…`
            : product.description_en}
        </Text>
      ) : null}

      {visibleFields.price ? (
        <View style={styles.cardPriceRow}>
          {hasDiscount ? <Text style={styles.cardPriceStrike}>{formatPrice(product.price)}</Text> : null}
          <Text style={styles.cardPrice}>{formatPrice(finalPrice)}</Text>
        </View>
      ) : null}
    </View>
  );
}
