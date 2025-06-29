// File: voice-text-note-processor/components/mobile-navigation.tsx
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X, List, Home, User, Settings } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

interface MobileNavigationProps {
  userId?: string
  variant?: 'light' | 'dark' // New prop to control button styling
}

export function MobileNavigation({ variant = 'dark' }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const toggleMenu = () => setIsOpen(!isOpen)

  const navItems = [
    {
      href: "/capture",
      label: "Record",
      icon: Home,
      description: "Voice recording"
    },
    {
      href: "/capture/items",
      label: "My Items",
      icon: List,
      description: "View your babbles"
    },
    {
      href: "/capture/profile",
      label: "Profile",
      icon: User,
      description: "Account settings"
    },
    {
      href: "/capture/settings",
      label: "Settings",
      icon: Settings,
      description: "App preferences"
    }
  ]

  const handleNavigation = (href: string) => {
    router.push(href)
    setIsOpen(false)
  }

  // Button styling based on variant
  const buttonClasses = variant === 'light' 
    ? "w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 border border-blue-600 transition-all duration-200 shadow-lg"
    : "w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-200 shadow-lg"

  const iconColor = variant === 'light' ? 'text-white' : 'text-white'

  return (
    <>
      {/* Navigation Toggle Button */}
      <motion.div
        className="fixed top-4 right-4 z-50"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          onClick={toggleMenu}
          size="sm"
          className={buttonClasses}
          variant="ghost"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className={`w-5 h-5 ${iconColor}`} />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className={`w-5 h-5 ${iconColor}`} />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>

      {/* Navigation Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Navigation Panel */}
            <motion.div
              className="fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-l border-white/20 dark:border-slate-700/50 shadow-2xl z-50"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-6 border-b border-gray-200/50 dark:border-slate-700/50">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Menu</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Navigate Babble</p>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 p-4 space-y-2">
                  {navItems.map((item, index) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon

                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <button
                          onClick={() => handleNavigation(item.href)}
                          className={`w-full text-left p-4 rounded-lg transition-all duration-200 group ${
                            isActive
                              ? "bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 shadow-sm"
                              : "hover:bg-gray-100 dark:hover:bg-slate-700 border border-transparent"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`p-2 rounded-lg transition-colors ${
                                isActive
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-gray-300 group-hover:bg-gray-300 dark:group-hover:bg-slate-500"
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <h3
                                className={`font-medium ${
                                  isActive ? "text-blue-800 dark:text-blue-200" : "text-gray-800 dark:text-gray-200"
                                }`}
                              >
                                {item.label}
                              </h3>
                              <p
                                className={`text-sm ${
                                  isActive ? "text-blue-600 dark:text-blue-300" : "text-gray-600 dark:text-gray-400"
                                }`}
                              >
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200/50 dark:border-slate-700/50">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Babble</p>
                    <Button
                      onClick={() => router.push("/auth/sign-out")}
                      variant="outline"
                      size="sm"
                      className="w-full dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-700"
                    >
                      Sign Out
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}