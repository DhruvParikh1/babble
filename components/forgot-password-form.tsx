"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // The url which will be included in the email. This URL needs to be configured in your redirect URLs in the Supabase dashboard at https://supabase.com/dashboard/project/_/auth/url-configuration
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("min-h-screen relative overflow-hidden bg-gradient-to-br from-cyan-100 via-blue-100 to-blue-200", className)} {...props}>
      {/* Animated Background Bubbles */}
      <motion.div
        className="absolute top-24 left-16 w-28 h-28 bg-gradient-to-br from-blue-200/50 to-cyan-200/50 rounded-full blur-xl"
        animate={{
          x: [0, 20, 0],
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
        className="absolute bottom-28 right-20 w-32 h-32 bg-gradient-to-br from-purple-200/45 to-pink-200/45 rounded-full blur-lg"
        animate={{
          x: [0, -18, 0],
          y: [0, 22, 0],
          scale: [1, 0.95, 1],
        }}
        transition={{
          duration: 6.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <motion.div
        className="absolute top-1/2 right-12 w-20 h-20 bg-gradient-to-br from-cyan-200/40 to-blue-200/40 rounded-full blur-md"
        animate={{
          x: [0, -12, 0],
          y: [0, -18, 0],
          scale: [1, 1.25, 1],
        }}
        transition={{
          duration: 7.5,
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
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.div
            className="w-80 h-48 bg-gradient-to-br from-blue-200/70 to-cyan-300/70 rounded-full blur-sm absolute inset-0"
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
            className="w-80 h-48 bg-gradient-to-br from-purple-200/60 to-pink-200/60 rounded-full blur-md absolute inset-0"
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
              transition={{ duration: 1, delay: 0.5 }}
            >
              Reset Password
            </motion.h1>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          className="w-full max-w-md space-y-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          {success ? (
            <div className="text-center space-y-6">
              <div className="bg-green-50/80 border border-green-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-green-800 mb-2">Check Your Email</h2>
                <p className="text-sm text-green-600">
                  If you registered using your email and password, you will receive a password reset email.
                </p>
              </div>
              <Link href="/auth/login">
                <Button className="w-full bg-white/90 hover:bg-white text-stone-600 text-lg py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <p className="text-stone-500">
                  Type in your email and we&apos;ll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-stone-500 text-sm font-medium">
                    EMAIL
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    className="bg-white/80 border-0 rounded-xl py-6 text-stone-600 placeholder:text-stone-400"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50/80 border border-red-200 rounded-xl p-4"
                  >
                    <p className="text-sm text-red-600">{error}</p>
                  </motion.div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-white/90 hover:bg-white text-stone-600 text-lg py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 mt-8"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send reset email"}
                </Button>
              </form>

              <div className="text-center mt-6">
                <p className="text-stone-500">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-stone-600 hover:underline font-medium">
                    Login
                  </Link>
                </p>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}