"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

type BubbleState = "idle" | "recording" | "processing" | "popped"

interface BubbleVoiceRecorderProps {
  onRecordingStart?: () => void
  onRecordingComplete?: () => void
  onProcessingStart?: () => void
  onProcessingComplete?: () => void
  className?: string
}

export default function BubbleVoiceRecorder({
  onRecordingStart,
  onRecordingComplete,
  onProcessingStart,
  onProcessingComplete,
  className = ""
}: BubbleVoiceRecorderProps) {
  const [bubbleState, setBubbleState] = useState<BubbleState>("idle")

  const handleBubbleTap = () => {
    if (bubbleState === "idle") {
      setBubbleState("recording")
      onRecordingStart?.()

      // Simulate recording for 2 seconds
      setTimeout(() => {
        setBubbleState("processing")
        onRecordingComplete?.()
        onProcessingStart?.()

        // Simulate processing for 1.5 seconds, then pop
        setTimeout(() => {
          setBubbleState("popped")
          onProcessingComplete?.()

          // Reset after pop animation
          setTimeout(() => {
            setBubbleState("idle")
          }, 2500)
        }, 1500)
      }, 2000)
    }
  }

  const getBubbleScale = () => {
    switch (bubbleState) {
      case "recording":
        return 1.3
      case "processing":
        return 1.1
      default:
        return 1
    }
  }

  // Enhanced particles for realistic pop
  const bubbleFragments = Array.from({ length: 8 }, (_, i) => ({
    id: `fragment-${i}`,
    size: Math.random() * 12 + 8,
    x: (Math.random() - 0.5) * 400,
    y: (Math.random() - 0.5) * 200,
    delay: Math.random() * 0.1,
    duration: Math.random() * 0.8 + 1.8,
    rotation: Math.random() * 720,
  }))

  const sparkles = Array.from({ length: 20 }, (_, i) => ({
    id: `sparkle-${i}`,
    size: Math.random() * 4 + 2,
    x: (Math.random() - 0.5) * 500,
    y: (Math.random() - 0.5) * 300,
    delay: Math.random() * 0.2,
    duration: Math.random() * 1.2 + 1.5,
  }))

  const mist = Array.from({ length: 6 }, (_, i) => ({
    id: `mist-${i}`,
    size: Math.random() * 40 + 30,
    x: (Math.random() - 0.5) * 300,
    y: (Math.random() - 0.5) * 200,
    delay: Math.random() * 0.15,
    duration: Math.random() * 1 + 2,
  }))

  return (
    <div
      className={`flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-400 via-blue-300 to-blue-200 overflow-hidden ${className}`}
      style={{ perspective: "1200px" }}
    >
      <AnimatePresence>
        {bubbleState !== "popped" && (
          <motion.button
            onClick={handleBubbleTap}
            disabled={bubbleState !== "idle"}
            className="relative focus:outline-none"
            style={{ transformStyle: "preserve-3d" }}
            initial={{ scale: 0, opacity: 0, rotateX: 0, rotateY: 0 }}
            animate={{
              scale: getBubbleScale(),
              opacity: 1,
              y: [0, -12, 0],
              rotateX: [0, 8, -8, 0],
              rotateY: [0, -5, 5, 0],
            }}
            exit={{
              scale: [1, 1.4, 0],
              opacity: [1, 0.6, 0],
              rotateX: [0, 45],
              rotateY: [0, 90],
              transition: {
                type: "tween",
                duration: 0.3,
                ease: "easeOut",
              },
            }}
            transition={{
              scale: {
                type: "spring",
                stiffness: 200,
                damping: 15,
              },
              y: {
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              },
              rotateX: {
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              },
              rotateY: {
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
          >
            {/* Pink-focused pastel aura */}
            <motion.div
              className="absolute inset-0 rounded-full blur-3xl opacity-20"
              style={{
                background: `
                  radial-gradient(circle, 
                    rgba(255, 182, 193, 0.4) 0%, 
                    rgba(255, 192, 203, 0.3) 25%, 
                    rgba(255, 218, 185, 0.2) 50%, 
                    rgba(255, 240, 245, 0.3) 75%, 
                    transparent 100%
                  )
                `,
                transform: "translateZ(-30px) scale(1.5)",
              }}
              animate={{
                scale: bubbleState === "recording" ? [1.5, 1.8, 1.5] : [1.5, 1.7, 1.5],
                opacity: bubbleState === "recording" ? [0.2, 0.4, 0.2] : [0.2, 0.3, 0.2],
                rotate: [0, 360],
              }}
              transition={{
                scale: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                opacity: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                rotate: {
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                },
              }}
            />

            {/* 3D Bubble Container */}
            <motion.div className="w-44 h-44 relative" style={{ transformStyle: "preserve-3d" }}>
              {/* Very transparent main bubble */}
              <motion.div
                className="w-full h-full relative overflow-hidden"
                style={{
                  background: `
                    radial-gradient(ellipse at 15% 15%, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 15%, rgba(255, 255, 255, 0.1) 30%, transparent 50%),
                    radial-gradient(ellipse at 85% 85%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.05) 25%, transparent 40%),
                    radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.02) 0%, transparent 100%)
                  `,
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  backdropFilter: "blur(1px)",
                  transform: "translateZ(0px)",
                }}
                animate={{
                  borderRadius: [
                    "60% 40% 30% 70% / 60% 30% 70% 40%",
                    "30% 60% 70% 40% / 50% 60% 30% 60%",
                    "50% 40% 60% 30% / 40% 50% 60% 50%",
                    "40% 60% 50% 60% / 70% 40% 50% 30%",
                    "60% 40% 30% 70% / 60% 30% 70% 40%",
                  ],
                  scaleX: [1, 1.08, 0.96, 1.04, 1],
                  scaleY: [1, 0.92, 1.12, 0.94, 1],
                }}
                transition={{
                  borderRadius: {
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                  scaleX: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                  scaleY: {
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
              >
                {/* Pink-dominant iridescent edge colors */}
                <motion.div
                  className="absolute inset-0 opacity-60"
                  style={{
                    background: `
                      conic-gradient(from 0deg,
                        rgba(255, 182, 193, 0.5) 0deg,
                        rgba(255, 192, 203, 0.4) 45deg,
                        rgba(255, 228, 225, 0.4) 90deg,
                        rgba(255, 228, 225, 0.4) 135deg,
                        rgba(255, 240, 245, 0.4) 180deg,
                        rgba(221, 160, 221, 0.4) 225deg,
                        rgba(255, 182, 193, 0.4) 270deg,
                        rgba(255, 192, 203, 0.5) 315deg,
                        rgba(255, 182, 193, 0.5) 360deg
                      )
                    `,
                    maskImage: `
                      radial-gradient(circle, 
                        transparent 0%, 
                        transparent 75%, 
                        black 85%, 
                        black 95%, 
                        transparent 100%
                      )
                    `,
                    transform: "translateZ(1px)",
                  }}
                  animate={{
                    rotate: [0, 360],
                    borderRadius: [
                      "60% 40% 30% 70% / 60% 30% 70% 40%",
                      "30% 60% 70% 40% / 50% 60% 30% 60%",
                      "50% 40% 60% 30% / 40% 50% 60% 50%",
                      "40% 60% 50% 60% / 70% 40% 50% 30%",
                      "60% 40% 30% 70% / 60% 30% 70% 40%",
                    ],
                  }}
                  transition={{
                    rotate: {
                      duration: 15,
                      repeat: Infinity,
                      ease: "linear",
                    },
                    borderRadius: {
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                />

                {/* Secondary pink-toned edge shimmer */}
                <motion.div
                  className="absolute inset-0 opacity-40"
                  style={{
                    background: `
                      conic-gradient(from 180deg,
                        rgba(255, 240, 245, 0.35) 0deg,
                        rgba(255, 228, 225, 0.3) 60deg,
                        rgba(255, 228, 225, 0.3) 120deg,
                        rgba(255, 182, 193, 0.35) 180deg,
                        rgba(255, 192, 203, 0.3) 240deg,
                        rgba(255, 240, 245, 0.35) 300deg,
                        rgba(255, 240, 245, 0.35) 360deg
                      )
                    `,
                    maskImage: `
                      radial-gradient(circle, 
                        transparent 0%, 
                        transparent 80%, 
                        black 90%, 
                        black 98%, 
                        transparent 100%
                      )
                    `,
                    transform: "translateZ(2px)",
                  }}
                  animate={{
                    rotate: [180, -180],
                    borderRadius: [
                      "60% 40% 30% 70% / 60% 30% 70% 40%",
                      "30% 60% 70% 40% / 50% 60% 30% 60%",
                      "50% 40% 60% 30% / 40% 50% 60% 50%",
                      "40% 60% 50% 60% / 70% 40% 50% 30%",
                      "60% 40% 30% 70% / 60% 30% 70% 40%",
                    ],
                  }}
                  transition={{
                    rotate: {
                      duration: 12,
                      repeat: Infinity,
                      ease: "linear",
                    },
                    borderRadius: {
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                />

                {/* Subtle pink inner glow */}
                <motion.div
                  className="absolute inset-0 opacity-25"
                  style={{
                    background: `
                      radial-gradient(circle at 30% 40%, 
                        rgba(255, 182, 193, 0.2) 0%, 
                        rgba(255, 192, 203, 0.15) 25%, 
                        rgba(255, 228, 225, 0.1) 40%,
                        rgba(255, 240, 245, 0.08) 55%, 
                        transparent 70%
                      )
                    `,
                    transform: "translateZ(3px)",
                  }}
                  animate={{
                    backgroundPosition: ["20% 30%", "80% 70%", "40% 50%", "60% 20%", "20% 30%"],
                    borderRadius: [
                      "60% 40% 30% 70% / 60% 30% 70% 40%",
                      "30% 60% 70% 40% / 50% 60% 30% 60%",
                      "50% 40% 60% 30% / 40% 50% 60% 50%",
                      "40% 60% 50% 60% / 70% 40% 50% 30%",
                      "60% 40% 30% 70% / 60% 30% 70% 40%",
                    ],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Additional pink accent layer */}
                <motion.div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: `
                      radial-gradient(ellipse at 70% 30%, 
                        rgba(255, 192, 203, 0.2) 0%, 
                        rgba(255, 182, 193, 0.15) 30%, 
                        rgba(255, 228, 225, 0.1) 50%, 
                        transparent 70%
                      )
                    `,
                    transform: "translateZ(3.5px)",
                  }}
                  animate={{
                    backgroundPosition: ["60% 20%", "20% 80%", "80% 30%", "40% 70%", "60% 20%"],
                    borderRadius: [
                      "60% 40% 30% 70% / 60% 30% 70% 40%",
                      "30% 60% 70% 40% / 50% 60% 30% 60%",
                      "50% 40% 60% 30% / 40% 50% 60% 50%",
                      "40% 60% 50% 60% / 70% 40% 50% 30%",
                      "60% 40% 30% 70% / 60% 30% 70% 40%",
                    ],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                />

                {/* Primary bright highlight */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(ellipse at 20% 20%, 
                      rgba(255, 255, 255, 1) 0%,
                      rgba(255, 255, 255, 0.8) 8%,
                      rgba(255, 255, 255, 0.4) 20%,
                      rgba(255, 255, 255, 0.1) 35%,
                      transparent 60%
                    )`,
                    transform: "translateZ(5px)",
                  }}
                  animate={{
                    backgroundPosition: ["15% 15%", "85% 80%", "30% 35%", "70% 90%", "15% 15%"],
                    borderRadius: [
                      "60% 40% 30% 70% / 60% 30% 70% 40%",
                      "30% 60% 70% 40% / 50% 60% 30% 60%",
                      "50% 40% 60% 30% / 40% 50% 60% 50%",
                      "40% 60% 50% 60% / 70% 40% 50% 30%",
                      "60% 40% 30% 70% / 60% 30% 70% 40%",
                    ],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Secondary highlights with pink tint */}
                <motion.div
                  className="absolute top-3 right-4 w-8 h-8 rounded-full blur-sm"
                  style={{
                    background: "radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(255, 192, 203, 0.3) 100%)",
                    transform: "translateZ(8px)",
                    boxShadow: "0 0 15px rgba(255, 192, 203, 0.4)",
                  }}
                  animate={{
                    opacity: [0.9, 1, 0.9],
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                <motion.div
                  className="absolute bottom-4 left-6 w-4 h-4 rounded-full blur-sm"
                  style={{
                    background: "radial-gradient(circle, rgba(255, 255, 255, 0.7) 0%, rgba(255, 182, 193, 0.4) 100%)",
                    transform: "translateZ(4px)",
                  }}
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                />
              </motion.div>
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Enhanced realistic pop effect with pink tones */}
      <AnimatePresence>
        {bubbleState === "popped" && (
          <>
            {/* Shockwave effect */}
            <motion.div
              className="absolute rounded-full border-2 border-pink-200/40"
              style={{
                left: "50%",
                top: "50%",
                width: 0,
                height: 0,
              }}
              initial={{
                scale: 0,
                opacity: 0.8,
              }}
              animate={{
                scale: [0, 15],
                opacity: [0.8, 0],
              }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
              }}
            />

            {/* Bubble fragments with pink tones */}
            {bubbleFragments.map((fragment) => (
              <motion.div
                key={fragment.id}
                className="absolute rounded-full backdrop-blur-sm"
                style={{
                  width: fragment.size,
                  height: fragment.size,
                  background: `
                    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%),
                    conic-gradient(from 0deg, rgba(255, 182, 193, 0.4), rgba(255, 192, 203, 0.4), rgba(255, 218, 185, 0.3), rgba(255, 240, 245, 0.4))
                  `,
                  border: "1px solid rgba(255, 192, 203, 0.4)",
                  left: "50%",
                  top: "50%",
                  boxShadow: "0 0 10px rgba(255, 182, 193, 0.3)",
                }}
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 1,
                  scale: 1,
                  rotate: 0,
                }}
                animate={{
                  x: fragment.x,
                  y: [0, fragment.y, fragment.y + 200],
                  opacity: [1, 0.8, 0],
                  scale: [1, 0.8, 0.2],
                  rotate: fragment.rotation,
                }}
                transition={{
                  duration: fragment.duration,
                  delay: fragment.delay,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              />
            ))}

            {/* Sparkle particles */}
            {sparkles.map((sparkle) => (
              <motion.div
                key={sparkle.id}
                className="absolute rounded-full bg-pink-100"
                style={{
                  width: sparkle.size,
                  height: sparkle.size,
                  left: "50%",
                  top: "50%",
                  boxShadow: `0 0 ${sparkle.size * 2}px rgba(255, 182, 193, 0.8)`,
                }}
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 1,
                  scale: 1,
                }}
                animate={{
                  x: sparkle.x,
                  y: [0, sparkle.y, sparkle.y + 300],
                  opacity: [1, 0.6, 0],
                  scale: [1, 0.3, 0],
                }}
                transition={{
                  duration: sparkle.duration,
                  delay: sparkle.delay,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              />
            ))}

            {/* Mist effect */}
            {mist.map((mistParticle) => (
              <motion.div
                key={mistParticle.id}
                className="absolute rounded-full bg-pink-50/20 blur-md"
                style={{
                  width: mistParticle.size,
                  height: mistParticle.size,
                  left: "50%",
                  top: "50%",
                }}
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 0.6,
                  scale: 0.5,
                }}
                animate={{
                  x: mistParticle.x,
                  y: [0, mistParticle.y - 100],
                  opacity: [0.6, 0.3, 0],
                  scale: [0.5, 1.5, 2],
                }}
                transition={{
                  duration: mistParticle.duration,
                  delay: mistParticle.delay,
                  ease: "easeOut",
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Status text with high contrast */}
      <motion.div
        className="absolute bottom-20 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-white text-xl font-bold drop-shadow-2xl bg-black/30 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20">
          {bubbleState === "idle" && "Tap the bubble to start recording"}
          {bubbleState === "recording" && "Recording... Speak now"}
          {bubbleState === "processing" && "Processing your voice..."}
          {bubbleState === "popped" && "Pop! Recording complete"}
        </p>
      </motion.div>
    </div>
  )
}