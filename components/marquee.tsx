const items = [
  "Websites",
  "Landing pages",
  "Portfolios",
  "Content planning",
  "Social growth",
  "Paid ads",
  "Lead generation",
  "Logos",
  "Brand guidelines",
  "Campaigns",
  "Creatives",
  "Strategy",
];

function Row({ reverse = false }: { reverse?: boolean }) {
  const list = [...items, ...items];
  return (
    <div className="flex overflow-hidden [--gap:1.5rem] [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
      <ul
        className={`flex shrink-0 animate-marquee items-center gap-[var(--gap)] pr-[var(--gap)] ${reverse ? "[animation-direction:reverse]" : ""}`}
      >
        {list.map((item, i) => (
          <li
            key={i}
            className="flex items-center gap-[var(--gap)] whitespace-nowrap font-display text-2xl font-medium text-white/80 sm:text-3xl"
          >
            {item}
            <span aria-hidden className="text-lavender/60">✦</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Marquee() {
  return (
    <section aria-label="What we do" className="relative border-y border-white/5 bg-night/40 py-8">
      <Row />
    </section>
  );
}
