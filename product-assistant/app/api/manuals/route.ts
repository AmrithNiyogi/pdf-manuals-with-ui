import { type NextRequest, NextResponse } from "next/server"
import { S3Client } from "@aws-sdk/client-s3"
import { sampleManuals } from "../../../lib/sample-data"

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
})

// GET /api/manuals - List all manuals or search with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const category = searchParams.get("category")
    const cursor = searchParams.get("cursor")
    const limit = Number.parseInt(searchParams.get("limit") || "12")

    let filteredManuals = sampleManuals

    // Apply search filter
    if (search) {
      const query = search.toLowerCase()
      filteredManuals = filteredManuals.filter(
        (manual) =>
          manual.title.toLowerCase().includes(query) ||
          manual.category.toLowerCase().includes(query) ||
          manual.productType.toLowerCase().includes(query) ||
          manual.brand.toLowerCase().includes(query),
      )
    }

    // Apply category filter
    if (category && category !== "all") {
      filteredManuals = filteredManuals.filter((manual) => manual.category.toLowerCase() === category.toLowerCase())
    }

    // Sort by date added (newest first)
    filteredManuals.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())

    // Handle pagination
    let startIndex = 0
    if (cursor) {
      const cursorIndex = filteredManuals.findIndex((manual) => manual.id === cursor)
      startIndex = cursorIndex > -1 ? cursorIndex + 1 : 0
    }

    const endIndex = startIndex + limit
    const paginatedManuals = filteredManuals.slice(startIndex, endIndex)
    const hasMore = endIndex < filteredManuals.length
    const nextCursor = hasMore ? paginatedManuals[paginatedManuals.length - 1]?.id : undefined

    // Simulate network delay for demonstration
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json({
      success: true,
      data: paginatedManuals,
      total: filteredManuals.length,
      hasMore,
      nextCursor,
      currentPage: Math.floor(startIndex / limit) + 1,
      totalPages: Math.ceil(filteredManuals.length / limit),
    })
  } catch (error) {
    console.error("Error fetching manuals:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch manuals" }, { status: 500 })
  }
}
