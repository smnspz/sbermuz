import { useEffect, useRef, useState } from 'preact/hooks';

interface TocEntry {
  id: string;
  label: string;
  children?: { id: string; label: string }[];
}

interface Props {
  title: string;
  entries: TocEntry[];
  ariaLabel: string;
}

export default function TableOfContentsRail({ title, entries, ariaLabel }: Props) {
  const navRef = useRef<HTMLElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    nav.style.setProperty('--toc-offset', `${nav.offsetHeight / 2}px`);

    const ids = entries.flatMap((e) =>
      [e.id, ...(e.children?.map((c) => c.id) ?? [])]
    );
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (observedEntries) => {
        observedEntries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-33% 0px -66% 0px' },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [entries]);

  const linkClass = (id: string) => {
    const isActive = activeId === id;
    return [
      'block py-1 border-l-[1.5px] transition-opacity',
      isActive ? 'border-black opacity-100' : 'border-transparent opacity-60 hover:opacity-100',
    ].join(' ');
  };

  return (
    <nav
      ref={navRef}
      class="sticky top-[calc(50vh-var(--toc-offset,0px))]"
      aria-label={ariaLabel}
    >
      <p class="text-xs font-bold uppercase tracking-wide opacity-50 mb-3">
        {title}
      </p>
      <ul class="flex flex-col gap-1 text-sm">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              class={`${linkClass(entry.id)} pl-3`}
              {...(activeId === entry.id ? { 'aria-current': 'location' } : {})}
            >
              {entry.label}
            </a>
            {entry.children && entry.children.length > 0 && (
              <ul class="flex flex-col gap-1 mt-1">
                {entry.children.map((child) => (
                  <li key={child.id}>
                    <a
                      href={`#${child.id}`}
                      class={`${linkClass(child.id)} pl-6`}
                      {...(activeId === child.id ? { 'aria-current': 'location' } : {})}
                    >
                      {child.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
