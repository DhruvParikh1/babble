// File: components/BubbleVoiceRecorder.tsx
"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

// TypeScript interfaces for Web Speech API
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((event: Event) => void) | null;
  onend: ((event: Event) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
}

interface SpeechRecognitionStatic {
  new(): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}

type BubbleState = "idle" | "recording" | "processing" | "popped"

interface BubbleVoiceRecorderProps {
  userId: string;
}

export default function BubbleVoiceRecorder({ userId }: BubbleVoiceRecorderProps) {
  const [bubbleState, setBubbleState] = useState<BubbleState>("idle")
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const finalTranscriptRef = useRef("")
  const isStoppingRef = useRef(false)

  const processTranscription = useCallback(async (text: string) => {
    setBubbleState("processing")
    try {
      const response = await fetch('/api/process-voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: text,
          userId: userId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to process transcription')
      }

      const result = await response.json()
      console.log('Processing result:', result)
      
      // Clear the transcript after successful processing
      setTranscript("")
      finalTranscriptRef.current = ""
      
      // Trigger the pop animation
      setBubbleState("popped")
      
      // Trigger a refresh of the processed items list
      window.dispatchEvent(new CustomEvent('refreshProcessedItems'))
      
      // Reset after pop animation
      setTimeout(() => {
        setBubbleState("idle")
      }, 2500)
      
    } catch (error) {
      console.error('Error processing transcription:', error)
      setError('Failed to process your voice note')
      
      // Auto-hide error and reset after 3 seconds
      setTimeout(() => {
        setError(null)
        setBubbleState("idle")
      }, 3000)
    }
  }, [userId])

  const recreateRecognition = useCallback(() => {
    const SpeechRecognition = 
      window.SpeechRecognition || 
      window.webkitSpeechRecognition
    
    if (SpeechRecognition) {
      // Destroy old instance
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch {
          // Ignore errors when aborting
        }
      }
      
      // Create new instance
      recognitionRef.current = new SpeechRecognition()
      const recognition = recognitionRef.current
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = 'en-US'

      // Attach event handlers
      recognition.onstart = () => {
        console.log('Speech recognition started')
        setBubbleState("recording")
        setError(null)
        finalTranscriptRef.current = ""
        setTranscript("")
        isStoppingRef.current = false
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = ""
        let finalTranscript = finalTranscriptRef.current

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        finalTranscriptRef.current = finalTranscript
        setTranscript(finalTranscript + interimTranscript)
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error)
        
        if (event.error !== 'aborted') {
          setError(`Speech recognition error: ${event.error}`)
        }
        
        setBubbleState("idle")
        isStoppingRef.current = false
      }

      recognition.onend = () => {
        console.log('Speech recognition ended')
        
        if (!isStoppingRef.current) {
          if (finalTranscriptRef.current.trim()) {
            processTranscription(finalTranscriptRef.current.trim())
          } else {
            setBubbleState("idle")
          }
        }
      }
    }
  }, [processTranscription])

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = 
      window.SpeechRecognition || 
      window.webkitSpeechRecognition
    
    if (SpeechRecognition) {
      setIsSupported(true)
      recreateRecognition()
    } else {
      setError('Speech recognition is not supported in this browser')
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [recreateRecognition])

  const handleBubbleTap = () => {
    if (!isSupported) {
      setError('Speech recognition not supported')
      return
    }

    if (bubbleState === "idle") {
      // Start recording
      if (recognitionRef.current) {
        try {
          console.log('Starting speech recognition...')
          recognitionRef.current.start()
        } catch (error) {
          console.error('Error starting recognition:', error)
          setError('Failed to start recording')
        }
      }
    } else if (bubbleState === "recording") {
      // Stop recording
      if (recognitionRef.current && !isStoppingRef.current) {
        console.log('Stopping speech recognition...')
        isStoppingRef.current = true
        
        try {
          // Capture current transcript before stopping
          const currentTranscript = finalTranscriptRef.current.trim()
          
          // Try to abort the current recognition
          recognitionRef.current.abort()
          
          // Reset stopping flag
          isStoppingRef.current = false
          
          // Recreate the recognition instance for next time
          setTimeout(() => {
            recreateRecognition()
          }, 100)
          
          // Process transcript if we have any
          if (currentTranscript) {
            processTranscription(currentTranscript)
          } else {
            setBubbleState("idle")
          }
          
        } catch (error) {
          console.error('Error stopping recognition:', error)
          setBubbleState("idle")
          isStoppingRef.current = false
          recreateRecognition()
        }
      }
    }
    // If processing or popped, do nothing (let animations complete)
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

  if (!isSupported) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-400 via-blue-300 to-blue-200">
        <div className="text-center space-y-4 bg-white/20 backdrop-blur-sm rounded-lg p-8 mx-4">
          <div className="text-red-600 font-semibold text-lg">
            Speech recognition is not supported in this browser.
          </div>
          <div className="text-white text-sm">
            Please use Chrome, Safari, or Edge.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-400 via-blue-300 to-blue-200 overflow-hidden relative"
      style={{ perspective: "1200px" }}
    >
      {/* Live Transcript Overlay */}
      <AnimatePresence>
        {transcript && bubbleState === "recording" && (
          <motion.div
            className="absolute top-20 left-4 right-4 z-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
              <p className="text-sm font-medium text-gray-700 mb-1">Live Transcript:</p>
              <p className="text-sm text-gray-600 italic">&quot;{transcript}&quot;</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Overlay */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="absolute top-20 left-4 right-4 z-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-lg p-4 shadow-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {bubbleState !== "popped" && (
          <motion.button
            onClick={handleBubbleTap}
            disabled={bubbleState === "processing"}
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
                duration: 0.3,
                ease: "easeOut",
                type: "tween", // Use tween for multiple keyframes in exit
              }
            }}
            transition={{
              scale: {
                type: "spring",
                stiffness: 200,
                damping: 15,
              },
              y: {
                duration: 2.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              },
              rotateX: {
                duration: 10,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              },
              rotateY: {
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
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
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                },
                opacity: {
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                },
                rotate: {
                  duration: 20,
                  repeat: Number.POSITIVE_INFINITY,
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
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  },
                  scaleX: {
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  },
                  scaleY: {
                    duration: 5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  },
                }}
              >
                {/* Pink-dominant iridescent edge colors */}
                <motion.div
                  className="absolute inset-0 opacity-60"
                  style={{
                    background: `
                      conic-gradient(from var(--rotation, 0deg),
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
                    "--rotation": ["0deg", "360deg"],
                    borderRadius: [
                      "60% 40% 30% 70% / 60% 30% 70% 40%",
                      "30% 60% 70% 40% / 50% 60% 30% 60%",
                      "50% 40% 60% 30% / 40% 50% 60% 50%",
                      "40% 60% 50% 60% / 70% 40% 50% 30%",
                      "60% 40% 30% 70% / 60% 30% 70% 40%",
                    ],
                  } satisfies Record<string, string | string[]>}
                  transition={{
                    "--rotation": {
                      duration: 15,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    },
                    borderRadius: {
                      duration: 6,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    },
                  }}
                />

                {/* Secondary pink-toned edge shimmer */}
                <motion.div
                  className="absolute inset-0 opacity-40"
                  style={{
                    background: `
                      conic-gradient(from var(--rotation2, 180deg),
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
                    "--rotation2": ["180deg", "-180deg"],
                    borderRadius: [
                      "60% 40% 30% 70% / 60% 30% 70% 40%",
                      "30% 60% 70% 40% / 50% 60% 30% 60%",
                      "50% 40% 60% 30% / 40% 50% 60% 50%",
                      "40% 60% 50% 60% / 70% 40% 50% 30%",
                      "60% 40% 30% 70% / 60% 30% 70% 40%",
                    ],
                  } satisfies Record<string, string | string[]>}
                  transition={{
                    "--rotation2": {
                      duration: 12,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    },
                    borderRadius: {
                      duration: 6,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    },
                  }}
                />

                {/* Subtle pink inner glow */}
                <motion.div
                  className="absolute inset-0 opacity-25"
                  style={{
                    background: `
                      radial-gradient(circle at var(--glow-x, 30%) var(--glow-y, 40%), 
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
                    "--glow-x": ["20%", "80%", "40%", "60%", "20%"],
                    "--glow-y": ["30%", "70%", "50%", "20%", "30%"],
                    borderRadius: [
                      "60% 40% 30% 70% / 60% 30% 70% 40%",
                      "30% 60% 70% 40% / 50% 60% 30% 60%",
                      "50% 40% 60% 30% / 40% 50% 60% 50%",
                      "40% 60% 50% 60% / 70% 40% 50% 30%",
                      "60% 40% 30% 70% / 60% 30% 70% 40%",
                    ],
                  } satisfies Record<string, string | string[]>}
                  transition={{
                    duration: 8,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />

                {/* Additional pink accent layer */}
                <motion.div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: `
                      radial-gradient(ellipse at var(--accent-x, 70%) var(--accent-y, 30%), 
                        rgba(255, 192, 203, 0.2) 0%, 
                        rgba(255, 182, 193, 0.15) 30%, 
                        rgba(255, 228, 225, 0.1) 50%, 
                        transparent 70%
                      )
                    `,
                    transform: "translateZ(3.5px)",
                  }}
                  animate={{
                    "--accent-x": ["60%", "20%", "80%", "40%", "60%"],
                    "--accent-y": ["20%", "80%", "30%", "70%", "20%"],
                    borderRadius: [
                      "60% 40% 30% 70% / 60% 30% 70% 40%",
                      "30% 60% 70% 40% / 50% 60% 30% 60%",
                      "50% 40% 60% 30% / 40% 50% 60% 50%",
                      "40% 60% 50% 60% / 70% 40% 50% 30%",
                      "60% 40% 30% 70% / 60% 30% 70% 40%",
                    ],
                  } satisfies Record<string, string | string[]>}
                  transition={{
                    duration: 6,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                />

                {/* Primary bright highlight */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(ellipse at var(--x, 20%) var(--y, 20%), 
                      rgba(255, 255, 255, 1) 0%,
                      rgba(255, 255, 255, 0.8) 8%,
                      rgba(255, 255, 255, 0.4) 20%,
                      rgba(255, 255, 255, 0.1) 35%,
                      transparent 60%
                    )`,
                    transform: "translateZ(5px)",
                  }}
                  animate={{
                    "--x": ["15%", "85%", "30%", "70%", "15%"],
                    "--y": ["15%", "80%", "35%", "90%", "15%"],
                    borderRadius: [
                      "60% 40% 30% 70% / 60% 30% 70% 40%",
                      "30% 60% 70% 40% / 50% 60% 30% 60%",
                      "50% 40% 60% 30% / 40% 50% 60% 50%",
                      "40% 60% 50% 60% / 70% 40% 50% 30%",
                      "60% 40% 30% 70% / 60% 30% 70% 40%",
                    ],
                  } satisfies Record<string, string | string[]>}
                  transition={{
                    duration: 5,
                    repeat: Number.POSITIVE_INFINITY,
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
                    repeat: Number.POSITIVE_INFINITY,
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
                    repeat: Number.POSITIVE_INFINITY,
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
          {bubbleState === "idle" && "Tap the bubble to babble"}
          {bubbleState === "recording" && "Recording... Speak now"}
          {bubbleState === "processing" && "Processing your voice..."}
          {bubbleState === "popped" && "Pop! Recording complete"}
        </p>
      </motion.div>
    </div>
  )
}