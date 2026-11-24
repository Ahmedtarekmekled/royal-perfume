import { Page, View, Text, Link } from '@react-pdf/renderer';
import { catalogStyles as styles } from './catalogStyles';
import { CatalogHeaderFooterConfig, CatalogModelGroup, CatalogWatermarkLine, groupAnchorId } from './types';
import CatalogPageWatermark from './CatalogWatermark';
import { CatalogFooter, CatalogHeader } from './CatalogHeaderFooter';

interface CatalogTOCProps {
  groups: CatalogModelGroup[];
  watermarkLines: CatalogWatermarkLine[];
  defaultWatermarkText: string;
  headerFooter: CatalogHeaderFooterConfig;
  companyName: string;
  title: string;
}

// Real internal PDF links to each group's heading — not page-numbered,
// since react-pdf has no first-class way to know a link target's future
// physical page number during a single-pass render.
export default function CatalogTOC({ groups, watermarkLines, defaultWatermarkText, headerFooter, companyName, title }: CatalogTOCProps) {
  return (
    <Page size="A4" style={styles.page}>
      <CatalogPageWatermark lines={watermarkLines} defaultText={defaultWatermarkText} />
      <CatalogHeader headerFooter={headerFooter} companyName={companyName} title={title} />
      <CatalogFooter headerFooter={headerFooter} />

      <Text style={styles.tocEyebrow}>Inside this catalog</Text>
      <Text style={styles.tocTitle}>Contents</Text>
      <View style={styles.tocRule} />

      {groups.map((group, i) => (
        <Link key={group.id} src={`#${groupAnchorId(group.id)}`} style={styles.tocRow}>
          <Text style={styles.tocIndex}>{String(i + 1).padStart(2, '0')}</Text>
          <Text style={styles.tocName}>{group.name}</Text>
          <Text style={styles.tocCount}>
            {group.products.length} {group.products.length === 1 ? 'item' : 'items'}
          </Text>
        </Link>
      ))}
    </Page>
  );
}
