import { Clock, Mail, MapPin, Phone } from "lucide-react";
import ContactForm from "@/components/public/contact/ContactForm";

export const metadata = {
  title: "Contact — Guitar Island",
  description:
    "Visit our shop, call us, or send a message. We're here to help you find your sound.",
};

const INFO = [
  {
    icon: MapPin,
    label: "Visit Us",
    lines: ["Your shop address, Dhaka, Bangladesh"],
  },
  {
    icon: Phone,
    label: "Call Us",
    lines: ["+880 1700-000000"],
    href: "tel:+8801700000000",
  },
  {
    icon: Mail,
    label: "Email",
    lines: ["hello@guitarisland.com"],
    href: "mailto:hello@guitarisland.com",
  },
  {
    icon: Clock,
    label: "Opening Hours",
    lines: [
      "Sat – Thu: 10:00 AM – 9:00 PM",
      "Friday: 3:00 PM – 9:00 PM",
    ],
  },
];

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12 text-center">
        <p className="text-brass uppercase tracking-widest text-sm mb-3">
          Get In Touch
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-ink mb-3">
          We'd Love to Hear From You
        </h1>
        <p className="text-ink/60 max-w-2xl mx-auto">
          Questions about a guitar? Want to schedule a visit? Drop us a
          message or just give us a call.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Info panel */}
        <div className="lg:col-span-2 space-y-4">
          {INFO.map(({ icon: Icon, label, lines, href }) => (
            <div
              key={label}
              className="p-5 rounded-2xl border border-black/5 bg-white"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-full bg-brass/10 text-brass flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-ink/50 mb-1">
                    {label}
                  </p>
                  {lines.map((line, i) =>
                    href ? (
                      <a
                        key={i}
                        href={href}
                        className="block text-ink hover:text-brass transition-colors"
                      >
                        {line}
                      </a>
                    ) : (
                      <p key={i} className="text-ink">
                        {line}
                      </p>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Map */}
          <div className="rounded-2xl overflow-hidden border border-black/5 aspect-square">
            <iframe
              title="Guitar Island location"
              src="https://www.google.com/maps?q=Dhaka,Bangladesh&output=embed"
              className="w-full h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-3">
          <div className="p-6 md:p-8 rounded-2xl border border-black/5 bg-white">
            <h2 className="font-display text-2xl text-ink mb-6">
              Send Us a Message
            </h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}