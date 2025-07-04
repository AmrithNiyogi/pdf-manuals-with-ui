"use client"

import { useEffect, useState } from "react"
import { getCdnCssUrl, validateCdnConfig, getCdnConfig } from "../lib/cdn-config"

interface UseCdnCssOptions {
  tenantId?: string
  environment?: string
  cloudFrontUrl?: string
  onLoad?: (cssUrl: string) => void
  onError?: (error: Error, cssUrl: string) => void
}

export function useCdnCss(options: UseCdnCssOptions = {}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [cssUrl, setCssUrl] = useState<string>("")

  useEffect(() => {
    const config = {
      ...getCdnConfig(),
      ...(options.tenantId && { tenantIdentifier: options.tenantId }),
      ...(options.environment && { environment: options.environment }),
      ...(options.cloudFrontUrl && { cloudFrontUrl: options.cloudFrontUrl }),
    }

    // Validate configuration
    if (!validateCdnConfig(config)) {
      const configError = new Error("Invalid CDN configuration")
      setError(configError)
      options.onError?.(configError, "")
      return
    }

    const url = getCdnCssUrl(config)
    setCssUrl(url)

    // Check if CSS is already loaded
    const existingLink = document.querySelector(`link[href="${url}"]`)
    if (existingLink) {
      setIsLoaded(true)
      return
    }

    setIsLoading(true)
    setError(null)

    // Create and append CSS link
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = url
    link.crossOrigin = "anonymous"

    // Add error handling
    link.onerror = () => {
      const loadError = new Error(`Failed to load CSS from: ${url}`)
      setError(loadError)
      setIsLoading(false)
      options.onError?.(loadError, url)
    }

    // Add success handling
    link.onload = () => {
      setIsLoaded(true)
      setIsLoading(false)
      options.onLoad?.(url)

      // Dispatch custom event
      window.dispatchEvent(
        new CustomEvent("tenantCssLoaded", {
          detail: { cssUrl: url, config },
        }),
      )
    }

    document.head.appendChild(link)

    // Cleanup function
    return () => {
      const linkToRemove = document.querySelector(`link[href="${url}"]`)
      if (linkToRemove) {
        document.head.removeChild(linkToRemove)
      }
    }
  }, [options.tenantId, options.environment, options.cloudFrontUrl])

  return {
    isLoaded,
    isLoading,
    error,
    cssUrl,
  }
}
