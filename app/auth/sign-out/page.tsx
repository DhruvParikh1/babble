"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, LogOut, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-cyan-100 via-blue-100 to-blue-200">
      {/* Animated Background Bubbles */}
      <motion.div
        className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-red-200/50 to-orange-200/50 rounded-full blur-xl"
        animate={{
          x: [0, 25, 0],
          y: [0, -15, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-28 right-16 w-28 h-28 bg-gradient-to-br from-pink-200/45 to-red-200/45 rounded-full blur-lg"
        animate={{
          x: [0, -20, 0],
          y: [0, 20, 0],
          scale: [1, 0.95, 1],
        }}
        transition={{
          duration: 7,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <motion.div
        className="absolute top-1/2 right-12 w-24 h-24 bg-gradient-to-br from-orange-200/40 to-red-200/40 rounded-full blur-md"
        animate={{
          x: [0, -15, 0],
          y: [0, -18, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 6,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        {/* Main Bubble with Title */}
        <motion.div
          className="relative mb-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        >
          <motion.div
            className="w-80 h-48 bg-gradient-to-br from-red-200/70 to-orange-300/70 rounded-full blur-sm absolute inset-0"
            animate={{
              scale: [1, 1.04, 0.98, 1.02, 1],
              rotate: [0, 1.5, -1, 1, 0],
            }}
            transition={{
              duration: 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="w-80 h-48 bg-gradient-to-br from-pink-200/60 to-red-200/60 rounded-full blur-md absolute inset-0"
            animate={{
              scale: [1, 0.96, 1.07, 0.99, 1],
              rotate: [0, -1, 2.5, -1.5, 0],
            }}
            transition={{
              duration: 8.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />
          <div className="relative z-10 w-80 h-48 flex items-center justify-center">
            <motion.h1
              className="text-4xl md:text-5xl font-bold text-stone-600 text-center px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              Sign Out
            </motion.h1>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          className="w-full max-w-md space-y-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <div className="bg-white/80 rounded-xl p-8 shadow-lg text-center">
            <h2 className="text-xl font-semibold text-stone-600 mb-4">
              Are you sure you want to sign out?
            </h2>
            <p className="text-stone-500 text-sm mb-6">
              You&apos;ll be redirected to the home page after signing out
            </p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50/80 border border-red-200 rounded-xl p-4 mb-6"
              >
                <p className="text-sm text-red-600">{error}</p>
              </motion.div>
            )}

            <div className="space-y-3">
              <Button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full bg-red-600 hover:bg-red-700 text-white text-lg py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
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
                className="w-full bg-white/90 hover:bg-white text-stone-600 text-lg py-6 rounded-xl border-stone-300 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>

          {/* Back to Main Link */}
          <div className="text-center">
            <Link
              href="/capture"
              className="text-stone-500 hover:text-stone-600 text-sm underline transition-colors"
            >
              ← Back to Capture
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}