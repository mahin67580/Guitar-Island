"use client";

import { Award, HandHeart, Music, Truck } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: Music,
    title: "Handpicked Instruments",
    description:
      "Every guitar on our wall is personally selected for tone, playability, and character.",
    image: "/Try Before You Buy at Guitar Island.png",
    position: "top-left",
    color: "#7C5CE0",
    colorBack: "#5C3FB8",
    accent: "#B8A6F0",
  },
  {
    icon: HandHeart,
    title: "Try Before You Buy",
    description:
      "Come to our store, plug in, and feel the instrument in your hands before deciding.",
    image: "/Try Before You Buy at Guitar Island.png",
    position: "top-right",
    color: "#F5B22A",
    colorBack: "#D99718",
    accent: "#FBD27A",
  },
  {
    icon: Award,
    title: "Expert Setup Included",
    description:
      "Free professional setup with every purchase — action, intonation, and playability tuned.",
    image: "/Try Before You Buy at Guitar Island.png",
    position: "bottom-left",
    color: "#2EB6B6",
    colorBack: "#218C8C",
    accent: "#8CDCDC",
  },
  {
    icon: Truck,
    title: "Local & Trusted",
    description:
      "We're a real shop with real people. Call, visit, or reach us on WhatsApp anytime.",
    image: "/Try Before You Buy at Guitar Island.png",
    position: "bottom-right",
    color: "#9ACD3A",
    colorBack: "#7BA326",
    accent: "#C9E88A",
  },
] as const;

type Feature = (typeof FEATURES)[number];

export default function WhyGuitarIsland() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Heading */}
      <div className="text-center mb-14">
        <h2 className="font-display text-3xl md:text-4xl text-ink mb-3">
          Why Guitar Island
        </h2>
        <p className="text-ink/60 max-w-2xl mx-auto">
          We're not just a shop — we're musicians helping musicians find their
          sound.
        </p>
      </div>

      {/* ── Desktop radial layout (lg+) ─────────────────────── */}
      <div className="hidden lg:block relative h-[520px]">
        {/* Center logo + horizontal line */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="relative flex items-center justify-center">
            {/* Horizontal line through the logo */}
            <div className="absolute left-1/2 -translate-x-1/2 w-[440px] h-[2px] bg-ink/70" />
            {/* Logo */}
            <img
              src="/logo.png"
              alt="Guitar Island"
              className="relative w-80 h-80 object-contain drop-shadow-xl animate-float-slow"
            />
          </div>
        </div>

        {/* Cards */}
        {FEATURES.map((feature, i) => (
          <CardWithPopup
            key={feature.title}
            feature={feature}
            index={i}
            isHovered={hovered === feature.title}
            onHover={setHovered}
          />
        ))}
      </div>

      {/* ── Mobile / tablet stacked layout ─────────────────── */}
      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-8">
        {FEATURES.map((feature) => (
          <MobileCard key={feature.title} feature={feature} />
        ))}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────── */
/* Desktop card with popup preview                          */
/* ──────────────────────────────────────────────────────── */

function CardWithPopup({
  feature,
  index,
  isHovered,
  onHover,
}: {
  feature: Feature;
  index: number;
  isHovered: boolean;
  onHover: (title: string | null) => void;
}) {
  const Icon = feature.icon;

  const positionClasses: Record<Feature["position"], string> = {
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0",
    "bottom-left": "bottom-0 left-0",
    "bottom-right": "bottom-0 right-0",
  };

  const popupSide: Record<Feature["position"], string> = {
    "top-left": "left-full ml-4 top-1/2 -translate-y-1/2",
    "top-right": "right-full mr-4 top-1/2 -translate-y-1/2",
    "bottom-left": "left-full ml-4 top-1/2 -translate-y-1/2",
    "bottom-right": "right-full mr-4 top-1/2 -translate-y-1/2",
  };

  const floatDelay = `${index * 0.6}s`;

  return (
    <div
      className={cn(
        "absolute w-[360px] group",
        positionClasses[feature.position],
         "animate-float transition-[z-index]",
    isHovered ? "z-50" : "z-20"
      )}
      style={{ animationDelay: floatDelay }}
      onMouseEnter={() => onHover(feature.title)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Connector dot toward the logo */}
      <ConnectorDot position={feature.position} color={feature.colorBack} />

      {/* Card wrapper — hover lift + slight rotation */}
      <div
        className="relative transition-transform duration-300 group-hover:-translate-y-1"
        style={{
          transform: `rotate(${
            feature.position.includes("top") ? -1.2 : 1.2
          }deg)`,
        }}
      >
        {/* Back layer — offset + rotated, darker shade */}
        <div
          className="absolute inset-0 rounded-[28px] translate-x-3 translate-y-3 rotate-[3deg] transition-transform duration-300 group-hover:translate-x-4 group-hover:translate-y-4"
          style={{ backgroundColor: feature.colorBack }}
        />

        {/* Front layer — the actual card body */}
        <div
          className="relative rounded-[28px] p-6 pb-7 shadow-lg transition-shadow duration-300 group-hover:shadow-2xl"
          style={{ backgroundColor: feature.color }}
        >
          {/* Giant quote mark top-right */}
          <span
            className="absolute top-1 right-5 font-serif text-6xl leading-none select-none opacity-40"
            style={{ color: "white" }}
          >
            &rdquo;
          </span>

          {/* Icon + Title */}
          <div className="flex items-center gap-3 mb-3">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/25 backdrop-blur-sm text-white shrink-0 ring-1 ring-white/40">
              <Icon className="w-5 h-5" strokeWidth={2.4} />
            </div>
            <h3 className="font-bold text-base md:text-lg text-white leading-tight drop-shadow-sm">
              {feature.title}
            </h3>
          </div>

          {/* Description */}
          <p className="text-[13.5px] text-white/95 leading-relaxed">
            {feature.description}
          </p>
        </div>

        {/* Floating accent dots around the card */}
        <span
          className="absolute -top-3 left-6 w-3 h-3 rounded-full"
          style={{ backgroundColor: feature.accent }}
        />
        <span
          className="absolute -bottom-2 right-8 w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: feature.accent }}
        />
        <span
          className="absolute -right-2 top-1/2 w-2 h-2 rounded-full"
          style={{ backgroundColor: feature.accent }}
        />
      </div>

      {/* Hover popup with image */}
      <div
        className={cn(
          "absolute z-20 w-[700px] pointer-events-none",
          "transition-all duration-300",
          popupSide[feature.position],
          isHovered
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-2"
        )}
      >
        <div className="rounded-2xl overflow-hidden border-2 border-ink/80 bg-white shadow-2xl">
          <img
            src={feature.image}
            alt={feature.title}
            className="w-full h-100 object-cover"
          />
          {/* <div className="px-3 py-2 text-xs text-ink/70 font-medium">
            {feature.title}
          </div> */}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/* Small connector dot                                       */
/* ──────────────────────────────────────────────────────── */

function ConnectorDot({
  position,
  color,
}: {
  position: Feature["position"];
  color: string;
}) {
  const dotPos: Record<Feature["position"], string> = {
    "top-left": "top-1/2 -right-1 -translate-y-1/2",
    "top-right": "top-1/2 -left-1 -translate-y-1/2",
    "bottom-left": "top-1/2 -right-1 -translate-y-1/2",
    "bottom-right": "top-1/2 -left-1 -translate-y-1/2",
  };

  return (
    <span
      className={cn(
        "absolute w-3 h-3 rounded-sm rotate-45 border-2 z-20",
        dotPos[position]
      )}
      style={{ backgroundColor: "white", borderColor: color }}
    />
  );
}

/* ──────────────────────────────────────────────────────── */
/* Mobile card (same colorful style, no popup, no rotation) */
/* ──────────────────────────────────────────────────────── */

function MobileCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;

  return (
    <div className="relative transition-transform duration-300 hover:-translate-y-1">
      {/* Back layer */}
      <div
        className="absolute inset-0 rounded-[24px] translate-x-2 translate-y-2 rotate-[2deg]"
        style={{ backgroundColor: feature.colorBack }}
      />

      {/* Front layer */}
      <div
        className="relative rounded-[24px] p-5 pb-6 shadow-lg"
        style={{ backgroundColor: feature.color }}
      >
        {/* Quote mark */}
        <span
          className="absolute top-1 right-4 font-serif text-5xl leading-none select-none opacity-40"
          style={{ color: "white" }}
        >
          &rdquo;
        </span>

        <div className="flex items-center gap-3 mb-3">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/25 text-white shrink-0 ring-1 ring-white/40">
            <Icon className="w-5 h-5" strokeWidth={2.4} />
          </div>
          <h3 className="font-bold text-base text-white leading-tight drop-shadow-sm">
            {feature.title}
          </h3>
        </div>

        <p className="text-[13px] text-white/95 leading-relaxed">
          {feature.description}
        </p>
      </div>

      {/* Accent dots */}
      <span
        className="absolute -top-2 left-5 w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: feature.accent }}
      />
      <span
        className="absolute -bottom-2 right-6 w-2 h-2 rounded-full"
        style={{ backgroundColor: feature.accent }}
      />
    </div>
  );
}