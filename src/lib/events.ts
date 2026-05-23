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
  /** Flyer image width in pixels. */
  flyerWidth: number;
  /** Flyer image height in pixels. */
  flyerHeight: number;
  /** Full Directus asset URLs for the event photos, with dimensions. */
  photos?: { src: string; width: number; height: number }[];
}

/** Raw event shape returned by the Directus API. */
interface DirectusEvent {
  /** Event name as stored in Directus. */
  name: string;
  /** ISO date string (e.g. `"2025-04-20T12:00:00"`). */
  date: string;
  /** Expanded flyer file object with dimensions. */
  flyer: { id: string; width: number; height: number };
  /** Whether this event should appear in the gallery. */
  show_in_gallery: boolean;
  /** Junction table entries linking to photo file objects with dimensions. */
  photos?: { directus_files_id: { id: string; width: number; height: number } }[];
}

/**
 * Returns the 1-based index of a photo URL within its event's photos array.
 * @param src - The full asset URL of the photo.
 * @param photos - The event's photos array to search in.
 * @returns The 1-based index as a string (e.g. `"3"`).
 */
export function getPhotoId(src: string, photos: { src: string }[]): string {
  const index = photos.findIndex((p) => p.src === src);
  return String(index + 1);
}


/**
 * Fetches all events from the Directus CMS, sorted by date descending.
 * Photo and flyer paths are resolved to full Directus asset URLs.
 * @returns All events with normalized fields and full asset URLs.
 */
export async function getEvents(): Promise<Event[]> {
  const res = await fetch(`${DIRECTUS_URL}/items/event?fields=*,flyer.id,flyer.width,flyer.height,photos.directus_files_id.id,photos.directus_files_id.width,photos.directus_files_id.height&sort=-date`);
  const json = await res.json();
  const items: DirectusEvent[] = json.data;

  return items.filter((item) => item.show_in_gallery).map((item) => {
      const photos = item.photos?.map((p) => ({
        src: `${DIRECTUS_URL}/assets/${p.directus_files_id.id}`,
        width: p.directus_files_id.width,
        height: p.directus_files_id.height,
      }));

      return {
        title: item.name,
        date: item.date.slice(8, 10) + '/' + item.date.slice(5, 7) + '/' + item.date.slice(0, 4),
        dateEn: item.date.slice(5, 7) + '/' + item.date.slice(8, 10) + '/' + item.date.slice(0, 4),
        rawDate: item.date,
        flyer: `${DIRECTUS_URL}/assets/${item.flyer.id}`,
        flyerWidth: item.flyer.width,
        flyerHeight: item.flyer.height,
        photos: photos && photos.length > 0 ? photos : undefined,
      };
    });
}
