import Image from "next/image";
import Link from "next/link";
import { Award, Heart, Music, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About — Guitar Island",
  description:
    "Our story, our mission, and why we do what we do at Guitar Island.",
};

const VALUES = [
  {
    icon: Music,
    title: "Musicians First",
    description:
      "We're players too. Every recommendation comes from experience, not a sales pitch.",
  },
  {
    icon: Heart,
    title: "Honest Advice",
    description:
      "We'll tell you when a cheaper guitar is the right call, and when it isn't.",
  },
  {
    icon: Award,
    title: "Craft & Care",
    description:
      "Every instrument gets a professional setup before it goes home with you.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "We host jam sessions, workshops, and events for the local music scene.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-ink text-cream py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-brass uppercase tracking-widest text-sm mb-4">
            Our Story
          </p>
          <h1 className="font-display text-4xl md:text-6xl mb-6 leading-tight">
            Built by Musicians,
            <br />
            For Musicians
          </h1>
          <p className="text-cream/70 text-lg max-w-2xl mx-auto leading-relaxed">
            Guitar Island started as a small collection of instruments and a
            big dream — to help people find the guitar that speaks to them.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-cream/50">
            <Image
              src="https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80"
              alt="Guitar Island shop"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="font-display text-3xl md:text-4xl text-ink mb-4">
              A Shop With a Soul
            </h2>
            <div className="space-y-4 text-ink/70 leading-relaxed">
              <p>
                We opened Guitar Island because we saw a gap: too many shops
                treat guitars like inventory, not instruments. We wanted to
                build something different — a place where you can actually
                spend time with a guitar before deciding.
              </p>
              <p>
                Every instrument on our wall is handpicked. We play them, we
                set them up, and we only stock what we'd happily play
                ourselves.
              </p>
              <p>
                Whether you're buying your first guitar or your fifteenth,
                you'll get the same honest advice and genuine enthusiasm.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-cream/40 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl text-ink mb-3">
              What We Stand For
            </h2>
            <p className="text-ink/60 max-w-2xl mx-auto">
              Four principles that guide everything we do.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brass/10 text-brass mb-5">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg text-ink mb-2">
                  {title}
                </h3>
                <p className="text-sm text-ink/60 leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="font-display text-3xl md:text-4xl text-ink mb-4">
          Come Say Hello
        </h2>
        <p className="text-ink/60 mb-8">
          Our doors are always open. Come play a few guitars, ask questions,
          and find your sound.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            asChild
            size="lg"
            className="bg-brass hover:bg-brass/90 text-ink font-semibold"
          >
            <Link href="/shop">Browse Guitars</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/contact">Visit Our Store</Link>
          </Button>
        </div>
      </section>
    </>
  );
}