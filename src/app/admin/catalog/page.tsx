'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product, Category, Brand } from '@/types';
import { Loader2, Printer, Download } from 'lucide-react';
import Image from 'next/image';

export default function CatalogGeneratorPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Form states
  const [logoUrl, setLogoUrl] = useState('');
  const [groupBy, setGroupBy] = useState<'category' | 'brand'>('category');
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string>('all'); // Designer, Niche
  const [fields, setFields] = useState({
    price: true,
    description: true,
    category: true,
    type: true,
  });

  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data: catData } = await supabase.from('categories').select('*').order('name');
      if (catData) setCategories(catData);

      const { data: brandData } = await supabase.from('brands').select('*').order('name');
      if (brandData) setBrands(brandData);

      const { data: prodData } = await supabase.from('products').select('*, category:categories(name), brand:brands(name)').eq('is_active', true);
      if (prodData) {
        setProducts(prodData);
      }
      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  const handleGenerate = () => {
    setGenerating(true);
    let result = [...products];

    if (filterCategories.length > 0) {
      result = result.filter(p => p.category_id && filterCategories.includes(p.category_id));
    }

    if (filterType !== 'all') {
      result = result.filter(p => p.type === filterType);
    }

    setFilteredProducts(result);
    setPreviewMode(true);
    setGenerating(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    // Dynamic import of html2pdf
    const element = document.getElementById('printable-catalog');
    if (!element) return;
    
    // Simple notification
    alert('Generating PDF... This may take a few seconds.');
    
    // Generate styled clone for PDF
    const opt = {
      margin: 10,
      filename: `product-catalog-${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Load script dynamically
    if (!(window as any).html2pdf) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = () => {
             (window as any).html2pdf().set(opt).from(element).save();
        };
        document.body.appendChild(script);
    } else {
        (window as any).html2pdf().set(opt).from(element).save();
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      const file = files[0];
      const filePath = `catalog-logo-${Date.now()}`;
      
      const { error } = await supabase.storage.from('products').upload(filePath, file);
      if (!error) {
         const { data } = supabase.storage.from('products').getPublicUrl(filePath);
         if (data?.publicUrl) setLogoUrl(data.publicUrl);
      }
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;
  }

  if (previewMode) {
    // Group products dynamically
    let groupedProducts = [];
    if (groupBy === 'brand') {
      groupedProducts = brands.map(b => ({
        name: b.name,
        products: filteredProducts.filter(p => p.brand_id === b.id)
      })).filter(g => g.products.length > 0);

      const unbranded = filteredProducts.filter(p => !p.brand_id);
      if (unbranded.length > 0) {
        groupedProducts.push({ name: 'Other Brands', products: unbranded });
      }
    } else {
      groupedProducts = categories.map(c => ({
        name: c.name,
        products: filteredProducts.filter(p => p.category_id === c.id)
      })).filter(g => g.products.length > 0);

      const uncategorized = filteredProducts.filter(p => !p.category_id);
      if (uncategorized.length > 0) {
        groupedProducts.push({ name: 'Uncategorized', products: uncategorized });
      }
    }

    return (
      <div className="bg-white min-h-screen">
        <div className="print:hidden p-4 bg-gray-100 flex justify-between items-center mb-8 border-b">
           <div>
               <h2 className="text-xl font-bold">Catalog Preview</h2>
               <p className="text-sm text-gray-500">{filteredProducts.length} products included</p>
           </div>
           <div className="flex gap-4">
              <Button variant="outline" onClick={() => setPreviewMode(false)}>Back to Editor</Button>
              <Button onClick={handlePrint} variant="outline"><Printer className="w-4 h-4 mr-2" /> Print</Button>
              <Button onClick={handleDownloadPdf}><Download className="w-4 h-4 mr-2" /> Download PDF</Button>
           </div>
        </div>

        {/* PRINTABLE CATALOG */}
        <div className="max-w-5xl mx-auto p-8 print:p-0 print:m-0" id="printable-catalog">
           
           {/* Cover Page / Header */}
           <div className="text-center mb-16 pb-8 border-b-2 border-black">
              {logoUrl ? (
                <div className="relative w-48 h-24 mx-auto mb-6">
                   <Image src={logoUrl} alt="Logo" fill className="object-contain" />
                </div>
              ) : (
                <h1 className="text-5xl font-playfair font-bold mb-4">Product Catalog</h1>
              )}
              <h2 className="text-xl text-gray-600 uppercase tracking-widest mt-4">
                 {filterCategories.length > 0 ? `${filterCategories.length} Categories Selected` : 'All Categories'} 
                 {filterType !== 'all' ? ` - ${filterType}` : ''}
              </h2>
           </div>

           {/* Products by Category */}
           <div className="space-y-24">
              {groupedProducts.map((group, idx) => (
                 <div key={idx} className={idx > 0 ? 'print:break-before-page' : ''}>
                    <div className="mb-10 text-center">
                        <h3 className="inline-block text-3xl md:text-4xl font-playfair uppercase tracking-[0.2em] text-black border-b border-black pb-4 px-8">
                           {group.name}
                        </h3>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 print:grid-cols-4 gap-x-8 gap-y-16">
                       {group.products.map(product => (
                          <div key={product.id} className="break-inside-avoid flex flex-col items-center text-center">
                             <div className="aspect-[4/5] w-full relative bg-[#F9F9F9] mb-4 overflow-hidden group">
                                <Image 
                                   src={product.images?.[0] || '/placeholder.png'} 
                                   alt={product.name_en} 
                                   fill 
                                   className="object-contain p-4 transition-transform duration-700 group-hover:scale-105"
                                />
                             </div>
                             <div className="px-2">
                                <h3 className="text-sm md:text-base font-bold font-heading line-clamp-2 leading-snug uppercase tracking-wide">
                                    {product.name_en}
                                </h3>
                                
                                {fields.type && product.type && (
                                   <p className="text-[10px] uppercase font-medium text-gray-400 mt-2 tracking-widest">{product.type}</p>
                                )}

                                {fields.description && product.description_en && (
                                   <p className="text-[11px] text-gray-500 mt-3 line-clamp-3 leading-relaxed max-w-[90%] mx-auto">{product.description_en}</p>
                                )}

                                {fields.price && (
                                   <div className="mt-3 font-medium text-sm text-black">
                                      ${product.price.toFixed(2)}
                                   </div>
                                )}
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              ))}
              
              {groupedProducts.length === 0 && (
                 <div className="text-center text-gray-500 py-20">
                    No products found matching the selected filters.
                 </div>
              )}
           </div>
        </div>
        
        {/* CSS for printing */}
        <style dangerouslySetInnerHTML={{__html: `
            @media print {
                @page { margin: 15mm; size: A4; }
                body { background: white; }
                nav, footer, aside, .print\\:hidden { display: none !important; }
                main { margin: 0 !important; padding: 0 !important; width: 100% !important; }
            }
        `}} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-playfair font-bold">Catalog Generator</h1>
        <p className="text-gray-500 mt-2">Generate a custom printable PDF catalog from your existing products.</p>
      </div>

      <div className="bg-white p-6 rounded-lg border shadow-sm space-y-8">
          
        {/* Layout & Customization */}
        <div>
           <h3 className="text-lg font-semibold mb-4">1. Layout & Customization</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                 <div className="grid gap-2">
                    <Label>Catalog Logo (Optional)</Label>
                    <Input type="file" accept="image/*" onChange={handleLogoUpload} className="max-w-sm" />
                    {logoUrl && (
                       <div className="text-sm text-green-600">Logo uploaded successfully ✓</div>
                    )}
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="grid gap-2">
                    <Label>Group Products By</Label>
                    <Select value={groupBy} onValueChange={(val: 'category' | 'brand') => setGroupBy(val)}>
                       <SelectTrigger className="max-w-xs">
                          <SelectValue placeholder="Select grouping" />
                       </SelectTrigger>
                       <SelectContent>
                          <SelectItem value="category">Category</SelectItem>
                          <SelectItem value="brand">Brand</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>
              </div>
           </div>
        </div>

        {/* Filters */}
        <div>
           <h3 className="text-lg font-semibold mb-4">2. Select Products</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                 <Label>Filter by Categories</Label>
                 <div className="grid grid-cols-2 gap-3 p-4 border rounded-md max-h-48 overflow-y-auto">
                    {categories.map(c => (
                        <div key={c.id} className="flex items-center space-x-2">
                           <Checkbox 
                              id={`cat-${c.id}`} 
                              checked={filterCategories.includes(c.id)}
                              onCheckedChange={(checked) => {
                                  if (checked) setFilterCategories(prev => [...prev, c.id]);
                                  else setFilterCategories(prev => prev.filter(id => id !== c.id));
                              }}
                           />
                           <Label htmlFor={`cat-${c.id}`} className="font-normal text-sm cursor-pointer">{c.name}</Label>
                        </div>
                    ))}
                    {categories.length === 0 && <span className="text-sm text-gray-500">No categories found</span>}
                 </div>
                 <p className="text-xs text-muted-foreground">Leave all unchecked to show all categories.</p>
              </div>

              <div className="space-y-2">
                 <Label>Filter by Type</Label>
                 <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
                    <SelectContent>
                       <SelectItem value="all">All Types</SelectItem>
                       <SelectItem value="Designer">Designer</SelectItem>
                       <SelectItem value="Niche">Niche</SelectItem>
                    </SelectContent>
                 </Select>
              </div>
           </div>
        </div>

        {/* Visible Fields */}
        <div>
           <h3 className="text-lg font-semibold mb-4">3. Visible Fields</h3>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                 <Checkbox 
                    id="showPrice" 
                    checked={fields.price} 
                    onCheckedChange={(checked) => setFields(f => ({...f, price: !!checked}))} 
                 />
                 <Label htmlFor="showPrice">Price</Label>
              </div>
              <div className="flex items-center space-x-2">
                 <Checkbox 
                    id="showDesc" 
                    checked={fields.description} 
                    onCheckedChange={(checked) => setFields(f => ({...f, description: !!checked}))} 
                 />
                 <Label htmlFor="showDesc">Description</Label>
              </div>
              <div className="flex items-center space-x-2">
                 <Checkbox 
                    id="showType" 
                    checked={fields.type} 
                    onCheckedChange={(checked) => setFields(f => ({...f, type: !!checked}))} 
                 />
                 <Label htmlFor="showType">Perfume Type (Designer/Niche)</Label>
              </div>
              <div className="flex items-center space-x-2">
                 <Checkbox 
                    id="showCat" 
                    checked={fields.category} 
                    onCheckedChange={(checked) => setFields(f => ({...f, category: !!checked}))} 
                 />
                 <Label htmlFor="showCat">Category Name</Label>
              </div>
           </div>
        </div>

        <div className="pt-4 border-t">
           <Button onClick={handleGenerate} disabled={generating} size="lg">
              {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Catalog
           </Button>
        </div>
      </div>
    </div>
  );
}
