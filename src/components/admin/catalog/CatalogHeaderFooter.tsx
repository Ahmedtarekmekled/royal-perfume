import { View, Text, Image } from '@react-pdf/renderer';
import { catalogStyles as styles } from './catalogStyles';
import { CatalogHeaderFooterConfig } from './types';

export function CatalogHeader({
  headerFooter,
  companyName,
  title,
}: {
  headerFooter: CatalogHeaderFooterConfig;
  companyName: string;
  title: string;
}) {
  return (
    <View style={styles.headerRow} fixed>
      <View style={styles.headerBrand}>
        {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image is not an HTML img, no alt prop exists */}
        {headerFooter.logoUrl ? <Image src={headerFooter.logoUrl} style={styles.headerLogo} /> : null}
        <Text style={styles.headerCompany}>{companyName || 'Royal Perfumes'}</Text>
      </View>
      <Text style={styles.headerTitle}>{title || 'Product Catalog'}</Text>
    </View>
  );
}

export function CatalogFooter({ headerFooter }: { headerFooter: CatalogHeaderFooterConfig }) {
  const contact = [headerFooter.website, headerFooter.phone, headerFooter.email, headerFooter.social]
    .filter(Boolean)
    .join('   ·   ');

  return (
    <View style={styles.footerRow} fixed>
      <View style={{ flexShrink: 1, paddingRight: 12 }}>
        {contact ? <Text style={styles.footerText}>{contact}</Text> : null}
        {headerFooter.copyrightText ? (
          <Text style={[styles.footerText, contact ? { marginTop: 2, fontSize: 5.5 } : {}]}>{headerFooter.copyrightText}</Text>
        ) : null}
      </View>
      <Text
        style={styles.footerPage}
        render={({ pageNumber, totalPages }) => `${String(pageNumber).padStart(2, '0')} / ${String(totalPages).padStart(2, '0')}`}
        fixed
      />
    </View>
  );
}
