"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Search, Download, FileText, Calendar, Loader2, AlertCircle } from "lucide-react"
import type { ProductManual } from "../lib/sample-data"

interface ManualsResponse {
  success: boolean
  data: ProductManual[]
  total: number
  hasMore: boolean
  nextCursor?: string
}

export function ProductManuals() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [manuals, setManuals] = useState<ProductManual[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [nextCursor, setNextCursor] = useState<string | undefined>()
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set())
  const [categories, setCategories] = useState<string[]>([])
  const { toast } = useToast()

  // Intersection Observer for infinite scroll
  const observerRef = useRef<IntersectionObserver>()
  const lastManualElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading || loadingMore) return
      if (observerRef.current) observerRef.current.disconnect()
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreManuals()
        }
      })
      if (node) observerRef.current.observe(node)
    },
    [loading, loadingMore, hasMore],
  )

  // Reset and fetch manuals when search/category changes
  useEffect(() => {
    resetAndFetchManuals()
  }, [searchQuery, selectedCategory])

  const resetAndFetchManuals = async () => {
    setManuals([])
    setNextCursor(undefined)
    setHasMore(true)
    await fetchManuals(true)
  }

  const fetchManuals = async (isReset = false) => {
    try {
      if (isReset) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      const params = new URLSearchParams()
      if (searchQuery) params.append("search", searchQuery)
      if (selectedCategory !== "all") params.append("category", selectedCategory)
      if (nextCursor && !isReset) params.append("cursor", nextCursor)
      params.append("limit", "12") // Load 12 items at a time

      const response = await fetch(`/api/manuals?${params.toString()}`)
      const result: ManualsResponse = await response.json()

      if (result.success) {
        if (isReset) {
          setManuals(result.data)
          // Extract unique categories from the first batch
          const uniqueCategories = Array.from(new Set(result.data.map((m) => m.category)))
          setCategories(uniqueCategories)
        } else {
          setManuals((prev) => [...prev, ...result.data])
        }
        setHasMore(result.hasMore)
        setNextCursor(result.nextCursor)
      } else {
        throw new Error(result.error || "Failed to fetch manuals")
      }
    } catch (error) {
      console.error("Error fetching manuals:", error)
      toast({
        title: "Error",
        description: "Failed to load manuals. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMoreManuals = async () => {
    if (!hasMore || loadingMore) return
    await fetchManuals(false)
  }

  const handleDownload = async (manual: ProductManual) => {
    try {
      setDownloadingIds((prev) => new Set(prev).add(manual.id))

      const response = await fetch("/api/manuals/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ manualId: manual.id }),
      })

      const result = await response.json()

      if (result.success) {
        // Create a temporary link and trigger download
        const link = document.createElement("a")
        link.href = result.data.downloadUrl
        link.download = result.data.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast({
          title: "Download Started",
          description: `${manual.title} is being downloaded.`,
        })
      } else {
        throw new Error(result.error || "Failed to generate download link")
      }
    } catch (error) {
      console.error("Error downloading manual:", error)
      toast({
        title: "Download Failed",
        description: "Failed to download the manual. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDownloadingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(manual.id)
        return newSet
      })
    }
  }

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== "") {
        resetAndFetchManuals()
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  return (
    <div id="product-manuals" className="space-y-6">
      {/* Header */}
      <div id="manuals-header" className="text-center">
        <h2 id="manuals-title" className="text-2xl font-bold text-gray-900 mb-2">
          Product Manuals
        </h2>
        <p id="manuals-description" className="text-gray-600">
          Browse and download product manuals from our S3 storage
        </p>
      </div>

      {/* Search Bar */}
      <Card id="search-card">
        <CardContent id="search-content" className="p-4">
          <div id="search-container" className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="search-input"
              placeholder="Search manuals by title, product type, or brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <div id="categories-container" className="flex flex-wrap gap-2">
        <Badge
          id="category-all"
          variant={selectedCategory === "all" ? "default" : "outline"}
          className="cursor-pointer hover:bg-gray-50"
          onClick={() => setSelectedCategory("all")}
        >
          All Categories
        </Badge>
        {categories.map((category) => (
          <Badge
            key={category}
            id={`category-${category.toLowerCase().replace(/\s+/g, "-")}`}
            variant={selectedCategory === category ? "default" : "outline"}
            className="cursor-pointer hover:bg-gray-50"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>

      {/* Results Count */}
      {!loading && manuals.length > 0 && (
        <div id="results-count" className="text-sm text-gray-600">
          Showing {manuals.length} manual{manuals.length !== 1 ? "s" : ""}
          {hasMore && " (scroll for more)"}
        </div>
      )}

      {/* Initial Loading State */}
      {loading && manuals.length === 0 && (
        <Card id="loading-card">
          <CardContent id="loading-content" className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading manuals...</p>
          </CardContent>
        </Card>
      )}

      {/* Manuals Grid */}
      {manuals.length > 0 && (
        <div id="manuals-grid" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {manuals.map((manual, index) => (
            <Card
              key={manual.id}
              id={`manual-card-${manual.id}`}
              className="hover:shadow-md transition-shadow"
              ref={index === manuals.length - 1 ? lastManualElementRef : null}
            >
              <CardHeader id={`manual-header-${manual.id}`} className="pb-3">
                <div id={`manual-header-content-${manual.id}`} className="flex items-start justify-between">
                  <FileText className="w-8 h-8 text-blue-600 flex-shrink-0" />
                  <Badge id={`manual-category-${manual.id}`} variant="secondary" className="text-xs">
                    {manual.category}
                  </Badge>
                </div>
                <CardTitle id={`manual-title-${manual.id}`} className="text-lg leading-tight">
                  {manual.title}
                </CardTitle>
              </CardHeader>
              <CardContent id={`manual-content-${manual.id}`} className="pt-0">
                <div id={`manual-details-${manual.id}`} className="space-y-3">
                  <div id={`manual-info-${manual.id}`} className="text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Product Type:</span>
                      <span className="font-medium">{manual.productType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Brand:</span>
                      <span className="font-medium">{manual.brand}</span>
                    </div>
                    {manual.fileSize && (
                      <div className="flex justify-between">
                        <span>File Size:</span>
                        <span className="font-medium">{manual.fileSize}</span>
                      </div>
                    )}
                  </div>

                  <div id={`manual-date-${manual.id}`} className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    Added {new Date(manual.dateAdded).toLocaleDateString()}
                  </div>

                  <Button
                    id={`download-btn-${manual.id}`}
                    onClick={() => handleDownload(manual)}
                    className="w-full"
                    size="sm"
                    disabled={downloadingIds.has(manual.id)}
                  >
                    {downloadingIds.has(manual.id) ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Preparing...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Load More Loading State */}
      {loadingMore && (
        <Card id="load-more-loading">
          <CardContent className="p-6 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-sm text-gray-600">Loading more manuals...</p>
          </CardContent>
        </Card>
      )}

      {/* Load More Button (fallback for when intersection observer doesn't work) */}
      {!loading && !loadingMore && hasMore && manuals.length > 0 && (
        <div id="load-more-container" className="text-center">
          <Button id="load-more-btn" variant="outline" onClick={loadMoreManuals} className="px-8 bg-transparent">
            Load More Manuals
          </Button>
        </div>
      )}

      {/* End of Results */}
      {!loading && !hasMore && manuals.length > 0 && (
        <div id="end-results" className="text-center py-4">
          <p className="text-sm text-gray-500">You've reached the end of the results</p>
        </div>
      )}

      {/* No Results */}
      {!loading && manuals.length === 0 && (
        <Card id="no-results">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No manuals found</h3>
            <p className="text-gray-600">Try adjusting your search terms or browse all available manuals.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
