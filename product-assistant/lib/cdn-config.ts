// CDN Configuration utilities
export interface CdnConfig {
  cloudFrontUrl: string
  environment: string
  tenantIdentifier: string
}

export const getCdnConfig = (): CdnConfig => {
  return {
    cloudFrontUrl: process.env.NEXT_PUBLIC_CLOUDFRONT_URL || "",
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT || "development",
    tenantIdentifier: process.env.NEXT_PUBLIC_TENANT_IDENTIFIER || "default",
  }
}

export const buildCdnUrl = (config: CdnConfig): string => {
  return `${config.cloudFrontUrl}/${config.environment}/${config.tenantIdentifier}/websitefiles`
}

export const getCdnAssetUrl = (assetPath: string): string => {
  const config = getCdnConfig()
  const cdnUrl = buildCdnUrl(config)
  return `${cdnUrl}/${assetPath}`
}

// Validate CDN configuration
export const validateCdnConfig = (config: CdnConfig): boolean => {
  const requiredFields = ["cloudFrontUrl", "environment", "tenantIdentifier"]

  for (const field of requiredFields) {
    if (!config[field as keyof CdnConfig]) {
      console.warn(`Missing CDN configuration: ${field}`)
      return false
    }
  }

  return true
}

// CSS-specific utilities
export const getCdnCssUrl = (config?: Partial<CdnConfig>): string => {
  const fullConfig = { ...getCdnConfig(), ...config }
  const cdnUrl = buildCdnUrl(fullConfig)
  return `${cdnUrl}/globals.css`
}
