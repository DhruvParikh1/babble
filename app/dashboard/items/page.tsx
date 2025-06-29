// File: voice-text-note-processor/app/dashboard/items/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProcessedItemsList } from "@/components/processed-items-list";
import { ProcessingIndicator } from "@/components/processing-indicator";
import { MobileNavigation } from "@/components/mobile-navigation";
import { ArrowLeft, Mic } from "lucide-react";
import Link from "next/link";

export default async function ItemsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation */}
      <MobileNavigation userId={data.user.id} variant="light" />
      
      {/* Header */}
      <div className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-slate-700/50 z-30 shadow-sm">
        <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">My Items</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Organized voice notes & tasks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 pb-24">
        {/* Processing Indicator */}
        <div className="mb-6">
          <ProcessingIndicator />
        </div>

        {/* Enhanced Processed Items */}
        <ProcessedItemsList userId={data.user.id} />
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Link
          href="/dashboard"
          className="group w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-xl"
          title="Record voice note"
        >
          <Mic className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </Link>
      </div>
    </div>
  );
}