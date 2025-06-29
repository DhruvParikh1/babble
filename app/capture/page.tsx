// File: voice-text-note-processor/app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BubbleVoiceRecorder from "@/components/BubbleVoiceRecorder";
import { MobileNavigation } from "@/components/mobile-navigation";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Navigation */}
      <MobileNavigation userId={data.user.id} />
      
      {/* Main Content - Bubble Recorder */}
      <BubbleVoiceRecorder userId={data.user.id} />
    </div>
  );
}