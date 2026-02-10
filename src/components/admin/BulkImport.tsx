'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, FileSpreadsheet, Download, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BulkImport() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<{created: number, updated: number, failed: number} | null>(null);
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
            name_en: p.name_en,
            name_ar: p.name_ar,
            description_en: p.description_en,
            description_ar: p.description_ar,
            price: p.price,
            discount_price: p.discount,
            category: p.categories?.name || '',
            target_audience: p.target_audience,
            in_stock: p.stock ? 'yes' : 'no',
            is_active: p.is_active ? 'yes' : 'no'
        }));

        if (excelData.length === 0) {
             excelData.push({
                name_en: 'Example Perfume',
                name_ar: 'عطر مثال',
                description_en: 'Description...',
                description_ar: 'وصف...',
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
      setSummary(null);
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]) as any[];

      if (jsonData.length === 0) {
        alert('File is empty');
        return;
      }

      let created = 0;
      let updated = 0;
      let failed = 0;

      for (const row of jsonData) {
        try {
            // 1. Resolve Category
            let categoryId = null;
            if (row.category) {
                const slug = row.category.toLowerCase().replace(/\s+/g, '-');
                const { data: existingCat } = await supabase
                    .from('categories')
                    .select('id')
                    .eq('slug', slug)
                    .maybeSingle();

                if (existingCat) {
                    categoryId = existingCat.id;
                } else {
                    const { data: newCat } = await supabase
                        .from('categories')
                        .insert([{ name: row.category, slug }])
                        .select('id')
                        .single();
                    if (newCat) categoryId = newCat.id;
                }
            }

            // 2. Prepare Data
            const parseBoolean = (val: any) => {
                if (val === undefined || val === null || val === '') return true;
                const s = String(val).toLowerCase().trim();
                return s === 'true' || s === 'yes' || s === '1';
            };

            const productData = {
                name_en: row.name_en || row.name || 'Untitled',
                name_ar: row.name_ar || '',
                description_en: row.description_en || row.description || '',
                description_ar: row.description_ar || '',
                price: row.price || 0,
                discount: row.discount_price || 0,
                category_id: categoryId,
                target_audience: row.target_audience || 'Unisex',
                stock: parseBoolean(row.in_stock),
                is_active: parseBoolean(row.is_active),
            };

            // 3. Smart Upsert Logic
            const { data: existing } = await supabase
                .from('products')
                .select('id')
                .eq('name_en', productData.name_en)
                .maybeSingle();

            if (existing) {
                const { error } = await supabase
                    .from('products')
                    .update(productData)
                    .eq('id', existing.id);
                if (error) throw error;
                updated++;
            } else {
                const { error } = await supabase
                    .from('products')
                    .insert([productData]);
                if (error) throw error;
                created++;
            }
        } catch (err) {
            console.error('Row failed:', row, err);
            failed++;
        }
      }

      setSummary({ created, updated, failed });
      router.refresh();

    } catch (error) {
      console.error('Import error:', error);
      alert('Critical error during import.');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
         <Button variant="outline" onClick={downloadTemplate} className="gap-2">
            <Download className="h-4 w-4" />
            Template
        </Button>
         <div className="relative">
            <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} disabled={loading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            <Button disabled={loading}>
                {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <FileSpreadsheet className="h-4 w-4 mr-2" />}
                Import Excel
            </Button>
         </div>
      </div>

      {summary && (
        <div className="p-4 bg-gray-50 border rounded-md flex justify-between items-center animate-in fade-in slide-in-from-top-2">
            <div>
                <p className="font-semibold text-gray-900">Import Finished</p>
                <p className="text-sm text-gray-600">
                    <span className="text-green-600 font-medium">{summary.created} Created</span>,{' '}
                    <span className="text-blue-600 font-medium">{summary.updated} Updated</span>,{' '}
                    <span className="text-red-600 font-medium">{summary.failed} Failed</span>
                </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSummary(null)}><X className="h-4 w-4" /></Button>
        </div>
      )}
    </div>
  );
}
