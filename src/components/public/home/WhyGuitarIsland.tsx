import { Award, HandHeart, Music, Truck } from "lucide-react";

const FEATURES = [
  {
    icon: Music,
    title: "Handpicked Instruments",
    description:
      "Every guitar on our wall is personally selected for tone, playability, and character.",
  },
  {
    icon: HandHeart,
    title: "Try Before You Buy",
    description:
      "Come to our store, plug in, and feel the instrument in your hands before deciding.",
  },
  {
    icon: Award,
    title: "Expert Setup Included",
    description:
      "Free professional setup with every purchase — action, intonation, and playability tuned.",
  },
  {
    icon: Truck,
    title: "Local & Trusted",
    description:
      "We're a real shop with real people. Call, visit, or reach us on WhatsApp anytime.",
  },
];

export default function WhyGuitarIsland() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-14">
        <h2 className="font-display text-3xl md:text-4xl text-ink mb-3">
          Why Guitar Island
        </h2>
        <p className="text-ink/60 max-w-2xl mx-auto">
          We're not just a shop — we're musicians helping musicians find their
          sound.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="text-center p-6 rounded-2xl hover:bg-cream/60 transition-colors"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brass/10 text-brass mb-5">
              <Icon className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg text-ink mb-2">{title}</h3>
            <p className="text-sm text-ink/60 leading-relaxed">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}