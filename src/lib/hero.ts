import { slugify } from './eventDetail';

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
  /** Slug for the associated event detail page. */
  slug?: string;
  /** ID of the associated event in Directus. */
  eventId: number;
}

/**
 * Fetches the hero section data from the Directus CMS.
 * @returns The hero content with resolved asset URL and event slug.
 */
export async function getHero(): Promise<Hero> {
  const res = await fetch(`${DIRECTUS_URL}/items/hero`);
  const json = await res.json();
  const item = json.data;

  // Fetch event name to derive slug
  let slug: string | undefined;
  if (item.event) {
    const eventRes = await fetch(
      `${DIRECTUS_URL}/items/event/${item.event}?fields=name`,
    );
    const eventJson = await eventRes.json();
    slug = slugify(eventJson.data.name);
  }

  return {
    title: item.title,
    description: item.description,
    image: `${DIRECTUS_URL}/assets/${item.image}`,
    date: item.date.slice(8, 10) + '/' + item.date.slice(5, 7) + '/' + item.date.slice(0, 4),
    ctaText: item.cta_text ?? undefined,
    slug,
    eventId: item.event,
  };
}
