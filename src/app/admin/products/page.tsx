import { createClient } from '@/utils/supabase/server';
import { ProductsTable } from '@/components/admin/ProductsTable';
import BulkImport from '@/components/admin/BulkImport';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default async function ProductsPage() {
    const supabase = await createClient();
    const { data: products } = await supabase
        .from('products')
        .select('*, categories(name), brands(name)')
        .order('created_at', { ascending: false });

    // Flatten category and brand name for table
    const formattedProducts = (products || []).map(p => ({
        ...p,
        category: p.categories?.name,
        brand: p.brands?.name
    }));

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold font-playfair">Products</h1>
                <div className="flex items-center gap-2">
                    <Link href="/admin/products/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Product
                        </Button>
                    </Link>
                    <BulkImport />
                </div>
            </div>
            <ProductsTable data={formattedProducts} />
        </div>
    );
}
