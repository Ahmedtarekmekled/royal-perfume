'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, FileSpreadsheet, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BulkImport() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const downloadTemplate = async () => {
    try {
        setLoading(true);
        const { data: products, error } = await supabase
            .from('products')
            .select(`
                *,
                categories (name)
            `);
        
        if (error) throw error;

        // Map to Excel format
        const excelData = (products || []).map((p: any) => ({
            name: p.name,
            description: p.description,
            price: p.price,
            discount_price: p.discount,
            category: p.categories?.name || '',
            target_audience: p.target_audience,
            in_stock: p.stock ? 'yes' : 'no',
            is_active: p.is_active ? 'yes' : 'no'
        }));

        // If no data, provide a blank template example
        if (excelData.length === 0) {
             excelData.push({
                name: 'Example Perfume',
                description: 'Description...',
                price: 150,
                discount_price: 0,
                category: 'Men',
                target_audience: 'Men',
                in_stock: 'yes',
                is_active: 'yes'
             });
        }

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Products");
        XLSX.writeFile(wb, "products_export.xlsx");

    } catch (error) {
        console.error('Export error:', error);
        alert('Failed to export products');
    } finally {
        setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      if (jsonData.length === 0) {
        alert('File is empty');
        return;
      }

      // Process and Insert Data
      for (const row of jsonData) {
        // 1. Resolve Category ID (Find or Create)
        let categoryId = null;
        if (row.category) {
            const slug = row.category.toLowerCase().replace(/\s+/g, '-');
            
            // Try to find
            const { data: existingCat } = await supabase
                .from('categories')
                .select('id')
                .eq('slug', slug)
                .maybeSingle();

            if (existingCat) {
                categoryId = existingCat.id;
            } else {
                // Create new
                const { data: newCat } = await supabase
                    .from('categories')
                    .insert([{ name: row.category, slug }])
                    .select('id')
                    .single();
                if (newCat) categoryId = newCat.id;
            }
        }

        // 2. Validate Target Audience
        const validAudiences = ['Men', 'Women', 'Unisex'];
        const targetAudience = validAudiences.includes(row.target_audience) 
            ? row.target_audience 
            : 'Unisex';

        // 3. Parse Boolean Helper
        const parseBoolean = (val: any) => {
            if (val === undefined || val === null || val === '') return true; // Default true if empty
            const s = String(val).toLowerCase().trim();
            return s === 'true' || s === 'yes' || s === '1';
        };

        // 4. Insert Product
        await supabase.from('products').insert([{
            name: row.name || 'Untitled Product',
            description: row.description || '',
            price: row.price || 0,
            discount: row.discount_price || 0, // Mapped from discount_price
            category_id: categoryId, 
            target_audience: targetAudience,
            stock: parseBoolean(row.in_stock),   // Mapped from in_stock
            is_active: parseBoolean(row.is_active), // Mapped from is_active
            images: []
        }]);
      }

      alert(`Successfully imported ${jsonData.length} products!`);
      router.refresh();

    } catch (error) {
      console.error('Import error:', error);
      alert('Error importing file. Check console for details.');
    } finally {
      setLoading(false);
      // Reset input
      e.target.value = '';
    }
  };

  return (
      <div className="flex gap-2">
        <Button variant="outline" onClick={downloadTemplate} className="gap-2">
            <Download className="h-4 w-4" />
            Template
        </Button>
        <div className="relative">
            <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={loading}
            />
            <Button variant="outline" className="gap-2" disabled={loading}>
                {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                )}
                {loading ? 'Importing...' : 'Import Excel'}
            </Button>
        </div>
      </div>
  );
}
