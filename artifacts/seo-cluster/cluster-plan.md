# Royal Perfumes — Wholesale Buyer Content Cluster Plan

**Site:** https://royalperfumes.company
**Audience:** wholesalers, retailers, distributors, beauty/perfume store buyers — NOT end consumers
**Starting point:** 3 existing posts (sourcing, shipping/customs, inspired-vs-designer), zero wholesale-intent queries in GSC last 30 days
**Data sources:** WebSearch (live SERP research, this session); DataForSEO/Google Ads Keyword Planner unavailable (no `ads_developer_token` configured — see `claude-seo doctor` output)

---

## Headline finding

Royal Perfumes has zero measurable topical authority for wholesale-buyer search intent despite three solid existing posts. Those posts are isolated — no pillar ties them together, and none of the adjacent, real-demand subtopics around them exist yet. The three posts are *correctly scoped* (their target queries are winnable — see evidence below); the gap is breadth and interlinking, not quality.

Separately: broad head terms (`wholesale perfume supplier`, `wholesale perfume for boutique`, `perfume dupe wholesale suppliers`) are dominated by B2B aggregators (Alibaba, TradeKey, europages, Wholesale Central) and 20–40-year-old wholesale storefronts (FragranceShop Wholesale, United Perfumes, Perfume Center of America, Faire). These are **excluded from the content plan entirely** — they belong to `/shop`, the PDF catalog, and directory/marketplace listings, not editorial content. Every keyword recommended below was checked against this trap: the SERP has to be winnable by a company blog before it's included.

---

## Architecture: 1 pillar + 4 clusters + 13 spokes (3 written, 11 planned)

```
                                    [C1: Sourcing & Supplier Vetting]
                              existing: Wholesale Fragrance Sourcing (lead)
                              + Perfume MOQ Explained
                              + Red-Flags Checklist (supplier scams)
                              + Payment Terms & Deposits

                                    [C2: Shipping, Customs & Logistics]
                              existing: Shipping & Customs Guide (lead)
                              + Dangerous Goods / HS Code / UN1266
    PILLAR (new) ─────────────  + Air vs. Sea Freight
    "Wholesale Fragrance
    Buying: The Complete
    Guide for Retailers            [C3: Scent-Matched / Inspired Fragrances]
    & Distributors"           existing: Scent-Matched Fragrances Explained (lead)
                              + Is It Legal to Sell Inspired Perfumes?
                              + How Close Do Inspired Perfumes Smell?

                                    [C4: Wholesale Business Economics] (NEW cluster)
                              + How to Start a Fragrance Reselling Business
                              + Wholesale Perfume Profit Margins
                              + Dropshipping vs. Wholesale
```

Full machine-readable version: `artifacts/seo-cluster/cluster-plan.json`

---

## Cluster-by-cluster evidence

### Cluster 1 — Sourcing & Supplier Vetting (existing lead: "How Wholesale Fragrance Sourcing Actually Works")

| Spoke | Keyword | SERP evidence | Verdict |
|---|---|---|---|
| Perfume MOQ Explained | `perfume minimum order quantity MOQ` | Distinct SERP of niche B2B fragrance blogs (jarskingglobal, graceperfumes, sunflorae, scc-export) — different result set than the general sourcing query, meaning it deserves its own page, not just a subsection | Winnable, Phase 1 |
| Red-Flags Checklist | `wholesale perfume supplier scam red flags` | Mix of general wholesale-scam guidance (GoDaddy) and perfume-specific authenticity content (Wholesale55, fragrancelord, beautinow) | Winnable, Phase 1 |
| Payment Terms & Deposits | `wholesale perfume payment terms deposit` | Recurs alongside World Perfume and Qogita content; reinforces Royal Perfumes' existing "confirmed before payment" policy with real specifics | Winnable, Phase 2 |

Note: `wholesale perfume supplier` (bare head term) and `wholesale perfume for boutique` were tested and **excluded** — 4–5 shared aggregator/competitor domains, not blog-winnable.

### Cluster 2 — Shipping, Customs & Logistics (existing lead: "Shipping & Customs Guide")

| Spoke | Keyword | SERP evidence | Verdict |
|---|---|---|---|
| Dangerous Goods / HS Code | `perfume dangerous goods shipping HS code` | Logistics-niche blogs (FreightAmigo, atoship, LAEYO Labs, Gerudo Logistics) covering UN1266/Class 3 and the HS 3303-vs-3304 misclassification trap — technical, low consumer-content competition | Winnable, Phase 2 |
| Air vs. Sea Freight | `air freight vs sea freight perfume wholesale` | Real cost data confirmed ($800–1,400 air vs. $250–500 sea per typical order; air often barred for large flammable-liquid volume). SERP dominated by *generalist* freight sites (Freightos, Onramp Funds, Tuscor Lloyds) with only World Perfume as a fragrance-specific competitor | Winnable only with a strongly perfume/flammability-specific angle — Phase 3 |

### Cluster 3 — Scent-Matched / Inspired Fragrances (existing lead: "Scent-Matched Fragrances Explained")

| Spoke | Keyword | SERP evidence | Verdict |
|---|---|---|---|
| Is It Legal to Sell Inspired Perfumes? | `is it legal to sell perfume dupes` | Law-firm content (Ropes & Gray), IP blogs (Intepat), and dupe-retailer blogs (perfumeson, world-perfume, aromapassions) — one of the single biggest hesitation points for a first-time inspired-fragrance retailer, currently unaddressed on the site | Winnable, Phase 1, high priority |
| How Close Do Inspired Perfumes Smell? | `designer vs inspired perfume smell comparison` | 9/9 organic results are inspired-fragrance **brand blogs** (DUA Fragrances, mbroyalperfume.ca, bkaroma, Regal Fragrances, Noor Perfume, Valon, Elite Perfumes) — zero aggregators, zero legal sites. Strongest single proof point in this whole research set that brand-owned content wins this exact query type | Winnable, Phase 2 |

### Cluster 4 — Wholesale Business Economics (new cluster, no existing lead)

This is the clearest structural gap: none of the 3 existing posts address *why or how to run a resale business* — only how to buy from a supplier once you've decided to.

| Spoke | Keyword | SERP evidence | Verdict |
|---|---|---|---|
| How to Start a Fragrance Reselling Business | `how to start a perfume reselling business` | SERP includes Shopify, BeauteTrade, Wholesale55, and **perfumes.la ranking twice** — a direct wholesale-fragrance-business analog already winning this exact query. Strongest direct proof in the entire research set | Winnable, Phase 1, highest priority |
| Wholesale Perfume Profit Margins | `wholesale perfume profit margin` | SERP includes jasmine-perfumes.com.tr — a **Turkish perfume-company blog** (same country of manufacture as Royal Perfumes) ranking alongside finance sites | Winnable, Phase 1 |
| Dropshipping vs. Wholesale | `dropshipping vs wholesale perfume` | SERP dominated by dropship-tool platforms (Inventory Source, Doba, AutoDS) with no bulk-manufacturer content addressing the comparison from the wholesale side — genuine gap, doubles as a qualification page for the 500-unit MOQ | Winnable, Phase 2 |

---

## Explicitly excluded / deferred (with reasons)

| Keyword | Why it's out |
|---|---|
| `wholesale perfume supplier`, `wholesale perfume for boutique`, `perfume dupe wholesale suppliers` | Aggregator/competitor-storefront-dominated SERPs (TradeKey, europages, Wholesale Central, Faire, established 20–40yr wholesalers). Route to `/shop` and off-site listings, not the blog. |
| `private label perfume manufacturer` / custom formulation | SERP is genuinely winnable by manufacturer blogs (zero aggregators), **but** Royal Perfumes' own site has no OEM/private-label service — only an existing 1,300+ SKU catalog. This content targets a different buyer (an indie founder commissioning a custom scent) than the actual ICP. Only pursue if the business adds this service line. |
| `how much does it cost to start a perfume business/brand` | Same off-ICP pattern — skews toward "launch your own formulated brand," not "restock from an existing catalog." |
| `how to sell perfume on Amazon wholesale` | Real demand, but SERP is 50% owned by one specialized Amazon-compliance agency (BellaVix). Narrower ranking opportunity and narrower buyer segment — revisit after Cluster 4 is established. |
| `perfume import duty rates by country` | Real demand, but better folded into the existing shipping/customs post as an expanded FAQ/table than built as a standalone page competing against generalist customs-broker sites (Stackry, USA Customs Clearance) that own this numeric-data topic. |

---

## Cannibalization check: PASS

No two planned posts share a primary keyword. The two closest pairs were checked explicitly:
- Pillar keyword vs. existing sourcing post keyword — different SERP shape (guide-level vs. how-it-works), kept separate.
- New "is it legal to sell dupes" vs. existing "scent-matched explained" — different intent (compliance vs. product education), SERP overlap score 3 (interlink threshold, not merge threshold).

## Link matrix

- 13/13 spokes link to the pillar (mandatory); pillar links to all 13 spokes (mandatory) — full JSON in `cluster-plan.json`.
- 2 recommended spoke-to-spoke links per post within each cluster.
- 4 optional cross-cluster links where a genuine bridge exists (e.g., "starting a reselling business" → "how sourcing works").
- 0 orphan pages; every existing post gains its first pillar-level incoming link, which it currently lacks.

## Priority / phasing

**Phase 1 (build first):** pillar page, Perfume MOQ Explained, Red-Flags Checklist, Is It Legal to Sell Inspired Perfumes, How to Start a Fragrance Reselling Business, Wholesale Perfume Profit Margins.
**Phase 2:** Payment Terms, Dangerous Goods/HS Code, Smell Comparison, Dropshipping vs. Wholesale.
**Phase 3:** Air vs. Sea Freight (real demand, but harder generalist-freight SERP — needs the strongest differentiation angle before publishing).

## Caveat on data quality

Google Ads Keyword Planner (via `claude-seo run keyword_planner.py`) is not configured on this machine (`ads_developer_token` missing), so no hard search-volume numbers are available. Every recommendation above is grounded in live WebSearch SERP composition (which sites currently rank, and whether they're aggregators/direct competitors vs. blog-style content a manufacturer can realistically outrank) rather than volume estimates. This is the documented WebSearch fallback per the skill's SERP-overlap methodology, not a substitute for DataForSEO/Ads API volume data — recommend configuring `ads_developer_token` before the next cluster-planning cycle for volume-weighted prioritization.
