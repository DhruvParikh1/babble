// File: app/layout.tsx
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Babble - Capture Your Thoughts Before They Pop",
  description: "Transform your random voice memos into actionable items. Babble automatically converts your thoughts into organized tasks, reminders, and notes.",
  keywords: "voice notes, voice to text, task management, productivity, speech recognition, note taking, voice memos, AI organization",
  authors: [{ name: "Babble Team" }],
  creator: "Babble",
  publisher: "Babble",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: defaultUrl,
    siteName: "Babble",
    title: "Babble - Capture Your Thoughts Before They Pop",
    description: "Transform your random voice memos into actionable items. Babble automatically converts your thoughts into organized tasks, reminders, and notes.",
    images: [
      {
        url: "/og-image.png", // You can add this later
        width: 1200,
        height: 630,
        alt: "Babble - Voice Note Processor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Babble - Capture Your Thoughts Before They Pop",
    description: "Transform your random voice memos into actionable items. Babble automatically converts your thoughts into organized tasks, reminders, and notes.",
    images: ["/og-image.png"], // You can add this later
    creator: "@babble", // Update with your actual Twitter handle
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}