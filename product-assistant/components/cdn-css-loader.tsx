"use client"

import { useEffect } from "react"

interface CdnCssLoaderProps {
  tenantId?: string
  environment?: string
  cloudFrontUrl?: string
}

export function CdnCssLoader({ tenantId, environment, cloudFrontUrl }: CdnCssLoaderProps) {
  useEffect(() => {
    // Construct CDN URL from props or environment variables
    const cdnUrl = `${cloudFrontUrl || process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${environment || process.env.NEXT_PUBLIC_ENVIRONMENT}/${tenantId || process.env.NEXT_PUBLIC_TENANT_IDENTIFIER}/websitefiles`
    const cssUrl = `${cdnUrl}/globals.css`

    // Check if CSS is already loaded
    const existingLink = document.querySelector(`link[href="${cssUrl}"]`)
    if (existingLink) return

    // Create and append CSS link
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = cssUrl
    link.crossOrigin = "anonymous"

    // Add error handling
    link.onerror = () => {
      console.warn("Failed to load tenant CSS from CDN:", cssUrl)
    }

    // Add success handling
    link.onload = () => {
      console.log("Successfully loaded tenant CSS from CDN:", cssUrl)
      // Dispatch custom event for CSS loaded
      window.dispatchEvent(
        new CustomEvent("tenantCssLoaded", {
          detail: { cssUrl, tenantId, environment },
        }),
      )
    }

    document.head.appendChild(link)

    // Cleanup function
    return () => {
      const linkToRemove = document.querySelector(`link[href="${cssUrl}"]`)
      if (linkToRemove) {
        document.head.removeChild(linkToRemove)
      }
    }
  }, [tenantId, environment, cloudFrontUrl])

  return null
}
