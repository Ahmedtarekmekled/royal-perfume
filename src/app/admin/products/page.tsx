import { createClient } from '@/utils/supabase/server';
import BulkImport from '@/components/admin/BulkImport';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';


// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const supabase = await createClient();
  
  const { data: products, error } = await supabase
    .from('products')
    .select('*, categories(name)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-heading">Products</h1>
        <div className="flex items-center gap-2">
            <BulkImport />
            <Link href="/admin/products/new">
            <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Product
            </Button>
            </Link>
        </div>
      </div>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.map((product: any) => (
              <TableRow key={product.id}>
                <TableCell>
                  {product.images && product.images[0] && (
                    <div className="relative h-10 w-10">
                      <Image 
                        src={product.images[0]} 
                        alt={product.name} 
                        fill
                        className="object-cover rounded-md bg-gray-100"
                        sizes="40px"
                      />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.categories?.name || '-'}</TableCell>
                <TableCell>
                  ${product.price}
                  {product.discount > 0 && (
                     <span className="ml-2 text-xs text-red-500 line-through">${product.price + product.discount}</span>
                  )}
                </TableCell>
                <TableCell>
                  {product.stock ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      In Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Out of Stock
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {product.is_active ? 'Yes' : 'No'}
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/admin/products/${product.id}`}>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {(!products || products.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24 text-gray-500">
                  No products found. Add your first one!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
