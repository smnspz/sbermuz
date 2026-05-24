import { marked } from 'marked';

import { DIRECTUS_URL } from './constants';

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
  dateEn: string;
  rawDate: string;
  description: string;
  flyer: string;
  /** [latitude, longitude] if the event has coordinates. */
  coordinates?: [number, number];
  address?: string;
  artists: DetailArtist[];
}

/** Slugifies an event name: lowercase, spaces to hyphens, strip non-alphanumeric. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
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
    `${DIRECTUS_URL}/items/event/${match.id}?fields=*,address_id.full_address,address_id.coordinates,artists.artist_id.*,artists.artist_id.genres.genre_id.name`,
  );
  const json = await res.json();
  const item = json.data;

  // Resolve artists with genres (expanded via the junction relation)
  const artists: DetailArtist[] = (item.artists ?? []).map((rel: any) => {
    const a = rel.artist_id;
    const genres = (a.genres ?? [])
      .map((g: any) => g.genre_id?.name)
      .filter(Boolean);
    return {
      name: a.name,
      description: a.description ?? '',
      photo: a.photo ? `${DIRECTUS_URL}/assets/${a.photo}` : '',
      genres,
      spotifyUrl: a.spotify_url ?? undefined,
      bandcampUrl: a.bandcamp_url ?? undefined,
    };
  });

  // GeoJSON Point comes as [longitude, latitude] — flip to [lat, lon]
  const coordinates: [number, number] | undefined = item.address_id?.coordinates?.coordinates
    ? [item.address_id.coordinates.coordinates[1], item.address_id.coordinates.coordinates[0]]
    : undefined;

  return {
    title: item.name,
    date:
      item.date.slice(8, 10) +
      '/' +
      item.date.slice(5, 7) +
      '/' +
      item.date.slice(0, 4),
    dateEn:
      item.date.slice(5, 7) +
      '/' +
      item.date.slice(8, 10) +
      '/' +
      item.date.slice(0, 4),
    rawDate: item.date,
    description: item.description ? await marked.parse(item.description) : '',
    flyer: `${DIRECTUS_URL}/assets/${item.flyer}`,
    coordinates,
    address: item.address_id?.full_address ?? undefined,
    artists,
  };
}
