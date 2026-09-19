import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getAllPostSlugs, getAdjacentPosts, getPostBySlug } from '@/lib/blog';
import { getRelatedSlugs } from '@/lib/blog-related';
import ProductCallout from '@/components/blog/ProductCallout';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: 'Post Not Found' };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.royalperfumes.company';

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `${siteUrl}/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${siteUrl}/blog/${slug}`,
      type: 'article',
      publishedTime: post.date,
      images: [{ url: post.image, width: 1200, height: 800, alt: post.imageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [post.image],
    },
  };
}

const mdxComponents = {
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-2xl md:text-3xl font-heading font-medium text-gray-900 mt-10 mb-4" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-lg md:text-xl font-heading font-medium text-gray-900 mt-8 mb-3" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-gray-600 leading-relaxed mb-4" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc pl-5 space-y-2 text-gray-600 mb-4" {...props} />
  ),
  ol: (props: React.OlHTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal pl-5 space-y-2 text-gray-600 mb-4" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a className="text-gray-900 underline underline-offset-2 hover:no-underline" {...props} />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-gray-900" {...props} />
  ),
  hr: () => <hr className="my-10 border-gray-200" />,
  table: (props: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto mb-6">
      <table className="w-full text-sm border-collapse" {...props} />
    </div>
  ),
  th: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th className="text-left font-semibold text-gray-900 border-b border-gray-200 py-2 pr-4" {...props} />
  ),
  td: (props: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td className="text-gray-600 border-b border-gray-100 py-2 pr-4 align-top" {...props} />
  ),
  ProductCallout,
};

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.royalperfumes.company';
  const imageUrl = post.image.startsWith('http') ? post.image : `${siteUrl}${post.image}`;

  const relatedPosts = getRelatedSlugs(slug)
    .map((relatedSlug) => getPostBySlug(relatedSlug))
    .filter((relatedPost): relatedPost is NonNullable<typeof relatedPost> => relatedPost !== null);
  const { newer, older } = getAdjacentPosts(slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: imageUrl,
    datePublished: post.date,
    dateModified: post.updated || post.date,
    author: {
      '@type': 'Organization',
      name: 'Royal Perfumes',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Royal Perfumes',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/images/royalLogo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${slug}`,
    },
  };

  return (
    <div className="container py-12 md:py-20 max-w-3xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link href="/blog" className="text-sm text-gray-400 hover:text-gray-900 transition-colors">
        &larr; Back to Blog
      </Link>

      <div className="mt-6 mb-8 space-y-4">
        <p className="text-xs uppercase tracking-widest text-gray-400">
          {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          {' · '}
          {post.readingTime}
        </p>
        <h1 className="text-3xl md:text-5xl font-heading font-medium text-gray-900 leading-tight">
          {post.title}
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed">{post.description}</p>
      </div>

      <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden bg-gray-100 mb-10">
        <Image
          src={post.image}
          alt={post.imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
          priority
        />
      </div>

      <article className="text-base">
        <MDXRemote
          source={post.content}
          components={mdxComponents}
          options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
        />
      </article>

      {relatedPosts.length > 0 && (
        <div className="mt-16 pt-10 border-t border-gray-100">
          <h2 className="text-xl font-heading font-medium text-gray-900 mb-6">Related Guides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {relatedPosts.map((relatedPost) => (
              <Link
                key={relatedPost.slug}
                href={`/blog/${relatedPost.slug}`}
                className="group flex gap-4 items-center"
              >
                <div className="relative w-24 h-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={relatedPost.image}
                    alt={relatedPost.imageAlt}
                    fill
                    sizes="96px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <p className="text-sm font-medium text-gray-900 group-hover:text-gray-600 transition-colors leading-snug">
                  {relatedPost.title}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {(older || newer) && (
        <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between gap-4">
          {older ? (
            <Link
              href={`/blog/${older.slug}`}
              className="group flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors max-w-[45%]"
            >
              <ArrowLeft className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{older.title}</span>
            </Link>
          ) : <span />}
          {newer ? (
            <Link
              href={`/blog/${newer.slug}`}
              className="group flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors max-w-[45%] text-right ml-auto"
            >
              <span className="truncate">{newer.title}</span>
              <ArrowRight className="h-4 w-4 flex-shrink-0" />
            </Link>
          ) : <span />}
        </div>
      )}
    </div>
  );
}
