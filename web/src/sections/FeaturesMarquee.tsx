import { features, fundTypes } from '../data/landing';

const MARQUEE_ITEMS = [
  ...features.items.map((item) => item.title),
  ...fundTypes.items.map((item) => item.title),
];

function MarqueeTrack() {
  return (
    <div className="flex shrink-0 items-center">
      {MARQUEE_ITEMS.map((title, i) => (
        <span key={i} className="mx-12 flex items-center gap-12">
          <span className="text-3xl font-black uppercase tracking-[0.15em] text-gold-900">
            {title}
          </span>
          <span className="text-3xl font-black text-gold-900/50">•</span>
        </span>
      ))}
    </div>
  );
}

export function FeaturesMarquee() {
  return (
    <section
      aria-label="All features and uses of our app"
      className="overflow-hidden border-y-4 border-gold-900 bg-[#F7C948] py-[15px] shadow-[inset_0_2px_12px_rgba(92,61,27,0.12)]"
    >
      <div className="flex w-max animate-marquee whitespace-nowrap">
        <MarqueeTrack />
        <div aria-hidden="true" className="flex shrink-0">
          <MarqueeTrack />
        </div>
      </div>
    </section>
  );
}
