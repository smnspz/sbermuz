import { DIRECTUS_URL } from './constants';

/** A normalized artist. */
export interface Artist {
  /** Artist name. */
  name: string;
  /** Short bio. */
  description: string;
  /** Full Directus asset URL for the artist photo. */
  photo: string;
  /** Spotify artist page URL. */
  spotifyUrl?: string;
  /** Bandcamp page URL. */
  bandcampUrl?: string;
}

/** A normalized event with display-ready fields and full asset URLs. */
export interface Event {
  /** Display name of the event. */
  title: string;
  /** Human-readable date in `dd/mm/yyyy` format (Italian). */
  date: string;
  /** Human-readable date in `mm/dd/yyyy` format (English). */
  dateEn: string;
  /** Original ISO date string from Directus (e.g. `"2025-04-20T12:00:00"`). */
  rawDate: string;
  /** Full Directus asset URL for the event flyer image. */
  flyer: string;
  /** Full Directus asset URLs for the event photos. */
  photos?: string[];
}

/** Raw event shape returned by the Directus API. */
interface DirectusEvent {
  /** Event name as stored in Directus. */
  name: string;
  /** ISO date string (e.g. `"2025-04-20T12:00:00"`). */
  date: string;
  /** UUID of the flyer image asset. */
  flyer: string;
  /** Whether this event should appear in the gallery. */
  show_in_gallery: boolean;
  /** Junction table entries linking to photo file UUIDs. */
  photos?: { directus_files_id: string }[];
}

/**
 * Returns the 1-based index of a photo URL within its event's photos array.
 * @param src - The full asset URL of the photo.
 * @param photos - The event's photos array to search in.
 * @returns The 1-based index as a string (e.g. `"3"`).
 */
export function getPhotoId(src: string, photos: string[]): string {
  const index = photos.indexOf(src);
  return String(index + 1);
}


/**
 * Fetches all events from the Directus CMS, sorted by date descending.
 * Photo and flyer paths are resolved to full Directus asset URLs.
 * @returns All events with normalized fields and full asset URLs.
 */
export async function getEvents(): Promise<Event[]> {
  const res = await fetch(`${DIRECTUS_URL}/items/event?fields=*,photos.directus_files_id&sort=-date`);
  const json = await res.json();
  const items: DirectusEvent[] = json.data;

  return items.filter((item) => item.show_in_gallery).map((item) => {
      const photos = item.photos?.map(
        (p) => `${DIRECTUS_URL}/assets/${p.directus_files_id}`,
      );

      return {
        title: item.name,
        date: item.date.slice(8, 10) + '/' + item.date.slice(5, 7) + '/' + item.date.slice(0, 4),
        dateEn: item.date.slice(5, 7) + '/' + item.date.slice(8, 10) + '/' + item.date.slice(0, 4),
        rawDate: item.date,
        flyer: `${DIRECTUS_URL}/assets/${item.flyer}`,
        photos: photos && photos.length > 0 ? photos : undefined,
      };
    });
}
