import { Page, View, Text, Image } from '@react-pdf/renderer';
import { catalogStyles as styles } from './catalogStyles';
import { CatalogCoverConfig, CatalogGroupBy, CatalogWatermarkLine } from './types';
import CatalogPageWatermark from './CatalogWatermark';

/** The cover photo is letterboxed to this box (see COVER_IMAGE_SIZE), so it is never cropped. */
export const COVER_IMAGE_BOX = { width: 360, height: 200 };

interface CatalogCoverPageProps {
  cover: CatalogCoverConfig;
  groupBy: CatalogGroupBy;
  totalProductCount: number;
  groupCount: number;
  watermarkLines: CatalogWatermarkLine[];
}

export default function CatalogCoverPage({ cover, groupBy, totalProductCount, groupCount, watermarkLines }: CatalogCoverPageProps) {
  const generatedDate = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  const contactLine = [cover.phone, cover.email, cover.website].filter(Boolean).join('   ·   ');
  const eyebrow = cover.seasonName || `Collection ${new Date().getFullYear()}`;
  const groupLabel = groupBy === 'brand' ? (groupCount === 1 ? 'Brand' : 'Brands') : groupCount === 1 ? 'Category' : 'Categories';

  return (
    <Page size="A4" style={styles.coverPage}>
      <CatalogPageWatermark lines={watermarkLines} defaultText={cover.companyName || 'ROYAL PERFUMES'} />
      <View style={styles.coverFrame} fixed />
      <View style={styles.coverFrameInner} fixed />

      <View style={styles.coverBody}>
        {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image is not an HTML img, no alt prop exists */}
        {cover.logoUrl ? <Image src={cover.logoUrl} style={styles.coverLogo} /> : null}

        <Text style={styles.coverEyebrow}>{eyebrow}</Text>
        <Text style={styles.coverTitle}>{cover.title || 'Product Catalog'}</Text>
        <View style={styles.coverRule} />
        {cover.subtitle ? <Text style={styles.coverSubtitle}>{cover.subtitle}</Text> : null}
        {cover.description ? <Text style={styles.coverDescription}>{cover.description}</Text> : null}

        {cover.coverImageUrl ? (
          <View style={styles.coverImageWrap}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image is not an HTML img, no alt prop exists */}
            <Image src={cover.coverImageUrl} style={COVER_IMAGE_BOX} />
          </View>
        ) : null}

        <View style={styles.coverStats}>
          <View style={styles.coverStat}>
            <Text style={styles.coverStatValue}>{totalProductCount.toLocaleString('en-US')}</Text>
            <Text style={styles.coverStatLabel}>{totalProductCount === 1 ? 'Fragrance' : 'Fragrances'}</Text>
          </View>
          <View style={styles.coverStatDivider} />
          <View style={styles.coverStat}>
            <Text style={styles.coverStatValue}>{groupCount}</Text>
            <Text style={styles.coverStatLabel}>{groupLabel}</Text>
          </View>
        </View>
      </View>

      <View style={styles.coverBand}>
        <Text style={styles.coverBandCompany}>{cover.companyName || 'Royal Perfumes'}</Text>
        {cover.address ? <Text style={styles.coverBandLine}>{cover.address}</Text> : null}
        {contactLine ? <Text style={styles.coverBandLine}>{contactLine}</Text> : null}
        {cover.social ? <Text style={styles.coverBandLine}>{cover.social}</Text> : null}
        <Text style={styles.coverBandDate}>{generatedDate}</Text>
      </View>
    </Page>
  );
}
