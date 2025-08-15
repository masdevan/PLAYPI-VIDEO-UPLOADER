import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@/styles/globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_PLAYPI_NAME || 'PlayPi'} - Upload & Share Videos`,
  description: process.env.NEXT_PUBLIC_PLAYPI_DESCRIPTION || "A simple platform to upload and share videos with a dark theme",
  icons: {
    icon: '/icon/icon.png',
    shortcut: '/icon/icon.png',
    apple: '/icon/icon.png',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className={`${inter.className} h-full`} suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
