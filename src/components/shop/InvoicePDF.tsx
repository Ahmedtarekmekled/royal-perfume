import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { formatCurrency } from '@/lib/utils'; // Keep in mind this utils might not work in react-pdf if it uses DOM. Better to re-impl simple formatter or ensure utils is safe.

// Register fonts if needed, ignoring for now to keep it simple or use standard fonts.

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
    marginTop: 5,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingBottom: 5,
    marginBottom: 5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#CCCCCC',
    paddingBottom: 5,
    marginBottom: 5,
  },
  colName: { width: '50%' },
  colQty: { width: '15%', textAlign: 'center' },
  colPrice: { width: '15%', textAlign: 'right' },
  colTotal: { width: '20%', textAlign: 'right' },
  totalSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#000000',
    paddingTop: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 5,
  },
  totalLabel: {
    width: '30%',
    textAlign: 'right',
    paddingRight: 10,
  },
  totalValue: {
    width: '20%',
    textAlign: 'right',
  },
});

interface InvoicePDFProps {
  order: any; // Using any for simplicity here, but should match DB Type
  items: any[];
}

const formatPrice = (amount: number) => `$${Number(amount).toFixed(2)}`;

export default function InvoicePDF({ order, items }: InvoicePDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Royal Perfumes</Text>
          <Text style={styles.subtitle}>Order Invoice</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <View>
              <Text style={{ fontSize: 10, color: '#666' }}>Billed To:</Text>
              <Text>{order.customer_name}</Text>
              <Text>{order.customer_email}</Text>
              <Text>{order.customer_phone}</Text>
              <Text>{order.customer_address?.line1}</Text>
              <Text>{order.customer_address?.city}, {order.customer_address?.country}</Text>
            </View>
            <View>
              <Text style={{ fontSize: 10, color: '#666' }}>Order Details:</Text>
              <Text>Order ID: {order.id.slice(0, 8)}</Text>
              <Text>Date: {new Date(order.created_at).toLocaleDateString()}</Text>
              <Text>Status: {order.status}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.tableHeader}>
            <Text style={styles.colName}>Item</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colPrice}>Price</Text>
            <Text style={styles.colTotal}>Total</Text>
          </View>
          {items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.colName}>{item.products?.name || 'Product'}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{formatPrice(item.unit_price)}</Text>
              <Text style={styles.colTotal}>{formatPrice(item.unit_price * item.quantity)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalSection}>
           <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatPrice(order.total_amount - order.shipping_cost)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Shipping:</Text>
            <Text style={styles.totalValue}>{formatPrice(order.shipping_cost)}</Text>
          </View>
          <View style={[styles.totalRow, { marginTop: 5 }]}>
            <Text style={[styles.totalLabel, { fontWeight: 'bold' }]}>Total:</Text>
            <Text style={[styles.totalValue, { fontWeight: 'bold' }]}>{formatPrice(order.total_amount)}</Text>
          </View>
        </View>
        
        <View style={{ position: 'absolute', bottom: 30, left: 30, right: 30, borderTopWidth: 1, borderColor: '#EEE', paddingTop: 10 }}>
            <Text style={{ fontSize: 10, textAlign: 'center', color: '#888' }}>
                Thank you for choosing Royal Perfumes. For support, contact support@royalperfumes.com
            </Text>
        </View>
      </Page>
    </Document>
  );
}
