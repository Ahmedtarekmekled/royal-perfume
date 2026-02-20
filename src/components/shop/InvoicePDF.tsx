import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'extrabold',
    textTransform: 'uppercase',
    color: '#000000',
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 10,
    color: '#888888',
    marginTop: 4,
    marginBottom: 20,
  },
  thickDivider: {
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    marginBottom: 20,
  },
  invoiceMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metaLeft: {
    flexDirection: 'column',
  },
  metaRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  boldText: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 2,
  },
  normalText: {
    fontSize: 10,
    color: '#444444',
  },
  customerSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#000000',
    marginBottom: 10,
  },
  customerText: {
    fontSize: 10,
    color: '#333333',
    lineHeight: 1.5,
  },
  table: {
    width: '100%',
    marginBottom: 20,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  tableHeaderCol: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  colItem: { width: '50%' },
  colQty: { width: '15%', textAlign: 'center' },
  colPrice: { width: '15%', textAlign: 'right' },
  colTotal: { width: '20%', textAlign: 'right' },
  rowText: {
    fontSize: 10,
    color: '#000000',
  },
  totalsContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginTop: 10,
    width: '100%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
    width: '100%',
  },
  totalLabel: {
    width: 60,
    fontSize: 10,
    color: '#000000',
    textAlign: 'left',
  },
  totalValue: {
    width: 80,
    fontSize: 10,
    color: '#000000',
    textAlign: 'right',
  },
  grandTotalDivider: {
    borderTopWidth: 2,
    borderTopColor: '#000000',
    marginTop: 4,
    paddingTop: 12,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  grandTotalLabel: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    color: '#000000',
    textTransform: 'uppercase',
  },
  grandTotalValue: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    color: '#000000',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 10,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 9,
    color: '#666666',
    marginBottom: 4,
  }
});

interface InvoicePDFProps {
  order: any;
  items: any[];
}

const formatPrice = (amount: number) => {
  return `$${Number(amount).toFixed(2)}`;
};

export default function InvoicePDF({ order, items }: InvoicePDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>ROYAL PERFUMES</Text>
          <Text style={styles.subtitle}>Luxury Fragrances</Text>
        </View>
        <View style={styles.thickDivider} />

        {/* Invoice Meta */}
        <View style={styles.invoiceMetaRow}>
          <View style={styles.metaLeft}>
             <Text style={styles.boldText}>Order #{order.id.replace(/-/g, '').slice(0, 15).toUpperCase()}</Text>
             <Text style={styles.normalText}>{new Date(order.created_at).toLocaleDateString()}</Text>
          </View>
          <View style={styles.metaRight}>
             <Text style={styles.boldText}>Invoice</Text>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.customerSection}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <Text style={styles.customerText}>{order.customer_name}</Text>
          {order.customer_email && <Text style={styles.customerText}>{order.customer_email}</Text>}
          <Text style={styles.customerText}>{order.customer_phone}</Text>
          {order.customer_address?.line1 && <Text style={styles.customerText}>{order.customer_address.line1}</Text>}
          {order.customer_address?.city && (
            <Text style={styles.customerText}>{order.customer_address.city}, {order.customer_address.country} {order.customer_address.postal_code || ''}</Text>
          )}
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderCol, styles.colItem]}>ITEM</Text>
            <Text style={[styles.tableHeaderCol, styles.colQty]}>QTY</Text>
            <Text style={[styles.tableHeaderCol, styles.colPrice]}>UNIT PRICE</Text>
            <Text style={[styles.tableHeaderCol, styles.colTotal]}>TOTAL</Text>
          </View>

          {items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.rowText, styles.colItem]}>{(item.products?.name_en || 'Product').toUpperCase()}</Text>
              <Text style={[styles.rowText, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.rowText, styles.colPrice]}>{formatPrice(item.unit_price)}</Text>
              <Text style={[styles.rowText, styles.colTotal]}>{formatPrice(item.unit_price * item.quantity)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsContainer}>
           <View style={{ width: '50%' }}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalValue}>{formatPrice(order.total_amount - order.shipping_cost)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Shipping Fee</Text>
                <Text style={styles.totalValue}>{formatPrice(order.shipping_cost)}</Text>
              </View>

              <View style={styles.grandTotalDivider}>
                <Text style={styles.grandTotalLabel}>Grand Total</Text>
                <Text style={styles.grandTotalValue}>{formatPrice(order.total_amount)} USD</Text>
              </View>
           </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for your order!</Text>
          <Text style={styles.footerText}>Royal Perfumes - Essence of Royalty</Text>
        </View>

      </Page>
    </Document>
  );
}
