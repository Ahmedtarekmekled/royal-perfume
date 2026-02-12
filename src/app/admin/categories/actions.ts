'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Category } from '@/types';

export async function getCategories({ query, page = 1, limit = 10 }: { query?: string; page?: number; limit?: number } = {}) {
  const supabase = await createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let dbQuery = supabase
    .from('categories')
    .select('*', { count: 'exact' })
    .order('name');

  if (query) {
    dbQuery = dbQuery.ilike('name', `%${query}%`);
  }

  const { data, count, error } = await dbQuery.range(from, to);

  if (error) {
    console.error('Error fetching categories:', error);
    return { data: [], totalPages: 0 };
  }

  return { 
    data: data as Category[], 
    totalPages: count ? Math.ceil(count / limit) : 0 
  };
}

export async function getCategoryById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching category:', error);
    return null;
  }

  return data as Category;
}

export async function createCategory(formData: FormData) {
  const supabase = await createClient();
  
  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const description = formData.get('description') as string;
  const image_url = formData.get('image_url') as string;
  const is_featured = formData.get('is_featured') === 'on';

  if (!name || !slug) {
    throw new Error('Name and Slug are required');
  }

  const { error } = await supabase
    .from('categories')
    .insert({
      name,
      slug,
      description,
      image_url,
      is_featured,
    });

  if (error) {
    console.error('Error creating category:', error);
    return { success: false, error: 'Failed to create category' };
  }

  revalidatePath('/admin/categories');
  revalidatePath('/categories');
  revalidatePath('/');
  return { success: true };
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = await createClient();
  
  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const description = formData.get('description') as string;
  const image_url = formData.get('image_url') as string;
  const is_featured = formData.get('is_featured') === 'on';

  const { error } = await supabase
    .from('categories')
    .update({
      name,
      slug,
      description,
      image_url,
      is_featured,
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating category:', error);
    return { success: false, error: 'Failed to update category' };
  }

  revalidatePath('/admin/categories');
  revalidatePath('/categories');
  revalidatePath('/');
  return { success: true };
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  
  // 1. Get category to find image
  const { data: category, error: fetchError } = await supabase
    .from('categories')
    .select('image_url')
    .eq('id', id)
    .single();

  if (fetchError) {
      return { success: false, error: 'Category not found.' };
  }

   // 2. Delete the image if it exists
   if (category?.image_url) {
    try {
        const url = new URL(category.image_url);
        const pathSegments = url.pathname.split('/');
        // Bucket: 'products'
        const bucketIndex = pathSegments.indexOf('products');
        if (bucketIndex !== -1 && bucketIndex < pathSegments.length - 1) {
            const storagePath = pathSegments.slice(bucketIndex + 1).join('/');
            
            const { error: storageError } = await supabase.storage
                .from('products')
                .remove([storagePath]);
            
            if (storageError) {
                console.warn('Failed to delete image from storage:', storageError);
            }
        }
    } catch (e) {
        console.warn('Error parsing image URL for deletion:', e);
    }
}

  // 3. Delete record
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting category:', error);
    if (error.code === '23503') {
        return { success: false, error: 'Cannot delete category because it contains products.' };
    }
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/categories');
  revalidatePath('/categories');
  revalidatePath('/');
  return { success: true };
}
