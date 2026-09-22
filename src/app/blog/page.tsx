import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAllPosts } from '@/lib/blog';
import Container from '@/components/shared/Container';

const POSTS_PER_PAGE = 6;

interface BlogIndexPageProps {
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ searchParams }: BlogIndexPageProps): Promise<Metadata> {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || '1', 10) || 1);

  return {
    title: 'Wholesale Fragrance Buyer Guides',
    description: 'Wholesale fragrance sourcing guides, scent-matching explainers, and shipping know-how from Royal Perfumes.',
    alternates: { canonical: page > 1 ? `/blog?page=${page}` : '/blog' },
  };
}

export default async function BlogIndexPage({ searchParams }: BlogIndexPageProps) {
  const { page: pageParam } = await searchParams;
  const allPosts = getAllPosts();
  const totalPages = Math.max(1, Math.ceil(allPosts.length / POSTS_PER_PAGE));
  const page = Math.min(totalPages, Math.max(1, parseInt(pageParam || '1', 10) || 1));

  const start = (page - 1) * POSTS_PER_PAGE;
  const posts = allPosts.slice(start, start + POSTS_PER_PAGE);

  const hrefForPage = (p: number) => (p <= 1 ? '/blog' : `/blog?page=${p}`);

  return (
    <Container className="max-w-4xl py-12 md:py-20">
      <div className="text-center mb-12 space-y-3">
        <h1 className="text-4xl md:text-5xl font-heading font-medium text-gray-900">Blog</h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Sourcing guides, product knowledge, and shipping know-how for wholesale fragrance buyers.
        </p>
      </div>

      <div className="space-y-10">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col sm:flex-row gap-6 border-b border-gray-100 pb-10 last:border-0"
          >
            <div className="relative w-full sm:w-56 h-56 sm:h-40 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={post.image}
                alt={post.imageAlt}
                fill
                sizes="(max-width: 640px) 100vw, 224px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-xs uppercase tracking-widest text-gray-400">
                {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                {' · '}
                {post.readingTime}
              </p>
              <h2 className="text-xl md:text-2xl font-heading font-medium text-gray-900 group-hover:text-gray-600 transition-colors">
                {post.title}
              </h2>
              <p className="text-gray-500 text-sm md:text-base leading-relaxed">{post.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-3">
          <Link href={hrefForPage(Math.max(1, page - 1))} className={page <= 1 ? 'pointer-events-none opacity-50' : ''}>
            <Button variant="outline" size="sm" disabled={page <= 1}>
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
          </Link>
          <span className="text-sm font-medium text-gray-600">
            Page {page} of {totalPages}
          </span>
          <Link href={hrefForPage(Math.min(totalPages, page + 1))} className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}>
            <Button variant="outline" size="sm" disabled={page >= totalPages}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </Container>
  );
}
