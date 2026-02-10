
import { redirect } from 'next/navigation';

export default function CategorySlugPage({ params }: { params: { slug: string } }) {
  // Potentially map 'men', 'women' to query params in the future.
  // For now, redirect to shop.
  redirect('/shop');
}
