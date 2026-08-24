import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

export interface BlogFrontmatter {
  title: string;
  description: string;
  date: string;
  updated?: string;
  image: string;
  imageAlt: string;
  tags: string[];
  readingTime: string;
}

export interface BlogPost extends BlogFrontmatter {
  slug: string;
  content: string;
}

export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => file.replace(/\.mdx$/, ''));
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);

  return {
    slug,
    content,
    ...(data as BlogFrontmatter),
  };
}

export function getAllPosts(): BlogPost[] {
  return getAllPostSlugs()
    .map((slug) => getPostBySlug(slug))
    .filter((post): post is BlogPost => post !== null)
    // Previous comparator never returned 0 for equal dates, which is an
    // invalid comparator and gave posts sharing a date an effectively
    // arbitrary order (most of these posts share the same publish date).
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
