"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { saveSettings } from "@/lib/admin/settings-actions";

type Props = { initialSettings: Record<string, any> };

export default function SettingsForm({ initialSettings }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    store_name: initialSettings.store_name || "Guitar Island",
    address: initialSettings.address || "",
    phone: initialSettings.phone || "",
    whatsapp: initialSettings.whatsapp || "",
    email: initialSettings.email || "",
    hours: initialSettings.hours || "",
    facebook: initialSettings.facebook || "https://www.facebook.com/GUITAR.ISLAND",
    instagram: initialSettings.instagram || "",
    google_maps_query: initialSettings.google_maps_query || "Dhaka,Bangladesh",
    hero_headline: initialSettings.hero_headline || "Find Your Sound at",
    hero_subheadline:
      initialSettings.hero_subheadline ||
      "Browse our collection, come play in-store, and walk out with the guitar you were meant to play.",
  });

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await saveSettings(form);
    setSubmitting(false);
    if (res.error) return toast.error(res.error);
    toast.success("Settings saved");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Store Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field
            label="Store Name"
            value={form.store_name}
            onChange={(v) => handleChange("store_name", v)}
          />
          <Field
            label="Address"
            value={form.address}
            onChange={(v) => handleChange("address", v)}
            textarea
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Phone"
              value={form.phone}
              onChange={(v) => handleChange("phone", v)}
            />
            <Field
              label="WhatsApp (digits only, with country code)"
              value={form.whatsapp}
              onChange={(v) => handleChange("whatsapp", v)}
              placeholder="8801700000000"
            />
          </div>
          <Field
            label="Email"
            value={form.email}
            onChange={(v) => handleChange("email", v)}
            type="email"
          />
          <Field
            label="Opening Hours"
            value={form.hours}
            onChange={(v) => handleChange("hours", v)}
            textarea
            placeholder="Sat – Thu: 10:00 AM – 9:00 PM&#10;Friday: 3:00 PM – 9:00 PM"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Social & Location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field
            label="Facebook URL"
            value={form.facebook}
            onChange={(v) => handleChange("facebook", v)}
          />
          <Field
            label="Instagram URL"
            value={form.instagram}
            onChange={(v) => handleChange("instagram", v)}
          />
          <Field
            label="Google Maps Search Query"
            value={form.google_maps_query}
            onChange={(v) => handleChange("google_maps_query", v)}
            placeholder="e.g. Guitar Island Dhaka"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Homepage Hero</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field
            label="Hero Headline"
            value={form.hero_headline}
            onChange={(v) => handleChange("hero_headline", v)}
          />
          <Field
            label="Hero Subheadline"
            value={form.hero_subheadline}
            onChange={(v) => handleChange("hero_subheadline", v)}
            textarea
          />
        </CardContent>
      </Card>

      <div className="sticky bottom-4 bg-cream/95 backdrop-blur rounded-xl border border-black/5 p-4 flex justify-end">
        <Button
          type="submit"
          disabled={submitting}
          className="bg-brass hover:bg-brass/90 text-ink font-semibold"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Settings
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      {textarea ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder={placeholder}
        />
      ) : (
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}