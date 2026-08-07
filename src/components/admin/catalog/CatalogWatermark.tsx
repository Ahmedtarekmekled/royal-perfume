import { View, Text } from '@react-pdf/renderer';
import { catalogStyles as styles } from './catalogStyles';

/**
 * Faint diagonal "ROYAL PERFUMES" mark. Rendered with `fixed` so react-pdf
 * repeats it on every physical page auto-generated from a single logical
 * <Page> — same mechanism CatalogHeader/CatalogFooter use.
 */
export default function CatalogPageWatermark() {
  return (
    <View style={styles.pageWatermark} fixed>
      <Text style={styles.pageWatermarkText}>ROYAL PERFUMES</Text>
    </View>
  );
}
