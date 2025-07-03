"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User, Loader2, Package } from "lucide-react"
import { registeredProducts, sampleManuals, type RegisteredProduct } from "../lib/sample-data"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  type?: "text" | "product-selection" | "mobile-verification" | "product-buttons" | "model-input"
  data?: any
}

interface ChatState {
  selectedProduct: RegisteredProduct | null
  unregisteredProduct: {
    brand?: string
    productType?: string
    modelNumber?: string
  } | null
  awaitingModelNumber: boolean
}

export function ChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your AI Product Assistant. I can help you with any product questions, troubleshooting, and support. Simply tell me your product's brand and model number (e.g., 'Sony X90J-55' or 'LG WM4000H').",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [chatState, setChatState] = useState<ChatState>({
    selectedProduct: null,
    unregisteredProduct: null,
    awaitingModelNumber: false,
  })

  const findProductByModel = (modelNumber: string) => {
    // Check if model exists in registered products (for reference)
    const registeredMatch = registeredProducts.find((product) =>
      product.modelNumber.toLowerCase().includes(modelNumber.toLowerCase()),
    )

    // Check if manual exists for this model
    const manualMatch = sampleManuals.find(
      (manual) =>
        manual.title.toLowerCase().includes(modelNumber.toLowerCase()) ||
        manual.productType.toLowerCase().includes(modelNumber.toLowerCase()),
    )

    return { registeredMatch, manualMatch }
  }

  const handleModelNumberInput = (modelInput: string) => {
    const { registeredMatch, manualMatch } = findProductByModel(modelInput)

    let productInfo = {
      brand: "Unknown",
      productType: "Product",
      modelNumber: modelInput,
    }

    // Try to extract product info from matches
    if (registeredMatch) {
      productInfo = {
        brand: registeredMatch.brand,
        productType: registeredMatch.productType,
        modelNumber: registeredMatch.modelNumber,
      }
    } else if (manualMatch) {
      productInfo = {
        brand: manualMatch.brand,
        productType: manualMatch.productType,
        modelNumber: modelInput,
      }
    }

    setChatState((prev) => ({
      ...prev,
      unregisteredProduct: productInfo,
      awaitingModelNumber: false,
    }))

    const assistantMessage: Message = {
      id: Date.now().toString(),
      content: `Perfect! I can help you with your ${productInfo.brand} ${productInfo.productType} (${productInfo.modelNumber}). 

${
  registeredMatch
    ? `I found this model in our database. While it's not registered to your number, I can still provide support based on the product specifications.`
    : `I'll provide general support for this model. For the best experience, consider registering your product.`
}

What specific issue or question do you have about this product?`,
      role: "assistant",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, assistantMessage])
  }

  const generateUnregisteredResponse = (
    query: string,
    product: { brand?: string; productType?: string; modelNumber?: string },
  ): string => {
    const lowerQuery = query.toLowerCase()
    const productInfo = `${product.brand} ${product.productType} (${product.modelNumber})`

    if (lowerQuery.includes("error") || lowerQuery.includes("troubleshoot")) {
      return `I can help you troubleshoot your ${productInfo}. Here are some general troubleshooting steps for ${product.productType}:\n\n**Common troubleshooting steps:**\n1. Power cycle the device (unplug for 30 seconds)\n2. Check all connections and cables\n3. Ensure firmware/software is updated\n4. Check for any error codes or indicators\n\n**For model-specific help:**\n- Check the user manual for your exact model\n- Visit the manufacturer's support website\n- Contact customer support with your model number\n\nWhat specific error or issue are you experiencing?`
    }

    if (lowerQuery.includes("warranty")) {
      return `**Warranty Information for ${productInfo}:**\n\nSince this product isn't registered in our system, I can provide general warranty guidance:\n\n📋 **To check your warranty:**\n- Locate your purchase receipt\n- Visit the manufacturer's website\n- Use the serial number to check warranty status\n- Contact customer support directly\n\n**Typical warranty periods:**\n- Electronics: 1-3 years\n- Home Appliances: 1-5 years\n- Premium products: Extended warranties available\n\n💡 **Tip:** Register your product to get personalized warranty tracking and support!`
    }

    if (lowerQuery.includes("manual") || lowerQuery.includes("guide")) {
      const manualMatch = sampleManuals.find(
        (manual) =>
          manual.title.toLowerCase().includes(product.modelNumber?.toLowerCase() || "") ||
          manual.productType.toLowerCase() === product.productType?.toLowerCase(),
      )

      if (manualMatch) {
        return `📖 **Manual found for your ${productInfo}!**\n\nI found the user manual: "${manualMatch.title}"\n\n**Available resources:**\n- Digital user manual\n- Quick start guide\n- Troubleshooting section\n- Safety information\n\nWould you like me to help you find specific information from the manual?`
      } else {
        return `📖 **Manual for ${productInfo}:**\n\nI don't have the specific manual in my database, but here's how to find it:\n\n**Where to find your manual:**\n- Manufacturer's official website\n- Support section with model number search\n- QR code on the product (if available)\n- Contact customer support\n\n**What to look for:**\n- Setup instructions\n- Troubleshooting guide\n- Maintenance tips\n- Warranty information`
      }
    }

    if (lowerQuery.includes("service") || lowerQuery.includes("repair")) {
      return `🛠️ **Service Options for your ${productInfo}:**\n\n**To get service:**\n1. **Check warranty status** first\n2. **Find authorized service centers**\n   - Visit manufacturer's website\n   - Use store locator with your model number\n3. **Prepare for service:**\n   - Model number: ${product.modelNumber}\n   - Serial number (from product label)\n   - Purchase receipt\n   - Description of the issue\n\n**Service types:**\n- In-warranty: Free repair/replacement\n- Out-of-warranty: Paid repair services\n- Home service: Available for large appliances\n\nWould you like help finding the nearest service center?`
    }

    return `I'm here to help with your ${productInfo}! Even though this product isn't registered, I can provide:\n\n🔧 **General Troubleshooting** - Common solutions for your product type\n📖 **Manual Assistance** - Help finding and using product documentation\n🛠️ **Service Guidance** - How to get professional help\n📋 **Registration Help** - Benefits of registering your product\n\n💡 **Pro tip:** Register your product for personalized support, warranty tracking, and exclusive updates!\n\nWhat specific help do you need with your ${product.productType}?`
  }

  const generatePersonalizedResponse = (query: string, product: RegisteredProduct): string => {
    const lowerQuery = query.toLowerCase()
    const productInfo = `${product.brand} ${product.productType} (${product.modelNumber})`

    if (lowerQuery.includes("error") || lowerQuery.includes("troubleshoot")) {
      return `I can help you troubleshoot your ${productInfo}. Since this is your registered product, I have access to your specific model information.\n\n**Quick troubleshooting steps for ${product.productType}:**\n1. Power cycle the device (unplug for 30 seconds)\n2. Check all connections and cables\n3. Ensure firmware is updated\n\n**Your product details:**\n- Purchase Date: ${new Date(product.purchaseDate).toLocaleDateString()}\n- Warranty: Valid until ${new Date(product.warrantyExpiry).toLocaleDateString()}\n- Serial Number: ${product.serialNumber}\n\nIf these steps don't resolve the issue, I can help you contact support or schedule a service appointment. What specific error are you experiencing?`
    }

    if (lowerQuery.includes("warranty")) {
      const warrantyStatus = new Date(product.warrantyExpiry) > new Date() ? "✅ Active" : "❌ Expired"
      const daysLeft = Math.ceil(
        (new Date(product.warrantyExpiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
      )

      return `**Warranty Information for your ${productInfo}:**\n\n- Status: ${warrantyStatus}\n- Expiry Date: ${new Date(product.warrantyExpiry).toLocaleDateString()}\n- Days Remaining: ${daysLeft > 0 ? daysLeft : 0} days\n- Purchase Date: ${new Date(product.purchaseDate).toLocaleDateString()}\n- Retailer: ${product.retailer}\n\n${daysLeft > 0 ? "Your warranty is still active! You're covered for repairs and replacements." : "Your warranty has expired, but I can still help with troubleshooting and paid service options."}`
    }

    if (lowerQuery.includes("manual") || lowerQuery.includes("guide")) {
      return `I can help you find the manual for your ${productInfo}. Based on your registered product, here's what I can provide:\n\n📖 **Available Resources:**\n- Digital user manual\n- Quick start guide\n- Troubleshooting guide\n- Video tutorials\n\nWould you like me to send you the digital manual link, or are you looking for specific information from the manual?`
    }

    if (lowerQuery.includes("service") || lowerQuery.includes("repair")) {
      const warrantyActive = new Date(product.warrantyExpiry) > new Date()
      return `**Service Options for your ${productInfo}:**\n\n${warrantyActive ? "✅ **Warranty Service Available**\n- Free repair/replacement\n- Authorized service centers\n- Home service available" : "🔧 **Paid Service Options**\n- Authorized repair centers\n- Home service available\n- Extended warranty options"}\n\n**Your Product Details:**\n- Serial Number: ${product.serialNumber}\n- Purchase Date: ${new Date(product.purchaseDate).toLocaleDateString()}\n\nWould you like me to help you schedule a service appointment or find the nearest service center?`
    }

    return `I'm here to help with your ${productInfo}! Since this is your registered product, I can provide personalized support including:\n\n🔧 **Troubleshooting** - Step-by-step problem solving\n📋 **Warranty Info** - Check coverage and claims\n📖 **Manuals & Guides** - Access product documentation\n🛠️ **Service Support** - Schedule repairs or maintenance\n\nWhat specific help do you need with your ${product.productType}?`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInput("")
    setIsLoading(true)

    setTimeout(() => {
      let response: string

      // Check if input looks like a model number
      const modelRegex = /^[A-Za-z0-9\-_\s]+$/
      const looksLikeModel = modelRegex.test(currentInput.trim()) && currentInput.trim().length >= 3

      if (chatState.awaitingModelNumber || (looksLikeModel && !chatState.selectedProduct)) {
        handleModelNumberInput(currentInput.trim())
        setIsLoading(false)
        return
      } else if (chatState.unregisteredProduct) {
        response = generateUnregisteredResponse(currentInput, chatState.unregisteredProduct)
      } else {
        // General help message
        const lowerQuery = currentInput.toLowerCase()
        if (lowerQuery.includes("model") || lowerQuery.includes("product") || lowerQuery.includes("help")) {
          setChatState((prev) => ({ ...prev, awaitingModelNumber: true }))
          response =
            "I'd be happy to help! Please share your product's brand and model number (e.g., 'Sony X90J-55', 'LG WM4000H', 'Samsung RF28R7351SG') so I can provide specific support for your product."
        } else {
          response =
            "I'm here to help with your products! For the best support experience:\n\n📦 **Share your product details:** Brand and model number (e.g., 'Sony X90J-55')\n💬 **Describe your issue:** What problem are you experiencing?\n🔍 **Ask questions:** About features, troubleshooting, or manuals\n\nWhat product do you need help with?"
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div id="chat-assistant" className="space-y-6">
      {/* Unregistered Product Status */}
      {chatState.unregisteredProduct && (
        <Card id="product-status-card" className="bg-blue-50 border-blue-200">
          <CardContent id="product-status-content" className="p-4">
            <div id="product-status-info" className="flex items-center gap-3">
              <Package className="w-5 h-5 text-blue-600" />
              <div id="product-status-text">
                <p id="product-status-title" className="font-medium text-blue-800">
                  Product Support Mode
                </p>
                <p id="product-status-details" className="text-sm text-blue-600">
                  Helping with: {chatState.unregisteredProduct.brand} {chatState.unregisteredProduct.productType} (
                  {chatState.unregisteredProduct.modelNumber})
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat Messages */}
      <Card id="chat-card" className="min-h-[500px] flex flex-col">
        <CardContent id="chat-content" className="p-4 flex flex-col flex-1">
          <div id="messages-container" className="space-y-4 flex-1 overflow-y-auto mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                id={`message-${message.id}`}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <Avatar id={`avatar-assistant-${message.id}`} className="w-8 h-8 bg-blue-600 flex-shrink-0">
                    <AvatarFallback className="bg-blue-600 text-white">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  id={`message-content-${message.id}`}
                  className={`max-w-[80%] ${message.role === "user" ? "order-first" : ""}`}
                >
                  <div
                    id={`message-bubble-${message.id}`}
                    className={`rounded-lg p-3 text-sm whitespace-pre-line ${
                      message.role === "user" ? "bg-blue-600 text-white ml-auto" : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {message.content}
                  </div>

                  <div id={`message-time-${message.id}`} className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                {message.role === "user" && (
                  <Avatar id={`avatar-user-${message.id}`} className="w-8 h-8 bg-gray-600 flex-shrink-0">
                    <AvatarFallback className="bg-gray-600 text-white">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div id="loading-message" className="flex gap-3 justify-start">
                <Avatar id="loading-avatar" className="w-8 h-8 bg-blue-600 flex-shrink-0">
                  <AvatarFallback className="bg-blue-600 text-white">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div id="loading-bubble" className="bg-slate-100 rounded-lg p-3 text-sm text-slate-800">
                  <div id="loading-content" className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Form - moved to bottom */}
          <form id="chat-form" onSubmit={handleSubmit} className="flex gap-2 border-t pt-4 mt-auto">
            <Input
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                chatState.awaitingModelNumber
                  ? "Enter your product brand and model (e.g., Sony X90J-55)"
                  : "Ask me anything about your products..."
              }
              className="flex-1"
              disabled={isLoading}
            />
            <Button id="chat-submit" type="submit" disabled={!input.trim() || isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
