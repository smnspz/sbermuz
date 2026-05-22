import { toIcsDate } from './datetime';

interface IcsEventOptions {
  title: string;
  description: string;
  date: string;
  address?: string;
  /** Event duration in hours. Defaults to 4. */
  durationHours?: number;
}

/** Generates an ICS calendar file string for a single event. */
export function generateIcs(options: IcsEventOptions): string {
  const { title, description, date, address, durationHours = 4 } = options;
  const start = new Date(date);
  const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Sbermuz//Event//IT',
    'BEGIN:VEVENT',
    `DTSTART:${toIcsDate(start)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${title}`,
    address ? `LOCATION:${address}` : '',
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');
}
