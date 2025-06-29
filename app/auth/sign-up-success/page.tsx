"use client";

import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-cyan-100 via-blue-100 to-blue-200">
      {/* Animated Background Bubbles */}
      <motion.div
        className="absolute top-20 left-16 w-32 h-32 bg-gradient-to-br from-green-200/50 to-emerald-200/50 rounded-full blur-xl"
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
        className="absolute bottom-32 right-20 w-28 h-28 bg-gradient-to-br from-blue-200/45 to-cyan-200/45 rounded-full blur-lg"
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
        className="absolute top-1/3 right-12 w-24 h-24 bg-gradient-to-br from-purple-200/40 to-pink-200/40 rounded-full blur-md"
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
            className="w-96 h-52 bg-gradient-to-br from-green-200/70 to-emerald-300/70 rounded-full blur-sm absolute inset-0"
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
            className="w-96 h-52 bg-gradient-to-br from-cyan-200/60 to-blue-200/60 rounded-full blur-md absolute inset-0"
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
              Thank you for signing up!
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
            <Mail className="w-12 h-12 text-stone-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-stone-600 mb-4">
              Check your email to confirm
            </h2>
            <p className="text-stone-500 leading-relaxed">
              You&apos;ve successfully signed up. Please check your email to confirm your account before signing in.
            </p>
          </div>

          <div className="space-y-4">
            <Link href="/auth/login">
              <Button className="w-full bg-white/90 hover:bg-white text-stone-600 text-lg py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                Back to Login
              </Button>
            </Link>
            
            <p className="text-sm text-stone-500">
              {"Didn't receive an email? Check your spam folder or "}
              <Link href="/auth/sign-up" className="text-stone-600 hover:underline font-medium">
                try signing up again
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}