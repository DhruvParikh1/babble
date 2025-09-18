// File: components/sign-up-form.tsx
"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/capture`,
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
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
        className="absolute top-16 right-16 w-28 h-28 bg-gradient-to-br from-purple-200/50 to-pink-200/50 rounded-full blur-xl"
        animate={{
          x: [0, -20, 0],
          y: [0, 15, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 9,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-24 left-12 w-36 h-36 bg-gradient-to-br from-cyan-200/45 to-blue-200/45 rounded-full blur-lg"
        animate={{
          x: [0, 25, 0],
          y: [0, -20, 0],
          scale: [1, 0.9, 1],
        }}
        transition={{
          duration: 7,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 1.5,
        }}
      />

      <motion.div
        className="absolute top-1/3 left-8 w-20 h-20 bg-gradient-to-br from-pink-200/40 to-cyan-200/40 rounded-full blur-md"
        animate={{
          x: [0, 15, 0],
          y: [0, -25, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 6,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 0.8,
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
            className="w-72 h-48 bg-gradient-to-br from-purple-200/70 to-pink-300/70 rounded-full blur-sm absolute inset-0"
            animate={{
              scale: [1, 1.03, 0.99, 1.01, 1],
              rotate: [0, 1, -0.5, 0.8, 0],
            }}
            transition={{
              duration: 11,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="w-72 h-48 bg-gradient-to-br from-cyan-200/60 to-purple-200/60 rounded-full blur-md absolute inset-0"
            animate={{
              scale: [1, 0.97, 1.06, 0.98, 1],
              rotate: [0, -0.8, 2, -1.2, 0],
            }}
            transition={{
              duration: 9,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: 0.7,
            }}
          />
          <div className="relative z-10 w-72 h-48 flex items-center justify-center">
            <motion.h1
              className="text-4xl md:text-5xl font-bold text-stone-600 text-center px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              Create Account
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
          <div className="text-center mb-8">
            <p className="text-stone-500">
              Already Registered?{" "}
              <Link href="/auth/login" className="text-stone-600 hover:underline font-medium">
                Log in here.
              </Link>
            </p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-stone-500 text-sm font-medium">
                EMAIL
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="hello@babbles.vercel.app"
                className="bg-white/80 border-0 rounded-xl py-6 text-stone-600 placeholder:text-stone-400"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-stone-500 text-sm font-medium">
                PASSWORD
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                className="bg-white/80 border-0 rounded-xl py-6 text-stone-600 placeholder:text-stone-400"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="repeat-password" className="text-stone-500 text-sm font-medium">
                CONFIRM PASSWORD
              </Label>
              <Input
                id="repeat-password"
                type="password"
                placeholder="••••••"
                className="bg-white/80 border-0 rounded-xl py-6 text-stone-600 placeholder:text-stone-400"
                required
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
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
              {isLoading ? "Creating account..." : "Sign up"}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}