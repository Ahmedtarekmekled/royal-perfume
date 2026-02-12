'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Brand } from '@/types';

export async function getBrands({ query, page = 1, limit = 10 }: { query?: string; page?: number; limit?: number } = {}) {
  const supabase = await createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let dbQuery = supabase
    .from('brands')
    .select('*', { count: 'exact' })
    .order('name');

  if (query) {
    dbQuery = dbQuery.ilike('name', `%${query}%`);
  }

  const { data, count, error } = await dbQuery.range(from, to);

  if (error) {
    console.error('Error fetching brands:', error);
    return { data: [], totalPages: 0 };
  }

  return { 
    data: data as Brand[], 
    totalPages: count ? Math.ceil(count / limit) : 0 
  };
}

export async function getBrandById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching brand:', error);
    return null;
  }

  return data as Brand;
}

export async function createBrand(formData: FormData) {
  const supabase = await createClient();
  
  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const image_url = formData.get('image_url') as string;
  const is_featured = formData.get('is_featured') === 'on';

  if (!name || !slug) {
    throw new Error('Name and Slug are required');
  }

  const { error } = await supabase
    .from('brands')
    .insert({
      name,
      slug,
      image_url,
      is_featured
    });

  if (error) {
    console.error('Error creating brand:', error);
    return { success: false, error: 'Failed to create brand' };
  }

  revalidatePath('/admin/brands');
  revalidatePath('/');
  return { success: true };
}

export async function updateBrand(id: string, formData: FormData) {
  const supabase = await createClient();
  
  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const image_url = formData.get('image_url') as string;
  const is_featured = formData.get('is_featured') === 'on';

  const { error } = await supabase
    .from('brands')
    .update({
      name,
      slug,
      image_url,
      is_featured
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating brand:', error);
    return { success: false, error: 'Failed to update brand' };
  }

  revalidatePath('/admin/brands');
  revalidatePath('/');
  return { success: true };
}

export async function deleteBrand(id: string) {
  const supabase = await createClient();
  
  // 1. Get the brand to find the image_url
  const { data: brand, error: fetchError } = await supabase
    .from('brands')
    .select('image_url')
    .eq('id', id)
    .single();

  if (fetchError) {
      console.error('Error fetching brand for deletion:', fetchError);
      return { success: false, error: 'Brand not found or could not be fetched.' };
  }

  // 2. Delete the image if it exists
  if (brand?.image_url) {
      try {
          const url = new URL(brand.image_url);
          const pathSegments = url.pathname.split('/');
          // Assuming structure: /storage/v1/object/public/products/brands/xyz.jpg
          // We need the path after the bucket name ('products')
          const bucketIndex = pathSegments.indexOf('products');
          if (bucketIndex !== -1 && bucketIndex < pathSegments.length - 1) {
              const storagePath = pathSegments.slice(bucketIndex + 1).join('/');
              
              const { error: storageError } = await supabase.storage
                  .from('products')
                  .remove([storagePath]);
              
              if (storageError) {
                  console.warn('Failed to delete image from storage:', storageError);
                  // valid to continue, just warn
              }
          }
      } catch (e) {
          console.warn('Error parsing image URL for deletion:', e);
      }
  }

  // 3. Delete the brand record
  const { error } = await supabase
    .from('brands')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting brand:', error);
    // basic check for FK violation
    if (error.code === '23503') { // generic postgres FK violation code
        return { success: false, error: 'Cannot delete brand because it has associated products. Please delete the products first.' };
    }
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/brands');
  revalidatePath('/');
  return { success: true };
}
