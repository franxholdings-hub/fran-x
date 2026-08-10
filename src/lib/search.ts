export type ServiceRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  cta: string;
  is_active: boolean;
  sort_order: number;
};

const SYNONYMS: { terms: string[]; boost: string[] }[] = [
  { terms: ["website", "web site", "landing page", "web page", "site"], boost: ["website", "web"] },
  { terms: ["app", "mobile", "android", "ios", "application"], boost: ["mobile app", "app"] },
  { terms: ["ai", "chatbot", "bot", "automation", "artificial intelligence"], boost: ["ai", "automation"] },
  { terms: ["car", "vehicle", "auto", "truck"], boost: ["automotive", "vehicle", "car"] },
  { terms: ["property", "house", "land", "real estate", "apartment"], boost: ["real estate", "property"] },
  { terms: ["consult", "consulting", "advice", "strategy", "business"], boost: ["consulting", "business"] },
  { terms: ["store", "shop", "ecommerce", "e-commerce", "online store"], boost: ["e-commerce", "store"] },
  { terms: ["oil", "gas", "fuel", "petroleum", "energy", "buyer", "off-taker"], boost: ["oil", "energy"] },
  { terms: ["invest", "investment", "funding", "capital"], boost: ["investment", "capital"] },
  { terms: ["partner", "partnership", "collaborate"], boost: ["business development", "partnership"] },
  { terms: ["market", "marketing", "seo", "content", "copy"], boost: ["marketing", "copy", "seo"] },
  { terms: ["design", "video", "graphics", "branding", "creative"], boost: ["creative", "graphics", "video"] },
  { terms: ["data", "analysis", "analytics", "research"], boost: ["data", "research"] },
];

export function expandQuery(query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return [] as string[];
  const tokens = q.split(/\s+/).filter((t) => t.length > 2);
  const extras: string[] = [];
  for (const entry of SYNONYMS) {
    if (entry.terms.some((t) => q.includes(t))) extras.push(...entry.boost);
  }
  return Array.from(new Set([...tokens, ...extras]));
}

export function searchServices(services: ServiceRow[], query: string) {
  const terms = expandQuery(query);
  if (terms.length === 0) return services;
  return services
    .map((service) => {
      const haystack = `${service.name} ${service.category} ${service.description}`.toLowerCase();
      let score = 0;
      for (const term of terms) {
        if (service.name.toLowerCase().includes(term)) score += 4;
        else if (service.category.toLowerCase().includes(term)) score += 3;
        else if (haystack.includes(term)) score += 1;
      }
      return { service, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.service.sort_order - b.service.sort_order)
    .map((r) => r.service);
}

export function categoryAnchor(category: string) {
  return category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}