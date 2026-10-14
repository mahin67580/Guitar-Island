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
      <section className="bg-ink text-cream py-20 mt-15">
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
              src="/shop.jpg"
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


    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
    {/* Text — on left on desktop, below on mobile */}
    <div className="order-2 lg:order-1">
      <h2 className="font-display text-3xl md:text-4xl text-ink mb-6">
        Meet Mukit
      </h2>

      <p className="text-ink/70 leading-relaxed mb-4">
        Mukit started Guitar Island because he was tired of walking into guitar
        shops that felt like warehouses. He wanted a place where you could sit
        down, plug in, and actually <em>hear</em> an instrument before you
        commit — the way he learned to play himself.
      </p>

      <p className="text-ink/70 leading-relaxed mb-4">
        He's a musician first and a shopkeeper second. Every guitar on the wall
        has been in his hands. Every setup on the bench is his own work. He
        knows which necks feel right for small hands, which amps flatter a
        beginner's first chords, and which guitars are worth stretching your
        budget for.
      </p>

      <p className="text-ink/70 leading-relaxed mb-4">
        What he cares about most is that you leave with the <em>right</em>
        instrument — not the most expensive one. Whether it's your first
        ukulele or your fifteenth electric, you'll get the same honest answer,
        the same patient demo, and the same enthusiasm he'd want if he were
        the one buying.
      </p>

      <p className="text-ink/70 leading-relaxed mb-4">
        When he's not behind the counter, he's usually out chasing waterfalls,
        exploring the hills, or playing something acoustic under the open sky.
        That love of sound — and of the places it takes you — is what Guitar
        Island is really built on.
      </p>

      <p className="text-ink/70 leading-relaxed">
        Drop by, say hi, and let him help you find the sound you've been
        chasing.
      </p>

      <p className="mt-6 text-sm text-ink/50 italic">
        Mukit Mazumder · Founder &amp; Owner
      </p>
    </div>

    {/* Image — on right on desktop, above on mobile */}
    <div className="order-1 lg:order-2">
      <div className="relative aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] rounded-3xl overflow-hidden bg-cream/50">
        <Image
          src="/mukit.jpg"
          alt="Mukit Mazumder — Founder of Guitar Island"
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-[85%_center]"
        />
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