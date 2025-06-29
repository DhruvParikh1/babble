// File: voice-text-note-processor/app/capture/settings/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MobileNavigation } from "@/components/mobile-navigation";
import { ArrowLeft, Settings, Mic, Bell, Palette, Shield } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  const settingsSections = [
    {
      title: "Voice Recording",
      icon: Mic,
      items: [
        { label: "Language", value: "English (US)", action: "Change" },
        { label: "Auto-stop recording", value: "5 seconds", action: "Adjust" },
        { label: "Noise reduction", value: "Enabled", action: "Toggle" },
      ]
    },
    {
      title: "Notifications",
      icon: Bell,
      items: [
        { label: "Push notifications", value: "Enabled", action: "Toggle" },
        { label: "Email reminders", value: "Daily", action: "Change" },
        { label: "Processing complete", value: "Enabled", action: "Toggle" },
      ]
    },
    {
      title: "Appearance",
      icon: Palette,
      items: [
        { label: "Theme", value: "System", action: "Change" },
        { label: "Bubble animation", value: "Enabled", action: "Toggle" },
        { label: "Sound effects", value: "Enabled", action: "Toggle" },
      ]
    },
    {
      title: "Privacy & Security",
      icon: Shield,
      items: [
        { label: "Data encryption", value: "Enabled", action: "Info" },
        { label: "Auto-delete old items", value: "90 days", action: "Change" },
        { label: "Share usage data", value: "Disabled", action: "Toggle" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Navigation */}
      <MobileNavigation userId={data.user.id} />
      
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-gray-200/50 z-30">
        <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <Link
              href="/capture"
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Settings</h1>
              <p className="text-sm text-gray-600">Customize your experience</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 pb-20 space-y-6">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          
          return (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="w-5 h-5" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {section.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-gray-800">{item.label}</p>
                      <p className="text-sm text-gray-600">{item.value}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      {item.action}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}

        {/* App Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              About
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-800">App Version</p>
                <p className="text-sm text-gray-600">1.0.0 (Beta)</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-800">Privacy Policy</p>
                <p className="text-sm text-gray-600">Last updated: Jan 2025</p>
              </div>
              <Button variant="outline" size="sm">
                View
              </Button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-800">Terms of Service</p>
                <p className="text-sm text-gray-600">Last updated: Jan 2025</p>
              </div>
              <Button variant="outline" size="sm">
                View
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Development Note */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-400">
            🚧 Settings functionality coming soon
          </p>
        </div>
      </div>
    </div>
  );
}