import { getCustomers, getUnresolvedMergeConflicts } from './actions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PhoneActions from '@/components/admin/PhoneActions';

export const dynamic = 'force-dynamic';

export default async function CustomersPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const searchQuery = searchParams?.q as string | undefined;
  const page = Number(searchParams?.page) || 1;
  const limit = 20;

  const [{ data: customers, totalPages }, conflicts] = await Promise.all([
    getCustomers({ query: searchQuery, page, limit }),
    getUnresolvedMergeConflicts(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold font-heading">Customers</h1>
        </div>

        {/* Search Bar */}
        <form className="relative max-w-md w-full" action="/admin/customers" method="GET">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            name="q"
            placeholder="Search by name, email, phone, or order number..."
            className="pl-9 w-full bg-white"
            defaultValue={searchQuery || ''}
          />
        </form>
      </div>

      {conflicts.length > 0 && (
        <div className="border border-amber-200 bg-amber-50 rounded-md p-4 space-y-3">
          <div className="flex items-center gap-2 text-amber-800 font-medium">
            <AlertTriangle className="h-4 w-4" />
            {conflicts.length} customer{conflicts.length > 1 ? 's' : ''} need manual review
          </div>
          <p className="text-sm text-amber-700">
            A new order&apos;s email matched one existing customer while its phone matched a different one.
            Nothing was auto-merged — confirm whether these are the same person.
          </p>
          <div className="space-y-2">
            {conflicts.map((c: any) => (
              <div key={c.id} className="flex flex-wrap items-center gap-2 text-sm bg-white rounded border px-3 py-2">
                <span className="text-slate-500">Order attempt:</span>
                <span className="font-medium">{c.attempted_name}</span>
                <span className="text-slate-400">·</span>
                <span>{c.attempted_email}</span>
                <span className="text-slate-400">·</span>
                <span>{c.attempted_phone}</span>
                <span className="text-slate-400">matched</span>
                {c.email_customer && (
                  <Link href={`/admin/customers/${c.email_customer.id}`} className="text-blue-600 hover:underline">
                    {c.email_customer.name} (by email)
                  </Link>
                )}
                <span className="text-slate-400">and</span>
                {c.phone_customer && (
                  <Link href={`/admin/customers/${c.phone_customer.id}`} className="text-blue-600 hover:underline">
                    {c.phone_customer.name} (by phone)
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Last Order</TableHead>
              <TableHead>Customer Since</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers?.map((customer: any) => (
              <TableRow key={customer.id} className="cursor-pointer hover:bg-slate-50">
                <TableCell>
                  <Link href={`/admin/customers/${customer.id}`} className="font-medium text-slate-900 hover:underline">
                    {customer.name}
                  </Link>
                </TableCell>
                <TableCell className="text-sm text-slate-600">{customer.email || '—'}</TableCell>
                <TableCell className="text-sm text-slate-600">
                  {customer.phone ? <PhoneActions phone={customer.phone} /> : '—'}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{customer.stats.order_count} order{customer.stats.order_count === 1 ? '' : 's'}</Badge>
                </TableCell>
                <TableCell className="font-medium">${customer.stats.total_spent.toFixed(2)}</TableCell>
                <TableCell className="text-sm text-slate-600">
                  {customer.stats.last_order_at ? new Date(customer.stats.last_order_at).toLocaleDateString() : '—'}
                </TableCell>
                <TableCell className="text-sm text-slate-600">{new Date(customer.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
            {(!customers || customers.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24 text-slate-500">
                  No customers yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (() => {
        const baseParams = new URLSearchParams();
        if (searchQuery) baseParams.set('q', searchQuery);

        const hrefForPage = (p: number) => {
          const params = new URLSearchParams(baseParams);
          params.set('page', String(p));
          return `/admin/customers?${params.toString()}`;
        };

        return (
          <div className="flex items-center justify-center space-x-2">
            <Link href={hrefForPage(Math.max(1, page - 1))} className={page <= 1 ? 'pointer-events-none opacity-50' : ''}>
              <Button variant="outline" size="sm" disabled={page <= 1}>
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
            </Link>
            <span className="text-sm font-medium">
              Page {page} of {totalPages}
            </span>
            <Link href={hrefForPage(Math.min(totalPages, page + 1))} className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}>
              <Button variant="outline" size="sm" disabled={page >= totalPages}>
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        );
      })()}
    </div>
  );
}
