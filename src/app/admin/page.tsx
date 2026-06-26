import { createClient } from '@/utils/supabase/server';

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch pending orders count
  const { count: pendingOrdersCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  // Fetch total products count
  const { count: productsCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  // Fetch total categories count
  const { count: categoriesCount } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true });
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-heading">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Pending Orders</h3>
          <p className="text-3xl font-bold mt-2">{pendingOrdersCount || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
          <p className="text-3xl font-bold mt-2">{productsCount || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Total Categories</h3>
          <p className="text-3xl font-bold mt-2">{categoriesCount || 0}</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border h-96 flex items-center justify-center text-gray-400">
        Chart Placeholder
      </div>
    </div>
  );
}
