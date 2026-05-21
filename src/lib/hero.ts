const DIRECTUS_URL = import.meta.env.DIRECTUS_URL;

/** Hero section data. */
export interface Hero {
  /** Hero title. */
  title: string;
  /** Hero description text. */
  description: string;
  /** Full Directus asset URL for the hero image. */
  image: string;
  /** Human-readable date in `dd/mm/yyyy` format. */
  date: string;
  /** Optional call-to-action label. */
  ctaText?: string;
  /** Optional call-to-action URL. */
  ctaUrl?: string;
}

/**
 * Fetches the hero section data from the Directus CMS.
 * @returns The hero content with resolved asset URL.
 */
export async function getHero(): Promise<Hero> {
  const res = await fetch(`${DIRECTUS_URL}/items/hero`);
  const json = await res.json();
  const item = json.data;

  return {
    title: item.title,
    description: item.description,
    image: `${DIRECTUS_URL}/assets/${item.image}`,
    date: item.date.slice(8, 10) + '/' + item.date.slice(5, 7) + '/' + item.date.slice(0, 4),
    ctaText: item.cta_text ?? undefined,
    ctaUrl: item.cta_url ?? undefined,
  };
}
