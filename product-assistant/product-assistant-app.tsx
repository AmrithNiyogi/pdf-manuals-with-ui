"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageCircle, BookOpen, Gem, HelpCircle } from "lucide-react"
import { ChatAssistant } from "./components/chat-assistant"
import { ProductManuals } from "./components/product-manuals"
import { CdnCssLoader } from "./components/cdn-css-loader"

export default function ProductAssistantApp() {
  const [activeTab, setActiveTab] = useState("chat")
  const [cssLoaded, setCssLoaded] = useState(false)

  useEffect(() => {
    // Listen for CSS loaded event
    const handleCssLoaded = (event: CustomEvent) => {
      setCssLoaded(true)
      console.log("Tenant CSS loaded:", event.detail)
    }

    window.addEventListener("tenantCssLoaded", handleCssLoaded as EventListener)

    return () => {
      window.removeEventListener("tenantCssLoaded", handleCssLoaded as EventListener)
    }
  }, [])

  return (
    <div id="product-assistant-app" className="min-h-screen bg-gray-50">
      {/* Load tenant-specific CSS */}
      <CdnCssLoader />

      <div id="main-container" className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div id="app-header" className="flex items-center gap-3 mb-8">
          <div id="header-icon" className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-white" />
          </div>
          <div id="header-text">
            <h1 id="app-title" className="text-xl font-semibold text-gray-900">
              Product Assistant
            </h1>
            <p id="app-subtitle" className="text-gray-600">
              Intelligent Product Support
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div id="hero-section" className="text-center mb-8">
          <div id="badge-container" className="flex justify-center mb-4">
            <Badge
              id="ai-badge"
              variant="secondary"
              className="bg-purple-50 text-purple-700 border-purple-200 px-4 py-2 text-sm font-medium"
              data-css-loaded={cssLoaded}
            >
              <Gem className="w-4 h-4 mr-2" />
              AI-Powered Product Support
            </Badge>
          </div>
          <h2 id="main-heading" className="text-xl md:text-2xl font-bold text-blue-900 mb-4">
            What can we help you with?
          </h2>
          <p id="main-description" className="text-base text-gray-600 mb-8 max-w-2xl mx-auto">
            Get personalized answers and browse manuals for your products all in one place!
          </p>
        </div>

        {/* Tabbed Interface */}
        <Card id="main-card" className="shadow-sm" data-css-loaded={cssLoaded}>
          <Tabs id="main-tabs" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList id="tabs-list" className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger id="chat-tab" value="chat" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Chat Assistant
              </TabsTrigger>
              <TabsTrigger id="manuals-tab" value="manuals" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Product Manuals
              </TabsTrigger>
            </TabsList>

            <div id="tabs-content" className="p-6">
              <TabsContent id="chat-content" value="chat" className="mt-0">
                <ChatAssistant />
              </TabsContent>

              <TabsContent id="manuals-content" value="manuals" className="mt-0">
                <ProductManuals />
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
