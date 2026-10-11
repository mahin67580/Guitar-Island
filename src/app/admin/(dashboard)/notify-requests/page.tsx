import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Notify Requests — Admin" };

export default function Page() {
  return (
    <div className="max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-2xl">Notify Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-ink/60">
            This page will be built in a later phase.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}