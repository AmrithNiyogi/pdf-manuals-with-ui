"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, Package } from "lucide-react"
import { productTypes } from "../lib/sample-data"

interface RegistrationData {
  productType: string
  modelNumber: string
  serialNumber: string
  purchaseDate: string
  retailer: string
  additionalNotes: string
}

export function ProductRegistration() {
  const [formData, setFormData] = useState<RegistrationData>({
    productType: "",
    modelNumber: "",
    serialNumber: "",
    purchaseDate: "",
    retailer: "",
    additionalNotes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (field: keyof RegistrationData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.productType || !formData.modelNumber) return

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 2000)
  }

  const resetForm = () => {
    setFormData({
      productType: "",
      modelNumber: "",
      serialNumber: "",
      purchaseDate: "",
      retailer: "",
      additionalNotes: "",
    })
    setIsSubmitted(false)
  }

  if (isSubmitted) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Registration</h2>
          <p className="text-gray-600">Register your products for warranty and support</p>
        </div>

        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Registration Successful!</h3>
            <p className="text-gray-600 mb-6">
              Your {formData.productType} (Model: {formData.modelNumber}) has been successfully registered.
            </p>
            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <p>✓ Warranty protection activated</p>
              <p>✓ Personalized AI support enabled</p>
              <p>✓ Product support enabled</p>
              <p>✓ Update notifications enabled</p>
            </div>
            <Button onClick={resetForm} className="w-full">
              Register Another Product
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Registration</h2>
        <p className="text-gray-600">Register your products for warranty and personalized AI support</p>
      </div>

      {/* Registration Form */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Register Your Product
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Required Fields */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="productType">
                  Product Type <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.productType} onValueChange={(value) => handleInputChange("productType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product type" />
                  </SelectTrigger>
                  <SelectContent>
                    {productTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="modelNumber">
                  Model Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="modelNumber"
                  value={formData.modelNumber}
                  onChange={(e) => handleInputChange("modelNumber", e.target.value)}
                  placeholder="e.g., XYZ-55-2024"
                  required
                />
              </div>
            </div>

            {/* Optional Fields */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="serialNumber">Serial Number</Label>
                <Input
                  id="serialNumber"
                  value={formData.serialNumber}
                  onChange={(e) => handleInputChange("serialNumber", e.target.value)}
                  placeholder="e.g., SN123456789"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => handleInputChange("purchaseDate", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="retailer">Retailer/Store</Label>
              <Input
                id="retailer"
                value={formData.retailer}
                onChange={(e) => handleInputChange("retailer", e.target.value)}
                placeholder="e.g., Best Buy, Amazon, Local Store"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Additional Notes</Label>
              <Textarea
                id="additionalNotes"
                value={formData.additionalNotes}
                onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
                placeholder="Any additional information about your product..."
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={!formData.productType || !formData.modelNumber || isSubmitting}
            >
              {isSubmitting ? "Registering..." : "Register Product"}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              <span className="text-red-500">*</span> Required fields
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
