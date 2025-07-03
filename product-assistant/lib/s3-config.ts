// S3 Configuration
export const S3_CONFIG = {
  region: process.env.AWS_REGION || "us-east-1",
  bucket: process.env.S3_MANUALS_BUCKET || "product-manuals-bucket",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
}

// Validate S3 configuration
export function validateS3Config() {
  const requiredEnvVars = ["AWS_REGION", "S3_MANUALS_BUCKET", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"]

  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar])

  if (missing.length > 0) {
    console.warn(`Missing S3 environment variables: ${missing.join(", ")}`)
    return false
  }

  return true
}
