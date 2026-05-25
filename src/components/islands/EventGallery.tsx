import { useRef, useEffect, useState } from 'preact/hooks';

interface PhotoItem {
  src: string;
  srcset?: string;
  originalSrc: string;
  id: string;
  width: number;
  height: number;
}

interface Props {
  title: string;
  displayDate: string;
  flyerSrc: string;
  flyerSrcset?: string;
  flyerOriginal: string;
  flyerWidth: number;
  flyerHeight: number;
  photos: PhotoItem[];
  photoDate: string;
  year: string;
  hasPhotos: boolean;
}

function LazyPhoto({ photo, date }: { photo: PhotoItem; date: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [offset, setOffset] = useState(0);
  const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || !isDesktop) return;
    const el = ref.current;
    if (!el) return;

    function onScroll() {
      const rect = el!.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const viewCenter = window.innerHeight / 2;
      setOffset((center - viewCenter) * 0.03);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [visible]);

  return (
    <div
      ref={ref}
      class={`transition-all duration-700 ease-out ${visible ? '' : isDesktop ? 'opacity-0 translate-y-8' : 'opacity-0'}`}
      style={{ transform: visible && isDesktop ? `translateY(${offset}px)` : undefined }}
    >
      {visible ? (
        <img
          src={photo.src}
          srcset={photo.srcset}
          alt=""
          width={photo.width}
          height={photo.height}
          class="w-full block rounded-lg grayscale hover:grayscale-0 transition duration-300 cursor-pointer select-none"
          style={{ WebkitTouchCallout: 'none' }}
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          data-photo-src={photo.originalSrc}
          data-photo-date={date}
          data-photo-id={photo.id}
        />
      ) : (
        <div
          style={{ width: '100%', paddingBottom: `${(photo.height / photo.width) * 100}%` }}
          class="rounded-lg bg-gray-200"
        />
      )}
    </div>
  );
}

function PhotoColumn({ photos, date, className }: { photos: PhotoItem[]; date: string; className?: string }) {
  return (
    <div class={className}>
      {photos.map((photo) => (
        <LazyPhoto key={photo.id} photo={photo} date={date} />
      ))}
    </div>
  );
}

export default function EventGallery({
  title,
  displayDate,
  flyerSrc,
  flyerSrcset,
  flyerOriginal,
  flyerWidth,
  flyerHeight,
  photos,
  photoDate,
  year,
  hasPhotos,
}: Props) {
  const leftPhotos = photos.filter((_, i) => i % 2 === 0);
  const rightPhotos = photos.filter((_, i) => i % 2 !== 0);

  if (!hasPhotos) {
    return (
      <section data-year={year} class="relative grid grid-cols-1 md:grid-cols-2 gap-12 px-6 py-12 md:min-h-[calc(100vh-5rem)] md:pb-20 max-w-5xl mx-auto items-center">
        <div class="flex justify-center">
          <img
            src={flyerSrc}
            srcset={flyerSrcset}
            alt=""
            width={flyerWidth}
            height={flyerHeight}
            class="w-full max-w-sm block rounded-lg cursor-pointer select-none"
            style={{ WebkitTouchCallout: 'none' }}
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            data-flyer-src={flyerOriginal}
          />
        </div>
        <div class="flex flex-col gap-4">
          <h2 class="text-3xl font-bold font-display">{title}</h2>
          <p class="text-sm opacity-60">{displayDate}</p>
        </div>
      </section>
    );
  }

  return (
    <section data-year={year} class="grid grid-cols-1 md:grid-cols-[1fr_1.2fr_1fr] gap-12 px-6 pb-8 pt-12 md:pb-12 md:pt-28 max-w-6xl mx-auto">
      <PhotoColumn photos={leftPhotos} date={photoDate} className="hidden md:flex flex-col gap-40" />

      <div class="md:sticky md:top-[calc(var(--header-bottom)+1rem)] md:self-start text-center">
        <h2 class="text-3xl font-bold font-display mt-8">{title}</h2>
        <p class="text-sm opacity-60 mt-1 mb-6">{displayDate}</p>
        <img
          src={flyerSrc}
          alt=""
          width={flyerWidth}
          height={flyerHeight}
          class="w-full block rounded-lg cursor-pointer select-none"
          style={{ WebkitTouchCallout: 'none' }}
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          data-flyer-src={flyerOriginal}
        />
      </div>

      <PhotoColumn photos={rightPhotos} date={photoDate} className="hidden md:flex flex-col gap-40 mt-12" />

      {/* Mobile: photos below flyer */}
      <PhotoColumn photos={photos} date={photoDate} className="flex flex-col gap-8 md:hidden" />
    </section>
  );
}
