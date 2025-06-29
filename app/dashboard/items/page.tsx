// File: voice-text-note-processor/app/dashboard/items/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProcessedItemsList } from "@/components/processed-items-list";
import { ProcessingIndicator } from "@/components/processing-indicator";
import { MobileNavigation } from "@/components/mobile-navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function ItemsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Navigation */}
      <MobileNavigation userId={data.user.id} />
      
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-gray-200/50 z-30">
        <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-800">My Items</h1>
              <p className="text-sm text-gray-600">Your organized voice notes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 pb-20">
        {/* Processing Indicator */}
        <div className="mb-6">
          <ProcessingIndicator />
        </div>

        {/* Processed Items */}
        <div className="space-y-6">
          <ProcessedItemsList userId={data.user.id} />
        </div>

        {/* Quick Action Button */}
        <div className="fixed bottom-6 right-6 z-40">
          <Link
            href="/dashboard"
            className="w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}