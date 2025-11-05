"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Smartphone, Monitor, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function FormPreviewPage({ params }: { params: { id: string } }) {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/forms/${params.id}/builder`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Preview Form</h1>
            <p className="text-muted-foreground">See how your form looks to respondents</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "desktop" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("desktop")}
          >
            <Monitor className="mr-2 h-4 w-4" />
            Desktop
          </Button>
          <Button
            variant={viewMode === "mobile" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("mobile")}
          >
            <Smartphone className="mr-2 h-4 w-4" />
            Mobile
          </Button>
        </div>
      </div>

      <div className="flex justify-center">
        <div
          className={`w-full transition-all ${
            viewMode === "mobile" ? "max-w-md" : "max-w-2xl"
          }`}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Customer Satisfaction Survey</CardTitle>
              <p className="text-muted-foreground">Help us improve by sharing your feedback</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">What is your name? *</Label>
                <Input id="name" placeholder="Enter your name" />
              </div>

              <div className="space-y-3">
                <Label>How did you hear about us?</Label>
                <RadioGroup defaultValue="social">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="social" id="social" />
                    <Label htmlFor="social" className="font-normal cursor-pointer">
                      Social Media
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="search" id="search" />
                    <Label htmlFor="search" className="font-normal cursor-pointer">
                      Search Engine
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="friend" id="friend" />
                    <Label htmlFor="friend" className="font-normal cursor-pointer">
                      Friend/Family
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ad" id="ad" />
                    <Label htmlFor="ad" className="font-normal cursor-pointer">
                      Advertisement
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>What features interest you? (Select all that apply)</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="feature1" />
                    <Label htmlFor="feature1" className="font-normal cursor-pointer">
                      Feature A
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="feature2" />
                    <Label htmlFor="feature2" className="font-normal cursor-pointer">
                      Feature B
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="feature3" />
                    <Label htmlFor="feature3" className="font-normal cursor-pointer">
                      Feature C
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating">Rate your experience (1-5)</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Button
                      key={star}
                      variant="outline"
                      size="icon"
                      className="h-10 w-10"
                    >
                      ★
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback">Please share your feedback</Label>
                <Input id="feedback" placeholder="Enter your feedback..." />
              </div>

              <Button className="w-full">Submit</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
