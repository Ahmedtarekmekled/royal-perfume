'use client';

import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoicePDF from '@/components/shop/InvoicePDF';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle, Loader2, XCircle, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Order, OrderItem } from '@/types';
import { cancelOrder, deleteOrder } from '@/app/admin/actions';

interface AdminOrderActionsProps {
  order: Order;
  items: OrderItem[];
}

export default function AdminOrderActions({ order, items }: AdminOrderActionsProps) {
  const [isClient, setIsClient] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Avoid document not defined errors from SSR
    const timer = setTimeout(() => setIsClient(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const handleAcceptOrder = async () => {
    try {
      setIsAccepting(true);

      // 1. Update Database Status to 'shipped' (maps to 'accepted' logic but respects DB constraints natively)
      const { error: dbError } = await supabase
        .from('orders')
        .update({ status: 'shipped' })
        .eq('id', order.id);

      if (dbError) throw dbError;

      // 2. Fetch API to send Acceptance Email
      if (order.customer_email) {
        const response = await fetch('/api/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'accepted',
            email: order.customer_email,
            orderId: order.id,
            customerName: order.customer_name,
          }),
        });

        if (!response.ok) {
           console.error('Failed to dispatch acceptance email via Resend API');
           toast.error('Order accepted, but failed to send email.');
        } else {
           toast.success('Order accepted & customer notified!');
        }
      } else {
        toast.success('Order accepted! (No email available to notify customer)');
      }

      router.refresh();
    } catch (error: any) {
      console.error('Accept Order Error:', error);
      toast.error('Failed to accept order.');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      setIsCancelling(true);
      await cancelOrder(order.id);
      toast.success('Order cancelled successfully.');
    } catch (error: any) {
      console.error('Cancel Order Error:', error);
      toast.error(error.message || 'Failed to cancel order.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!confirm('WARNING: This will permanently delete the order and all its items. This action cannot be undone. Are you sure?')) return;
    
    try {
      setIsDeleting(true);
      await deleteOrder(order.id);
      toast.success('Order permanently deleted.');
    } catch (error: any) {
      console.error('Delete Order Error:', error);
      toast.error(error.message || 'Failed to delete order.');
    } finally {
      setIsDeleting(false);
    }
  };

  const isAccepted = order.status === 'shipped' || order.status === 'delivered';

  return (
    <div className="flex items-center gap-2 mt-2">
      {/* 1. PDF Download */}
      {!isClient ? (
        <Button variant="outline" size="sm" disabled className="text-xs h-8">
          <Loader2 className="mr-2 h-3 w-3 animate-spin" /> Loading PDF...
        </Button>
      ) : (
        <PDFDownloadLink
          document={<InvoicePDF order={order} items={items} />}
          fileName={`invoice-${order.id.slice(0, 8)}.pdf`}
        >
          {({ loading }) => (
            <Button variant="outline" size="sm" disabled={loading} className="text-xs h-8 pl-2 pr-3">
              <FileText className="mr-1.5 h-3 w-3" />
              {loading ? 'Wait...' : 'PDF'}
            </Button>
          )}
        </PDFDownloadLink>
      )}

      {/* 2. Accept Order Button */}
      <Button
        variant={isAccepted ? "secondary" : "default"}
        size="sm"
        className="text-xs h-8 pl-2 pr-3"
        disabled={isAccepted || isAccepting}
        onClick={handleAcceptOrder}
      >
        {isAccepting ? (
          <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
        ) : (
          <CheckCircle className="mr-1.5 h-3 w-3" />
        )}
        {isAccepted ? 'Accepted' : 'Accept'}
      </Button>

      {/* 3. Cancel Order Button */}
      {order.status !== 'cancelled' && (
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-8 pl-2 pr-2 text-rose-600 border-rose-200 hover:bg-rose-50"
          disabled={isCancelling || isDeleting}
          onClick={handleCancelOrder}
          title="Cancel Order"
        >
          {isCancelling ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-4 w-4" />}
        </Button>
      )}

      {/* 4. Delete Order Button */}
      <Button
        variant="ghost"
        size="sm"
        className="text-xs h-8 pl-2 pr-2 text-slate-400 hover:text-red-600 hover:bg-red-50"
        disabled={isDeleting}
        onClick={handleDeleteOrder}
        title="Permanently Delete Order"
      >
         {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </Button>
    </div>
  );
}
