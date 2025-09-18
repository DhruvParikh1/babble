// File: app/capture/profile/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MobileNavigation } from "@/components/mobile-navigation";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar,
  FileText,
  Zap,
  ExternalLink,
  Plus
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ProfilePage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  const integrations = [
    // Calendar & Scheduling
    {
      name: "Google Calendar",
      description: "Auto-create calendar events from voice notes like 'Meeting with Sarah tomorrow at 3pm'",
      icon: "📅",
      category: "Calendar & Scheduling",
      status: "coming-soon",
      popular: true
    },
    {
      name: "Apple Calendar",
      description: "Seamlessly sync reminders and appointments to your iPhone's native calendar",
      icon: "🗓️",
      category: "Calendar & Scheduling", 
      status: "coming-soon"
    },
    {
      name: "Calendly",
      description: "Automatically schedule meetings when you say 'Book a call with...'",
      icon: "📆",
      category: "Calendar & Scheduling",
      status: "planned"
    },

    // Communication
    {
      name: "Google Contacts",
      description: "Automatically identify contacts when you say 'Call mom' or 'Text John about dinner'",
      icon: "👥",
      category: "Communication",
      status: "coming-soon",
      popular: true
    },
    {
      name: "Slack",
      description: "Send work-related voice notes as Slack messages or channel reminders",
      icon: "💬",
      category: "Communication",
      status: "coming-soon"
    },
    {
      name: "WhatsApp",
      description: "Create message drafts or reminders to contact people on WhatsApp",
      icon: "📱",
      category: "Communication",
      status: "planned"
    },

    // Productivity & Notes
    {
      name: "Notion",
      description: "Convert voice notes into structured Notion pages with automatic formatting",
      icon: "📋",
      category: "Productivity & Notes",
      status: "coming-soon"
    },
    {
      name: "Obsidian",
      description: "Create interconnected notes and knowledge graphs from voice recordings",
      icon: "🧠",
      category: "Productivity & Notes", 
      status: "planned"
    },
    {
      name: "Apple Notes",
      description: "Seamlessly sync with your iPhone's native Notes app",
      icon: "📄",
      category: "Productivity & Notes",
      status: "coming-soon"
    },

    // Health & Lifestyle
    {
      name: "Apple Health",
      description: "Track health goals and medication reminders from voice notes",
      icon: "❤️",
      category: "Health & Lifestyle",
      status: "coming-soon"
    },
    {
      name: "MyFitnessPal",
      description: "Log meals and workouts mentioned in your voice notes",
      icon: "🏃",
      category: "Health & Lifestyle",
      status: "planned"
    },

    // Shopping & Finance
    {
      name: "Apple Wallet",
      description: "Set spending reminders and budget alerts from financial voice notes",
      icon: "💳",
      category: "Shopping & Finance",
      status: "planned"
    },
    {
      name: "Amazon",
      description: "Add items to your Amazon cart from shopping voice notes",
      icon: "📦",
      category: "Shopping & Finance",
      status: "planned"
    },

    // Entertainment
    {
      name: "Spotify",
      description: "Create playlists or save songs mentioned in your voice notes",
      icon: "🎵",
      category: "Entertainment",
      status: "planned"
    },
    {
      name: "Apple Music",
      description: "Add music to your library from voice notes about songs you discover",
      icon: "🎼",
      category: "Entertainment",
      status: "planned"
    },

    // Automation
    {
      name: "Zapier",
      description: "Connect to 5,000+ apps with custom automation workflows",
      icon: "⚡",
      category: "Automation",
      status: "coming-soon"
    },
    {
      name: "IFTTT",
      description: "Create powerful automation chains triggered by your voice notes",
      icon: "🔗",
      category: "Automation",
      status: "planned"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "coming-soon":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Coming Soon</Badge>;
      case "planned":
        return <Badge variant="outline" className="text-gray-600">Planned</Badge>;
      case "available":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Available</Badge>;
      default:
        return null;
    }
  };

  const groupedIntegrations = integrations.reduce((acc, integration) => {
    if (!acc[integration.category]) {
      acc[integration.category] = [];
    }
    acc[integration.category].push(integration);
    return acc;
  }, {} as Record<string, typeof integrations>);

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
              <h1 className="text-xl font-bold text-gray-800">Profile</h1>
              <p className="text-sm text-gray-600">Manage your account & integrations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 pb-20 space-y-6">
        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-gray-600">{data.user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Member since</p>
                <p className="text-sm text-gray-600">
                  {new Date(data.user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Integrations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Integrations
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Connect your voice notes to your favorite apps and services for seamless workflow automation.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(groupedIntegrations).map(([category, items]) => (
              <div key={category} className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1">
                  {category}
                </h3>
                <div className="grid gap-3">
                  {items.map((integration) => (
                    <div
                      key={integration.name}
                      className="flex items-start gap-3 p-3 bg-gray-50/50 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-2xl flex-shrink-0 mt-0.5">
                        {integration.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {integration.name}
                          </h4>
                          {integration.popular && (
                            <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                              Popular
                            </Badge>
                          )}
                          {getStatusBadge(integration.status)}
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {integration.description}
                        </p>
                      </div>
                      {integration.status === "available" ? (
                        <Button size="sm" variant="outline" className="flex-shrink-0">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Connect
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" disabled className="flex-shrink-0 text-gray-400">
                          Soon
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Call to Action */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="text-center space-y-2">
                <h3 className="font-medium text-blue-900">🚀 Early Access Program</h3>
                <p className="text-sm text-blue-700">
                  Get notified when new integrations become available and help shape our roadmap.
                </p>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Join Waitlist
                </Button>
              </div>
            </div>

            {/* Integration Request */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Don&apos;t see your favorite app?
                </p>
                <Button variant="outline" size="sm">
                  <Plus className="w-3 h-3 mr-1" />
                  Request Integration
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Mail className="w-4 h-4 mr-2" />
              Update Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button variant="destructive" className="w-full justify-start">
              <User className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}