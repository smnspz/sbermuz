import { DIRECTUS_URL } from './constants';
import { formatItalianDate } from './datetime';
import { slugify } from './eventDetail';

/** Hero section data. */
export interface Hero {
  /** Hero title. */
  title: string;
  /** Hero description text. */
  description: string;
  /** Full Directus asset URL for the hero image. */
  image: string;
  /** Italian-formatted date with time. */
  date: string;
  /** Raw ISO date string for calendar generation. */
  rawDate: string;
  /** Event address string. */
  address?: string;
  /** Event price text (null = free). */
  price?: string;
  /** Slug for the associated event detail page. */
  slug?: string;
  /** ID of the associated event in Directus. */
  eventId: number;
}

/**
 * Fetches the hero section data from the Directus CMS.
 * @returns The hero content with resolved asset URL, event slug, and event details.
 */
export async function getHero(): Promise<Hero> {
  const res = await fetch(`${DIRECTUS_URL}/items/hero`);
  const json = await res.json();
  const item = json.data;

  let slug: string | undefined;
  let address: string | undefined;
  let price: string | undefined;
  let eventDate = item.date;

  if (item.event) {
    const eventRes = await fetch(
      `${DIRECTUS_URL}/items/event/${item.event}?fields=name,date,address_id.full_address,price`,
    );
    const eventJson = await eventRes.json();
    const event = eventJson.data;
    slug = slugify(event.name);
    address = event.address_id?.full_address ?? undefined;
    price = event.price ?? undefined;
    eventDate = event.date;
  }

  return {
    title: item.title,
    description: item.description,
    image: `${DIRECTUS_URL}/assets/${item.image}`,
    date: formatItalianDate(eventDate),
    rawDate: eventDate,
    address,
    price,
    slug,
    eventId: item.event,
  };
}
