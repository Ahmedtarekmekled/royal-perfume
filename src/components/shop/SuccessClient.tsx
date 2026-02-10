"use client";

import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoicePDF from './InvoicePDF';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Order, OrderItem } from '@/types';

interface SuccessClientProps {
  order: Order;
  items: OrderItem[];
}

export default function SuccessClient({ order, items }: SuccessClientProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Use setTimeout to avoid synchronous setState warning
    const timer = setTimeout(() => setIsClient(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!isClient) {
    return (
       <Button variant="outline" size="lg" disabled>
          <Download className="mr-2 h-4 w-4" /> Loading Options...
       </Button>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <PDFDownloadLink
        document={<InvoicePDF order={order} items={items} />}
        fileName={`invoice-${order.id.slice(0, 8)}.pdf`}
      >
        {({ loading }) => (
          <Button variant="outline" size="lg" disabled={loading} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            {loading ? 'Generating Invoice...' : 'Download Invoice'}
          </Button>
        )}
      </PDFDownloadLink>

      <Button 
        size="lg" 
        className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
        onClick={() => {
            const message = `Hello, I placed order #${order.id.slice(0, 8)}.\nTotal: ${formatCurrency(order.total_amount)}\nPlease confirm logic.`;
            const encodedMessage = encodeURIComponent(message);
            window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
        }}
      >
        Send to WhatsApp
      </Button>
    </div>
  );
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
