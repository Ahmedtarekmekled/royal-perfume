// Curated from artifacts/seo-cluster/cluster-plan.json's link matrix
// (pillar <-> spoke mandatory links + recommended spoke-to-spoke links),
// restricted to posts that are actually written -- several planned spokes
// in that plan (payment terms, dangerous goods, air vs. sea freight, smell
// comparison, dropshipping vs. wholesale) don't have live pages yet, so
// they're intentionally omitted here rather than linking to nothing.
//
// The pillar post isn't listed as a key: its own body already links to
// every written spoke inline, so a duplicate "Related Guides" widget on
// that page would just repeat itself.
export const RELATED_POSTS: Record<string, string[]> = {
  'wholesale-fragrance-sourcing-guide': [
    'wholesale-fragrance-buying-guide',
    'perfume-moq-explained',
    'wholesale-perfume-supplier-red-flags',
  ],
  'perfume-moq-explained': [
    'wholesale-fragrance-buying-guide',
    'wholesale-fragrance-sourcing-guide',
  ],
  'wholesale-perfume-supplier-red-flags': [
    'wholesale-fragrance-buying-guide',
    'wholesale-fragrance-sourcing-guide',
  ],
  'wholesale-perfume-shipping-customs-guide': [
    'wholesale-fragrance-buying-guide',
  ],
  'inspired-fragrances-vs-designer-explained': [
    'wholesale-fragrance-buying-guide',
    'is-it-legal-to-sell-inspired-perfumes',
  ],
  'is-it-legal-to-sell-inspired-perfumes': [
    'wholesale-fragrance-buying-guide',
    'inspired-fragrances-vs-designer-explained',
  ],
  'how-to-start-a-fragrance-reselling-business': [
    'wholesale-fragrance-buying-guide',
    'wholesale-perfume-profit-margins',
  ],
  'wholesale-perfume-profit-margins': [
    'wholesale-fragrance-buying-guide',
    'how-to-start-a-fragrance-reselling-business',
  ],
  'wholesale-arabic-oud-fragrances': [
    'wholesale-fragrance-buying-guide',
    'travel-size-perfume-wholesale',
  ],
  'travel-size-perfume-wholesale': [
    'wholesale-fragrance-buying-guide',
    'wholesale-arabic-oud-fragrances',
  ],
};

export function getRelatedSlugs(slug: string): string[] {
  return RELATED_POSTS[slug] ?? [];
}
