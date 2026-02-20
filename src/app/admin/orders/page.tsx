import { createClient } from '@/utils/supabase/server';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import AdminOrderActions from './AdminOrderActions';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function OrdersPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const statusFilter = searchParams?.status as string | undefined;
  const searchQuery = searchParams?.q as string | undefined;

  const supabase = await createClient();
  
  let query = supabase
    .from('orders')
    .select('*, order_items(*, products(name_en))')
    .order('created_at', { ascending: false });

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  if (searchQuery) {
    query = query.or(`id.ilike.%${searchQuery}%,customer_name.ilike.%${searchQuery}%,customer_email.ilike.%${searchQuery}%`);
  }

  const { data: orders, error } = await query;

  if (error) {
    console.error('Error fetching orders:', error);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold font-heading">Orders</h1>
        
        {/* Simple Status Filters */}
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/orders">
            <Button variant={!statusFilter || statusFilter === 'all' ? 'default' : 'outline'} size="sm">
              All Orders
            </Button>
          </Link>
          <Link href="/admin/orders?status=pending">
            <Button variant={statusFilter === 'pending' ? 'default' : 'outline'} size="sm" className="text-amber-600 border-amber-200">
              Pending
            </Button>
          </Link>
          <Link href="/admin/orders?status=shipped">
            <Button variant={statusFilter === 'shipped' ? 'default' : 'outline'} size="sm" className="text-emerald-600 border-emerald-200">
              Shipped
            </Button>
          </Link>
          <Link href="/admin/orders?status=cancelled">
            <Button variant={statusFilter === 'cancelled' ? 'default' : 'outline'} size="sm" className="text-rose-600 border-rose-200">
              Cancelled
            </Button>
          </Link>
        </div>

        {/* Search Bar */}
        <form className="relative max-w-md w-full" action="/admin/orders" method="GET">
           {/* Preserve existing status filter if searching */}
           {statusFilter && statusFilter !== 'all' && (
             <input type="hidden" name="status" value={statusFilter} />
           )}
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
           <Input 
              name="q"
              placeholder="Search by name, email, or order ID..." 
              className="pl-9 w-full bg-white"
              defaultValue={searchQuery || ''}
           />
        </form>
      </div>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.map((order: any) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}...</TableCell>
                <TableCell>
                    <div className="flex flex-col">
                        <span className="font-medium text-slate-900">{order.customer_name}</span>
                        <span className="text-xs text-slate-500">{order.customer_email || order.customer_phone}</span>
                    </div>
                </TableCell>
                <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                <TableCell className="capitalize">
                    {order.status === 'shipped' || order.status === 'delivered' ? (
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 shadow-sm border">
                        Shipped
                      </Badge>
                    ) : order.status === 'cancelled' ? (
                      <Badge variant="destructive" className="shadow-sm">
                        Cancelled
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50 shadow-sm">
                        Pending
                      </Badge>
                    )}
                </TableCell>
                <TableCell className="text-right">
                    <AdminOrderActions order={order} items={order.order_items || []} />
                </TableCell>
              </TableRow>
            ))}
            {(!orders || orders.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-slate-500">
                  No orders yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
