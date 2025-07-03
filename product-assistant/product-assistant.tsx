import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageCircle, BookOpen, HelpCircle, Gem, Clock, ShoppingBag } from "lucide-react"

export default function ProductAssistant() {
  return (
    <div id="product-assistant-landing" className="min-h-screen bg-gray-50 p-4">
      <div id="landing-container" className="max-w-4xl mx-auto">
        {/* Header */}
        <div id="landing-header" className="flex items-center gap-3 mb-8">
          <div id="landing-header-icon" className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-white" />
          </div>
          <div id="landing-header-text">
            <h1 id="landing-title" className="text-xl font-semibold text-gray-900">
              Product Assistant
            </h1>
            <p id="landing-subtitle" className="text-gray-600">
              Intelligent Product Support
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div id="landing-hero" className="text-center mb-12">
          {/* AI Badge */}
          <div id="landing-badge-container" className="flex justify-center mb-6">
            <Badge
              id="landing-ai-badge"
              variant="secondary"
              className="bg-purple-50 text-purple-700 border-purple-200 px-4 py-2 text-sm font-medium"
            >
              <Gem className="w-4 h-4 mr-2" />
              AI-Powered Product Support
            </Badge>
          </div>

          {/* Main Heading */}
          <h2 id="landing-main-heading" className="text-2xl md:text-3xl font-bold text-blue-900 mb-4">
            What can we help you with?
          </h2>

          {/* Subtitle */}
          <p id="landing-description" className="text-base text-gray-600 mb-8 max-w-2xl mx-auto">
            Get personalized answers, browse manuals, and register your products all in one place
          </p>

          {/* Action Buttons */}
          <div id="landing-buttons" className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              id="chat-button"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat Assistant
            </Button>
            <Button
              id="manuals-button"
              variant="outline"
              className="border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium bg-transparent"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Product Manuals
            </Button>
          </div>
        </div>

        {/* Chat Interface */}
        <div id="landing-chat-preview" className="max-w-2xl mx-auto">
          <Card id="preview-card" className="shadow-sm">
            <CardHeader id="preview-header" className="pb-3">
              <div id="preview-header-content" className="flex items-center gap-3">
                <Avatar id="preview-avatar" className="w-10 h-10 bg-blue-600">
                  <AvatarFallback className="bg-blue-600 text-white">
                    <ShoppingBag className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div id="preview-header-text">
                  <h3 id="preview-title" className="font-semibold text-gray-900">
                    AI Product Assistant
                  </h3>
                  <p id="preview-subtitle" className="text-sm text-gray-600">
                    Ask me anything about your products
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent id="preview-content">
              <div id="preview-messages" className="space-y-4">
                <div id="preview-message" className="flex gap-3">
                  <Avatar id="preview-message-avatar" className="w-8 h-8 bg-blue-600 flex-shrink-0">
                    <AvatarFallback className="bg-blue-600 text-white">
                      <ShoppingBag className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div id="preview-message-content" className="flex-1">
                    <div id="preview-message-bubble" className="bg-gray-50 rounded-lg p-3 text-sm text-gray-800">
                      {
                        "Hello! I'm your Product Assistant. I can help you with product questions, troubleshooting, and finding information in your manuals. What would you like to know?"
                      }
                    </div>
                    <div id="preview-message-time" className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      13:14
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
