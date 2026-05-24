import { DIRECTUS_URL } from './constants';
import { formatDate } from './datetime';
import { slugify } from './eventDetail';

/** Hero section data. */
export interface Hero {
  /** Hero title (event name). */
  title: string;
  /** Hero description text (event description, raw markdown). */
  description: string;
  /** Full Directus asset URL for the hero image (event flyer). */
  image: string;
  /** Hero image width in pixels. */
  imageWidth: number;
  /** Hero image height in pixels. */
  imageHeight: number;
  /** Italian-formatted date with time. */
  date: string;
  /** English-formatted date with time. */
  dateEn: string;
  /** Raw ISO date string for calendar generation. */
  rawDate: string;
  /** Event address string. */
  address?: string;
  /** Event price text (null = free). */
  price?: string;
  /** Slug for the associated event detail page. */
  slug: string;
  /** ID of the associated event in Directus. */
  eventId: number;
}

function formatPrice(value: string): string {
  const n = parseFloat(value);
  return n % 1 === 0 ? `${n}€` : `${n.toFixed(2)}€`;
}

/**
 * Fetches the hero section data from the Directus CMS.
 * All hero data comes from the linked event.
 * @returns The hero content with resolved asset URL, event slug, and event details.
 */
export async function getHero(): Promise<Hero> {
  const res = await fetch(
    `${DIRECTUS_URL}/items/hero?fields=event.*,event.address_id.full_address,event.flyer.width,event.flyer.height,event.flyer.id`,
  );
  const json = await res.json();
  const event = json.data.event;

  return {
    title: event.name,
    description: event.description ?? '',
    image: `${DIRECTUS_URL}/assets/${event.flyer.id}`,
    imageWidth: event.flyer.width,
    imageHeight: event.flyer.height,
    date: formatDate(event.date, 'it'),
    dateEn: formatDate(event.date, 'en'),
    rawDate: event.date,
    address: event.address_id?.full_address ?? undefined,
    price: event.price != null ? formatPrice(event.price) : undefined,
    slug: slugify(event.name),
    eventId: event.id,
  };
}
