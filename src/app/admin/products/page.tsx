import { getCachedAdminCategories, getCachedAdminBrands } from '@/lib/admin-data';
import { getProducts } from '../actions';
import { ProductsTable } from '@/components/admin/ProductsTable';
import BulkImport from '@/components/admin/BulkImportLazy';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

// Already dynamically rendered (the cookie-scoped Supabase server client
// used by getProducts() opts the route out of static rendering automatically,
// same as every other admin list page) — no explicit `export const dynamic`
// needed, and that name would collide with the `dynamic` import above anyway.

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function toBoolArray(value: string | string[] | undefined): ('true' | 'false')[] {
  return toArray(value).filter((v): v is 'true' | 'false' => v === 'true' || v === 'false');
}

interface ProductsSearchParams {
  q?: string;
  category?: string | string[];
  brand?: string | string[];
  stock?: string | string[];
  active?: string | string[];
  popular?: string | string[];
  sort?: string;
  dir?: string;
  page?: string;
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<ProductsSearchParams> }) {
    const params = await searchParams;

    const filters = {
        q: params.q || '',
        categoryIds: toArray(params.category),
        brandIds: toArray(params.brand),
        stock: toBoolArray(params.stock),
        active: toBoolArray(params.active),
        popular: toBoolArray(params.popular),
        sort: (params.sort === 'name_en' || params.sort === 'price' ? params.sort : 'created_at') as 'name_en' | 'price' | 'created_at',
        dir: (params.dir === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc',
        page: Math.max(1, Number(params.page) || 1),
    };
    const limit = 10;

    const [{ data: products, totalCount, totalPages }, categories, brands] = await Promise.all([
        getProducts({
            query: filters.q,
            categoryIds: filters.categoryIds,
            brandIds: filters.brandIds,
            stock: filters.stock,
            active: filters.active,
            popular: filters.popular,
            sortBy: filters.sort,
            sortDir: filters.dir,
            page: filters.page,
            limit,
        }),
        getCachedAdminCategories(),
        getCachedAdminBrands(),
    ]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-baseline gap-3">
                    <h1 className="text-3xl font-bold font-playfair">Products</h1>
                    <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        {totalCount} total
                    </span>
                </div>
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
            <ProductsTable
                data={products}
                categories={categories}
                brands={brands}
                totalPages={totalPages}
                currentPage={filters.page}
                filters={filters}
            />
        </div>
    );
}
