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
    });

  if (error) {
    console.error('Error creating category:', error);
    throw new Error('Failed to create category');
  }

  revalidatePath('/admin/categories');
  revalidatePath('/categories');
  revalidatePath('/');
  redirect('/admin/categories');
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = await createClient();
  
  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const description = formData.get('description') as string;
  const image_url = formData.get('image_url') as string;

  const { error } = await supabase
    .from('categories')
    .update({
      name,
      slug,
      description,
      image_url,
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating category:', error);
    throw new Error('Failed to update category');
  }

  revalidatePath('/admin/categories');
  revalidatePath('/categories');
  revalidatePath('/');
  redirect('/admin/categories');
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting category:', error);
    throw new Error('Failed to delete category');
  }

  revalidatePath('/admin/categories');
  revalidatePath('/categories');
  revalidatePath('/');
}
