import { pdf } from '@react-pdf/renderer';
import OrderInvoice from '@/components/checkout/order-invoice';
import { CartItem } from '@/hooks/use-cart';

interface InvoiceData {
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
}

export async function generateInvoice(orderData: InvoiceData) {
  try {
    // Create PDF document
    const blob = await pdf(<OrderInvoice data={orderData} />).toBlob();

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Order_Royal_${orderData.customer.name.replace(/\s+/g, '_')}.pdf`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}
