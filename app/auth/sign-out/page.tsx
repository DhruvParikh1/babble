// File: voice-text-note-processor/app/auth/sign-out/page.tsx
"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, LogOut, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SignOutPage() {
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    setIsSigningOut(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }

      // Redirect to home page after successful sign out
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
      setError(error instanceof Error ? error.message : "An error occurred while signing out")
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-300 to-blue-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="backdrop-blur-sm bg-white/90 border border-white/20 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <LogOut className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-800">
              Sign Out
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Are you sure you want to sign out of your account?
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex flex-col space-y-3">
              <Button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                {isSigningOut ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing out...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 mr-2" />
                    Yes, sign me out
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => router.back()}
                disabled={isSigningOut}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                You&apos;ll be redirected to the home page after signing out
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to Dashboard Link */}
        <div className="text-center mt-6">
          <Link
            href="/dashboard"
            className="text-white/80 hover:text-white text-sm underline transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}