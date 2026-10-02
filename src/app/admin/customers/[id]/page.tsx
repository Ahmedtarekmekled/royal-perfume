import { getCustomerById } from '../actions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Phone, Calendar } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import CustomerNotes from './CustomerNotes';
import PhoneActions from '@/components/admin/PhoneActions';
import type { Order } from '@/types';

type OrderSummary = Pick<Order, 'id' | 'created_at' | 'total_amount' | 'status'>;

export const dynamic = 'force-dynamic';

export default async function CustomerDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const result = await getCustomerById(id);

  if (!result) notFound();

  const { customer, stats, orders } = result;

  return (
    <div className="space-y-6">
      <Link href="/admin/customers" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to Customers
      </Link>

      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold font-heading">{customer.name}</h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-sm text-slate-500">
          {customer.email && (
            <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {customer.email}</span>
          )}
          {customer.phone && (
            <span className="inline-flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" />
              <PhoneActions phone={customer.phone} className="hover:underline hover:text-slate-900" />
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> Customer since {new Date(customer.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-xs font-medium text-gray-500 uppercase">Orders</h3>
          <p className="text-2xl font-bold mt-1">{stats.order_count}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-xs font-medium text-gray-500 uppercase">Total Spent</h3>
          <p className="text-2xl font-bold mt-1">${stats.total_spent.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-xs font-medium text-gray-500 uppercase">First Order</h3>
          <p className="text-sm font-medium mt-1">{stats.first_order_at ? new Date(stats.first_order_at).toLocaleDateString() : '—'}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-xs font-medium text-gray-500 uppercase">Last Order</h3>
          <p className="text-sm font-medium mt-1">{stats.last_order_at ? new Date(stats.last_order_at).toLocaleDateString() : '—'}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Notes</h3>
        <CustomerNotes customerId={customer.id} initialNotes={customer.notes} />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Order History</h2>
        <div className="border rounded-md bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order: OrderSummary) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">
                    <Link href={`/admin/orders?q=${order.id}`} className="text-blue-600 hover:underline">
                      {order.id.slice(0, 8)}...
                    </Link>
                  </TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                  <TableCell className="capitalize">
                    {order.status === 'shipped' || order.status === 'delivered' ? (
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 shadow-sm border">
                        Shipped
                      </Badge>
                    ) : order.status === 'cancelled' ? (
                      <Badge variant="destructive" className="shadow-sm">Cancelled</Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50 shadow-sm">Pending</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24 text-slate-500">
                    No orders yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
