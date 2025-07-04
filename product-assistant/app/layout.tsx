import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Product Assistant - AI-Powered Support",
  description: "Get personalized answers, browse manuals, and get support for your products",
}

// Construct CDN URL for tenant-specific CSS
const getCdnCssUrl = () => {
  const cdnUrl = `${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${process.env.NEXT_PUBLIC_ENVIRONMENT}/${process.env.NEXT_PUBLIC_TENANT_IDENTIFIER}/websitefiles`
  return `${cdnUrl}/globals.css`
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cdnCssUrl = getCdnCssUrl()

  return (
    <html lang="en">
      <head>
        {/* Load tenant-specific CSS from CDN */}
        <link
          rel="stylesheet"
          href={cdnCssUrl}
          crossOrigin="anonymous"
          onError={(e) => {
            console.warn("Failed to load tenant CSS from CDN:", cdnCssUrl)
          }}
        />
      </head>
      <body className={inter.className}>
        <div id="app-root">{children}</div>
        <Toaster />
      </body>
    </html>
  )
}
