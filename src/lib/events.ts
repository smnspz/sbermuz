import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export interface Event {
  title: string;
  date: string;
  description?: string;
  ctaText?: string;
  ctaUrl?: string;
  flyer: string;
  photos?: string[];
}

/** Extracts `001` from `/20250420/001-20250420.jpg` */
export function getPhotoId(path: string): string {
  const filename = path.split('/').pop() ?? '';
  return filename.split('-')[0];
}

/** Extracts `20250420` from `/20250420/001-20250420.jpg` */
export function getPhotoDate(path: string): string {
  const parts = path.split('/').filter(Boolean);
  return parts[0];
}

export function getEvents(): Event[] {
  const publicDir = join(process.cwd(), 'public');
  const eventDirs = readdirSync(publicDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^\d{8}$/.test(d.name))
    .map((d) => d.name)
    .sort((a, b) => b.localeCompare(a));

  return eventDirs.map((dir) => {
    const files = readdirSync(join(publicDir, dir));
    const flyer = `/${dir}/flyer.jpg`;
    const photos = files
      .filter((f) => f !== 'flyer.jpg' && f !== 'info.json' && /\.(jpe?g|png|webp)$/i.test(f))
      .sort()
      .map((f) => `/${dir}/${f}`);

    const infoPath = join(publicDir, dir, 'info.json');
    const info = existsSync(infoPath)
      ? JSON.parse(readFileSync(infoPath, 'utf-8'))
      : { title: dir, date: `${dir.slice(0, 4)}-${dir.slice(4, 6)}-${dir.slice(6, 8)}` };

    return {
      title: info.title,
      date: info.date,
      description: info.description,
      ctaText: info.ctaText,
      ctaUrl: info.ctaUrl,
      flyer,
      photos: photos.length > 0 ? photos : undefined,
    };
  });
}
