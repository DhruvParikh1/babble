// File: voice-text-note-processor/app/page.tsx
"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-cyan-100 via-blue-100 to-blue-200">
      {/* Animated Background Bubbles */}
      <motion.div
        className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-pink-200/50 to-purple-200/50 rounded-full blur-xl"
        animate={{
          x: [0, 30, 0],
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
        className="absolute top-32 right-20 w-24 h-24 bg-gradient-to-br from-blue-200/40 to-cyan-200/40 rounded-full blur-lg"
        animate={{
          x: [0, -25, 0],
          y: [0, 15, 0],
          scale: [1, 0.9, 1],
        }}
        transition={{
          duration: 6,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <motion.div
        className="absolute bottom-32 left-1/4 w-20 h-20 bg-gradient-to-br from-purple-200/45 to-pink-200/45 rounded-full blur-lg"
        animate={{
          x: [0, 20, 0],
          y: [0, -10, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 7,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      <motion.div
        className="absolute bottom-20 right-10 w-16 h-16 bg-gradient-to-br from-cyan-200/50 to-blue-200/50 rounded-full blur-md"
        animate={{
          x: [0, -15, 0],
          y: [0, 25, 0],
          scale: [1, 0.8, 1],
        }}
        transition={{
          duration: 5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        {/* Title */}
        <motion.h1
          className="text-6xl md:text-8xl font-bold text-stone-600 mb-16"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          Babble
        </motion.h1>

        {/* Main Bubble with Text */}
        <motion.div
          className="relative mb-20"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        >
          <motion.div
            className="w-80 h-80 md:w-96 md:h-96 bg-gradient-to-br from-pink-200/70 to-purple-300/70 rounded-full blur-sm absolute inset-0"
            animate={{
              scale: [1, 1.05, 0.98, 1.02, 1],
              rotate: [0, 2, -1, 1, 0],
            }}
            transition={{
              duration: 12,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="w-80 h-80 md:w-96 md:h-96 bg-gradient-to-br from-cyan-200/60 to-blue-200/60 rounded-full blur-md absolute inset-0"
            animate={{
              scale: [1, 0.95, 1.08, 0.97, 1],
              rotate: [0, -1, 3, -2, 0],
            }}
            transition={{
              duration: 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: 1,
            }}
          />
          <div className="relative z-10 w-80 h-80 md:w-96 md:h-96 flex items-center justify-center">
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-stone-600 leading-tight px-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
            >
              Capture your thoughts before they pop
            </motion.h2>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          <Link href="/auth/sign-up">
            <Button
              size="lg"
              className="bg-white/90 hover:bg-white text-stone-600 text-xl px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              {"Let's Get Started!"}
              <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-white/50 hover:bg-white/20 text-stone-600 text-xl px-8 py-6 rounded-full transition-all duration-300"
            >
              Login
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}