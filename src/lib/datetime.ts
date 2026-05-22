import { DAYS, MONTHS } from './constants';

/** Formats an ISO date string to Italian format: "Ven 22 maggio 2026 · 21:00" */
export function formatItalianDate(iso: string): string {
  const d = new Date(iso);
  const day = DAYS[d.getDay()];
  const date = d.getDate();
  const month = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${date} ${month} ${year} · ${hours}:${minutes}`;
}

/**
 * Extracts a `YYYYMMDD` date slug from an ISO date string.
 * @param dateStr - An ISO date string (e.g. `"2025-04-20T12:00:00"`).
 * @returns The date formatted as `YYYYMMDD` (e.g. `"20250420"`).
 */
export function getPhotoDate(dateStr: string): string {
  return dateStr.replace(/-/g, '').slice(0, 8);
}

/** Format a Date to ICS DTSTART/DTEND value (local time, no timezone). */
export function toIcsDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
}
