'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Loader2, Upload, X, Check, ChevronsUpDown, Plus } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Product, Category } from '@/types';

// Zod Schema
const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be positive'),
  discount: z.coerce.number().min(0, 'Discount must be positive').default(0),
  category_id: z.string().min(1, 'Please select a category'),
  target_audience: z.enum(['Men', 'Women', 'Unisex']),
  stock: z.boolean().default(true),
  is_active: z.boolean().default(true),
  images: z.array(z.string()).optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: Product;
}

export default function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploading, setUploading] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  
  // Fetch categories
  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*');
    if (data) setCategories(data);
  };

  useEffect(() => {
    fetchCategories();
  }, [supabase]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: initialData ? {
      name: initialData.name,
      description: initialData.description || '',
      price: initialData.price,
      discount: initialData.discount,
      category_id: initialData.category_id || '',
      target_audience: (initialData.target_audience as 'Men' | 'Women' | 'Unisex') || 'Unisex',
      stock: initialData.stock,
      is_active: initialData.is_active,
      images: initialData.images || [],
    } : {
      name: '',
      description: '',
      price: 0,
      discount: 0,
      category_id: '',
      target_audience: 'Unisex',
      stock: true,
      is_active: true,
      images: [],
    },
  });

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true);

      if (initialData) {
        // Update
        const { error } = await supabase
          .from('products')
          .update({
             ...data,
             target_audience: data.target_audience // Ensure this is explicitly included
          })
          .eq('id', initialData.id);
        
        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase
          .from('products')
          .insert([{
             ...data,
             target_audience: data.target_audience
          }]);
          
        if (error) throw error;
      }

      router.push('/admin/products');
      router.refresh();
    } catch (error) {
      console.error('Error submitting form:', error);
      // You might want to add toast notification here
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
     try {
        const slug = searchValue.trim().toLowerCase().replace(/\s+/g, '-');
        const name = searchValue.trim();

        if (!name) return;

        // 1. Check if category already exists
        const { data: existingCategory } = await supabase
            .from('categories')
            .select('*')
            .eq('slug', slug)
            .maybeSingle();

        if (existingCategory) {
            // Already exists, just select it
            if (!categories.find(c => c.id === existingCategory.id)) {
                setCategories(prev => [...prev, existingCategory]);
            }
            form.setValue('category_id', existingCategory.id);
            setOpenCategory(false);
            setSearchValue("");
            return;
        }

        // 2. Create new if checks passed
        const { data, error } = await supabase
            .from('categories')
            .insert([{ name, slug }])
            .select()
            .single();

        if (error) throw error;
        if (data) {
            setCategories((prev) => [...prev, data]);
            form.setValue('category_id', data.id);
            setOpenCategory(false);
            setSearchValue("");
        }
     } catch (error: any) {
        console.error('Error creating category:', error);
        if (error?.code === '42501' || error?.message?.includes('violates row-level security')) {
            alert("Permission denied: You must run the 20240210_fix_rls_policies.sql script in your Supabase Dashboard to allow creating categories.");
        } else {
            alert("Failed to create category. See console for details.");
        }
     }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      
      // 5MB Limit
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit.");
        setUploading(false);
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      const currentImages = form.getValues('images') || [];
      form.setValue('images', [...currentImages, publicUrl]);

    } catch (error) {
       console.error('Error uploading image:', error);
       alert('Error uploading image. Make sure "products" bucket exists in Supabase Storage.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (urlToRemove: string) => {
      try {
        const currentImages = form.getValues('images') || [];
        form.setValue('images', currentImages.filter(url => url !== urlToRemove));

        // Attempt to delete from Supabase Storage
        // URL format: .../storage/v1/object/public/products/filename.ext
        const path = urlToRemove.split('/products/').pop(); // Extracts filename.ext
        
        if (path) {
            const { error } = await supabase.storage
                .from('products')
                .remove([path]);
            
            if (error) {
                console.error('Error deleting image from storage:', error);
            }
        }
      } catch (error) {
        console.error('Error removing image:', error);
      }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-6xl bg-white p-6 rounded-lg border shadow-sm">
        
        {/* Name - Full Width */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="Royal Oud" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description - Full Width */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="A rich, woody scent..." className="min-h-[100px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Price & Discount - 2 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Price ($)</FormLabel>
                <FormControl>
                    <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            
            <FormField
            control={form.control}
            name="discount"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Discount Amount ($)</FormLabel>
                <FormControl>
                    <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormDescription>Amount to subtract from price</FormDescription>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        {/* Category & Target Audience - 2 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Category</FormLabel>
                <Popover open={openCategory} onOpenChange={setOpenCategory}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? categories.find(
                              (category) => category.id === field.value
                            )?.name
                          : "Select category"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Search category..." onValueChange={setSearchValue} />
                      <CommandList>
                        <CommandEmpty>
                            <div className="p-2">
                                <p className="text-sm text-muted-foreground mb-2">No category found.</p>
                                <Button 
                                    variant="secondary" 
                                    size="sm" 
                                    className="w-full"
                                    onClick={handleCreateCategory}
                                    type="button"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create "{searchValue}"
                                </Button>
                            </div>
                        </CommandEmpty>
                        <CommandGroup>
                          {categories
                            .filter(c => c.name && c.name.trim() !== '')
                            .map((category) => (
                            <CommandItem
                              value={category.name}
                              key={category.id}
                              onSelect={() => {
                                form.setValue("category_id", category.id)
                                setOpenCategory(false)
                              }}
                              className="text-foreground"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  category.id === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {category.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="target_audience"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Target Audience</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-row space-x-1"
                  >
                    {['Men', 'Women', 'Unisex'].map((option) => (
                        <FormItem key={option} className="flex-1">
                            <FormControl>
                                <RadioGroupItem value={option} className="sr-only" />
                            </FormControl>
                            <FormLabel className={cn(
                                "flex flex-1 items-center justify-center rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all",
                                field.value === option && "border-black bg-black text-white hover:bg-black/90"
                            )}>
                                {option}
                            </FormLabel>
                        </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Images - Full Width */}
        <div className="space-y-4">
            <FormLabel>Images</FormLabel>
            <div className="flex flex-wrap gap-4">
                {form.watch('images')?.map((url, index) => (
                    <div key={index} className="relative group">
                        <div className="relative h-24 w-24 rounded-md overflow-hidden border">
                          <Image src={url} alt="Product" fill className="object-cover" />
                        </div>
                        <button
                            type="button"
                            onClick={() => removeImage(url)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                ))}
                <div className="h-24 w-24 border-2 border-dashed rounded-md flex items-center justify-center relative cursor-pointer hover:border-black hover:bg-gray-50 transition-all">
                    {uploading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    ) : (
                        <Upload className="h-6 w-6 text-gray-400" />
                    )}
                    <input 
                        type="file" 
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleImageUpload}
                        disabled={uploading}
                    />
                </div>
            </div>
        </div>

        {/* Switches - 2 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">In Stock</FormLabel>
                    <FormDescription>
                      Is this product available?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <FormDescription>
                      Show in store?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex gap-4 z-50 md:relative md:bg-transparent md:border-0 md:p-0 md:pt-4 md:z-auto">
            <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1 md:flex-none md:w-auto">
                Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 md:flex-none md:w-auto md:min-w-[150px]">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? 'Update Product' : 'Create Product'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
