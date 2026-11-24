import { View, Text } from '@react-pdf/renderer';
import { catalogStyles as styles } from './catalogStyles';
import {
  CatalogImageWatermarkConfig,
  CatalogModelGroup,
  CatalogVisibleFields,
  CatalogGroupBy,
  CatalogProductsPerRow,
  groupAnchorId,
} from './types';
import CatalogProductCard from './CatalogProductCard';

interface CatalogProductGroupProps {
  group: CatalogModelGroup;
  index: number;
  groupBy: CatalogGroupBy;
  productsPerRow: CatalogProductsPerRow;
  pageBreak: boolean;
  visibleFields: CatalogVisibleFields;
  imagesByProductId: Map<string, string>;
  categoryNameById: Map<string, string>;
  brandNameById: Map<string, string>;
  imageWatermark: CatalogImageWatermarkConfig;
  imageWatermarkLogoSrc?: string;
  defaultWatermarkText: string;
}

export default function CatalogProductGroup({
  group,
  index,
  groupBy,
  productsPerRow,
  pageBreak,
  visibleFields,
  imagesByProductId,
  categoryNameById,
  brandNameById,
  imageWatermark,
  imageWatermarkLogoSrc,
  defaultWatermarkText,
}: CatalogProductGroupProps) {
  const renderCard = (product: CatalogModelGroup['products'][number]) => {
    // Show the *other* dimension as a tag — brand when grouped by category,
    // category when grouped by brand.
    const label =
      groupBy === 'category'
        ? (product.brand_id && brandNameById.get(product.brand_id)) || undefined
        : (product.category_id && categoryNameById.get(product.category_id)) || undefined;
    return (
      <CatalogProductCard
        key={product.id}
        product={product}
        imageSrc={imagesByProductId.get(product.id) || ''}
        groupLabel={label}
        perRow={productsPerRow}
        visibleFields={visibleFields}
        imageWatermark={imageWatermark}
        imageWatermarkLogoSrc={imageWatermarkLogoSrc}
        defaultWatermarkText={defaultWatermarkText}
      />
    );
  };

  // The heading and the first row of cards are one unbreakable block, so a
  // section title can never be stranded alone at the bottom of a page.
  const firstRow = group.products.slice(0, productsPerRow);
  const rest = group.products.slice(productsPerRow);

  return (
    <View break={pageBreak && index > 0}>
      <View wrap={false}>
        <View id={groupAnchorId(group.id)} style={styles.groupHeader}>
          <View style={{ flexShrink: 1, paddingRight: 12 }}>
            <Text style={styles.groupEyebrow}>
              {String(index + 1).padStart(2, '0')} · {groupBy === 'brand' ? 'Brand' : 'Collection'}
            </Text>
            <Text style={styles.groupHeading}>{group.name}</Text>
          </View>
          <Text style={styles.groupCount}>
            {group.products.length} {group.products.length === 1 ? 'item' : 'items'}
          </Text>
        </View>
        <View style={styles.grid}>{firstRow.map(renderCard)}</View>
      </View>
      {rest.length > 0 && <View style={styles.grid}>{rest.map(renderCard)}</View>}
    </View>
  );
}
