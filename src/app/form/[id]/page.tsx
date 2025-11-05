"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export default function PublicFormPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Customer Satisfaction Survey</h1>
          <p className="text-muted-foreground">Help us improve by sharing your feedback</p>
        </div>

        <div className="mb-6">
          <Progress value={0} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">Question 1 of 5</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">What is your name? *</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Enter your name" />
            </div>
            <Button className="w-full" asChild>
              <Link href={`/form/${params.id}/thank-you`}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">How did you hear about us?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <Button className="w-full" asChild>
              <Link href={`/form/${params.id}/thank-you`}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">What features interest you? (Select all that apply)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
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
            <Button className="w-full" asChild>
              <Link href={`/form/${params.id}/thank-you`}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Rate your experience (1-5)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 text-2xl"
                >
                  ★
                </Button>
              ))}
            </div>
            <Button className="w-full" asChild>
              <Link href={`/form/${params.id}/thank-you`}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Please share your feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback</Label>
              <Textarea
                id="feedback"
                placeholder="Enter your feedback..."
                className="min-h-[100px]"
              />
            </div>
            <Button className="w-full" asChild>
              <Link href={`/form/${params.id}/thank-you`}>
                Submit
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
