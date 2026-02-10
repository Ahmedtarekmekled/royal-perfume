import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { deleteShippingZone, createShippingZone } from '../actions';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ShippingPage() {
  const supabase = await createClient();
  
  const { data: zones, error } = await supabase
    .from('shipping_zones')
    .select('*')
    .order('country', { ascending: true });

  async function addZone(formData: FormData) {
    'use server';
    const country = formData.get('country') as string;
    const price = parseFloat(formData.get('price') as string);
    if (!country || isNaN(price)) return;
    
    await createShippingZone({ country, price });
  }

  async function deleteZone(formData: FormData) {
      'use server';
      const id = formData.get('id') as string;
      await deleteShippingZone(id);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-heading">Shipping Zones</h1>

      {/* Simple Add Form */}
      <div className="bg-white p-6 rounded-lg border max-w-xl">
        <h2 className="text-lg font-medium mb-4">Add New Zone</h2>
        <form action={addZone} className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Country</label>
                <Input name="country" placeholder="e.g. UAE" required />
            </div>
            <div className="w-32 space-y-2">
                <label className="text-sm font-medium">Price ($)</label>
                <Input name="price" type="number" placeholder="20.00" step="0.01" required />
            </div>
            <Button type="submit">
                <Plus className="h-4 w-4 mr-2" />
                Add
            </Button>
        </form>
      </div>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Country</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {zones?.map((zone: any) => (
              <TableRow key={zone.id}>
                <TableCell className="font-medium">{zone.country}</TableCell>
                <TableCell>${zone.price}</TableCell>
                <TableCell className="text-right">
                    <form action={deleteZone}>
                        <input type="hidden" name="id" value={zone.id} />
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </form>
                </TableCell>
              </TableRow>
            ))}
            {(!zones || zones.length === 0) && (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-24 text-gray-500">
                  No shipping zones configured.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
