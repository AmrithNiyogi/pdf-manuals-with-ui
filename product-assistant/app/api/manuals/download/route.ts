import { type NextRequest, NextResponse } from "next/server"
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { sampleManuals } from "../../../../lib/sample-data"

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
})

// POST /api/manuals/download - Generate signed URL for manual download
export async function POST(request: NextRequest) {
  try {
    const { manualId } = await request.json()

    if (!manualId) {
      return NextResponse.json({ success: false, error: "Manual ID is required" }, { status: 400 })
    }

    // Find the manual in our data
    const manual = sampleManuals.find((m) => m.id === manualId)
    if (!manual) {
      return NextResponse.json({ success: false, error: "Manual not found" }, { status: 404 })
    }

    // Generate signed URL for S3 object
    const command = new GetObjectCommand({
      Bucket: manual.s3Bucket,
      Key: manual.s3Key,
      ResponseContentDisposition: `attachment; filename="${manual.title}.pdf"`,
    })

    // URL expires in 1 hour
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

    return NextResponse.json({
      success: true,
      data: {
        downloadUrl: signedUrl,
        filename: `${manual.title}.pdf`,
        expiresIn: 3600,
      },
    })
  } catch (error) {
    console.error("Error generating download URL:", error)
    return NextResponse.json({ success: false, error: "Failed to generate download URL" }, { status: 500 })
  }
}
