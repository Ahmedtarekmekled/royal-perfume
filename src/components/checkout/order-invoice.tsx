import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font} from '@react-pdf/renderer';
import { CartItem } from '@/hooks/use-cart';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 11,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 30,
    borderBottom: 2,
    borderBottomColor: '#000000',
    paddingBottom: 20,
  },
  logo: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    color: '#000000',
    letterSpacing: 1,
    marginBottom: 5,
  },
  tagline: {
    fontSize: 10,
    color: '#666666',
    letterSpacing: 0.5,
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  orderNumber: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
  },
  orderDate: {
    fontSize: 10,
    color: '#666666',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 10,
    color: '#000000',
    letterSpacing: 0.5,
  },
  customerDetails: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#333333',
  },
  table: {
    marginBottom: 25,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    padding: 10,
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: '#ffffff',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: 1,
    borderBottomColor: '#e0e0e0',
    padding: 10,
    fontSize: 10,
  },
  col1: { width: '50%' },
  col2: { width: '15%', textAlign: 'center' },
  col3: { width: '17.5%', textAlign: 'right' },
  col4: { width: '17.5%', textAlign: 'right' },
  totals: {
    marginTop: 20,
    marginBottom: 30,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
    fontSize: 11,
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    marginTop: 10,
    borderTop: 2,
    borderTopColor: '#000000',
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 50,
    right: 50,
    textAlign: 'center',
    fontSize: 9,
    color: '#666666',
    borderTop: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 15,
  },
});

interface OrderInvoiceProps {
  data: {
    customer: {
      name: string;
      email: string;
      phone: string;
      city: string;
      address: string;
      postal_code: string;
    };
    items: CartItem[];
    subtotal: number;
    shippingFee: number;
    total: number;
    currency: string;
    orderNumber: string;
    date: string;
  };
}

const OrderInvoice: React.FC<OrderInvoiceProps> = ({ data }) => {
  const currencySymbol = data.currency === 'USD' ? '$' : '€';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>ROYAL PERFUMES</Text>
          <Text style={styles.tagline}>Luxury Fragrances</Text>
        </View>

        {/* Order Info */}
        <View style={styles.orderInfo}>
          <View>
            <Text style={styles.orderNumber}>Order #{data.orderNumber}</Text>
            <Text style={styles.orderDate}>{data.date}</Text>
          </View>
          <View>
            <Text style={styles.orderNumber}>Invoice</Text>
          </View>
        </View>

        {/* Customer Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CUSTOMER INFORMATION</Text>
          <View style={styles.customerDetails}>
            <Text>{data.customer.name}</Text>
            <Text>{data.customer.email}</Text>
            <Text>{data.customer.phone}</Text>
            <Text>{data.customer.address}</Text>
            <Text>{data.customer.city}, {data.customer.postal_code}</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>ITEM</Text>
            <Text style={styles.col2}>QTY</Text>
            <Text style={styles.col3}>UNIT PRICE</Text>
            <Text style={styles.col4}>TOTAL</Text>
          </View>
          {data.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.col1}>{item.name}</Text>
              <Text style={styles.col2}>{item.quantity}</Text>
              <Text style={styles.col3}>{currencySymbol}{item.price.toFixed(2)}</Text>
              <Text style={styles.col4}>
                {currencySymbol}{(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>{currencySymbol}{data.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Shipping Fee</Text>
            <Text>{currencySymbol}{data.shippingFee.toFixed(2)}</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text>GRAND TOTAL</Text>
            <Text>{currencySymbol}{data.total.toFixed(2)} {data.currency}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for your order!</Text>
          <Text style={{ marginTop: 5 }}>
            Royal Perfumes - Essence of Royalty
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default OrderInvoice;
