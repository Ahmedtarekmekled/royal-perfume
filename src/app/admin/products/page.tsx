import { createClient } from '@/utils/supabase/server';
import { ProductsTable } from '@/components/admin/ProductsTable';
import BulkImport from '@/components/admin/BulkImport';

export default async function ProductsPage() {
    const supabase = await createClient();
    const { data: products } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('created_at', { ascending: false });

    // Flatten category name for table
    const formattedProducts = (products || []).map(p => ({
        ...p,
        category: p.categories?.name
    }));

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold font-playfair">Products</h1>
                <BulkImport />
            </div>
            <ProductsTable data={formattedProducts} />
        </div>
    );
}
