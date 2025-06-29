// File: voice-text-note-processor/app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VoiceRecorder } from "@/components/voice-recorder";
import { ProcessedItemsList } from "@/components/processed-items-list";
import { ProcessingIndicator } from "@/components/processing-indicator";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Voice Notes</h1>
        <p className="text-muted-foreground">
          Record your thoughts and let AI organize them for you
        </p>
      </div>

      {/* Voice Recorder Section */}
      <div className="bg-card rounded-lg border p-6">
        <VoiceRecorder userId={data.user.id} />
      </div>

      {/* Processing Indicator */}
      <ProcessingIndicator />

      {/* Processed Items */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Items</h2>
        <ProcessedItemsList userId={data.user.id} />
      </div>
    </div>
  );
}