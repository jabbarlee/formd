"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Share2, Facebook, Twitter, Linkedin } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function ThankYouPage({ params }: { params: { id: string } }) {
  const [countdown, setCountdown] = useState(5)
  const router = useRouter()

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      // Redirect after countdown
      // router.push('/')
    }
  }, [countdown, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl">Thank You!</CardTitle>
            <CardDescription className="mt-2">
              Your response has been submitted successfully.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2 text-center">
            <p className="text-sm text-muted-foreground">
              We appreciate your time and feedback. Your responses help us improve our services.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Redirecting in {countdown} seconds...</span>
            </div>
            <Progress value={(5 - countdown) * 20} className="h-2" />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-center">Share this form</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="icon">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button variant="outline" className="w-full">
            Return to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
