import { marked } from 'marked';

const DIRECTUS_URL = import.meta.env.DIRECTUS_URL;

/** A resolved genre. */
export interface Genre {
  id: number;
  name: string;
}

/** An artist with resolved genre names. */
export interface DetailArtist {
  name: string;
  description: string;
  photo: string;
  genres: string[];
  spotifyUrl?: string;
  bandcampUrl?: string;
}

/** Full event detail for the detail page. */
export interface EventDetail {
  title: string;
  date: string;
  description: string;
  flyer: string;
  /** [latitude, longitude] if the event has coordinates. */
  coordinates?: [number, number];
  artists: DetailArtist[];
}

/** Slugifies an event name: lowercase, spaces to hyphens, strip non-alphanumeric. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/** Fetches a single genre by ID. */
async function fetchGenre(id: number): Promise<string> {
  const res = await fetch(`${DIRECTUS_URL}/items/genre/${id}`);
  const json = await res.json();
  return json.data.name;
}

/** Resolves an array of genre IDs to genre names. */
async function resolveGenres(ids: number[]): Promise<string[]> {
  if (!ids || ids.length === 0) return [];
  return Promise.all(ids.map(fetchGenre));
}

/**
 * Returns all events as `{ slug, eventId }` pairs for static path generation.
 */
export async function getAllEventSlugs(): Promise<{ slug: string; eventId: number }[]> {
  const res = await fetch(`${DIRECTUS_URL}/items/event?fields=id,name`);
  const json = await res.json();
  return json.data.map((e: { id: number; name: string }) => ({
    slug: slugify(e.name),
    eventId: e.id,
  }));
}

/**
 * Fetches full event detail by slug.
 * Finds the event by slugified name, then fetches with artist relations and resolves genres.
 */
export async function getEventBySlug(slug: string): Promise<EventDetail | null> {
  // Fetch all events to find the one matching the slug
  const listRes = await fetch(`${DIRECTUS_URL}/items/event?fields=id,name`);
  const listJson = await listRes.json();
  const match = listJson.data.find(
    (e: { id: number; name: string }) => slugify(e.name) === slug,
  );
  if (!match) return null;

  // Fetch full detail with artists
  const res = await fetch(
    `${DIRECTUS_URL}/items/event/${match.id}?fields=*,artists.artist_id.*`,
  );
  const json = await res.json();
  const item = json.data;

  // Resolve artists with genres
  const artists: DetailArtist[] = await Promise.all(
    (item.artists ?? []).map(async (rel: any) => {
      const a = rel.artist_id;
      const genres = await resolveGenres(a.genres ?? []);
      return {
        name: a.name,
        description: a.description ?? '',
        photo: a.photo ? `${DIRECTUS_URL}/assets/${a.photo}` : '',
        genres,
        spotifyUrl: a.spotify_url ?? undefined,
        bandcampUrl: a.bandcamp_url ?? undefined,
      };
    }),
  );

  // GeoJSON Point comes as [longitude, latitude] — flip to [lat, lon]
  const coordinates: [number, number] | undefined = item.address?.coordinates
    ? [item.address.coordinates[1], item.address.coordinates[0]]
    : undefined;

  return {
    title: item.name,
    date:
      item.date.slice(8, 10) +
      '/' +
      item.date.slice(5, 7) +
      '/' +
      item.date.slice(0, 4),
    description: item.description ? await marked.parse(item.description) : '',
    flyer: `${DIRECTUS_URL}/assets/${item.flyer}`,
    coordinates,
    artists,
  };
}
