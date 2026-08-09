import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  title: "MESHGRID // Decentralized Data & Compute Network",
  description:
    "Control plane for a decentralized data and compute network. Monitor nodes, schedule jobs, verify on-chain storage commitments, and track network health.",
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#0a0a0c",
  colorScheme: "dark",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`bg-background ${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-mono antialiased">{children}</body>
    </html>
  )
}
