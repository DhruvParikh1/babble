"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-cyan-100 via-blue-100 to-blue-200">
      {/* Animated Background Bubbles */}
      <motion.div
        className="absolute top-20 left-16 w-32 h-32 bg-gradient-to-br from-red-200/50 to-orange-200/50 rounded-full blur-xl"
        animate={{
          x: [0, 25, 0],
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-32 right-20 w-28 h-28 bg-gradient-to-br from-yellow-200/45 to-red-200/45 rounded-full blur-lg"
        animate={{
          x: [0, -20, 0],
          y: [0, 18, 0],
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
          y: [0, -22, 0],
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
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        {/* Main Bubble with Title */}
        <motion.div
          className="relative mb-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        >
          <motion.div
            className="w-96 h-52 bg-gradient-to-br from-orange-200/70 to-red-300/70 rounded-full blur-sm absolute inset-0"
            animate={{
              scale: [1, 1.03, 0.99, 1.01, 1],
              rotate: [0, 1, -0.5, 0.8, 0],
            }}
            transition={{
              duration: 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="w-96 h-52 bg-gradient-to-br from-yellow-200/60 to-orange-200/60 rounded-full blur-md absolute inset-0"
            animate={{
              scale: [1, 0.97, 1.06, 0.98, 1],
              rotate: [0, -0.8, 2, -1.2, 0],
            }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />
          <div className="relative z-10 w-96 h-52 flex items-center justify-center">
            <motion.h1
              className="text-4xl md:text-5xl font-bold text-stone-600 text-center px-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              Authentication Error
            </motion.h1>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          className="max-w-md space-y-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <div className="bg-white/80 rounded-xl p-8 shadow-lg">
            <h2 className="text-xl font-semibold text-stone-600 mb-4">
              Something went wrong
            </h2>
            {error && (
              <div className="bg-red-50/80 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-red-800 mb-1">Error: {error}</p>
                {errorDescription && (
                  <p className="text-sm text-red-600">{errorDescription}</p>
                )}
              </div>
            )}
            <p className="text-stone-500 leading-relaxed">
              {!error && "We encountered an issue with authentication. Please try again."}
            </p>
          </div>

          <div className="space-y-4">
            <Link href="/auth/login">
              <Button className="w-full bg-white/90 hover:bg-white text-stone-600 text-lg py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                Back to Login
              </Button>
            </Link>
            
            <Link href="/">
              <Button 
                variant="outline"
                className="w-full bg-transparent border-stone-300 hover:bg-white/20 text-stone-600 text-lg py-6 rounded-xl transition-all duration-300"
              >
                Go Home
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}