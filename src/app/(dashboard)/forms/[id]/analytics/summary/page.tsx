"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, TrendingUp, Download, Sparkles } from "lucide-react"
import Link from "next/link"

export default function AISummaryPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/forms/${params.id}/analytics`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">AI Summary</h1>
              <p className="text-muted-foreground">AI-generated insights from your responses</p>
            </div>
          </div>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Summary
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Survey Summary: Customer Satisfaction Q4 2024</CardTitle>
          <CardDescription>
            <div className="flex items-center gap-4 mt-2">
              <span>Total Responses: 847</span>
              <span>•</span>
              <span>Completion Rate: 78%</span>
              <span>•</span>
              <span>Avg. Time: 3m 42s</span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Key Findings</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Satisfaction</span>
                  <Badge variant="default" className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    4.2/5.0 (+0.3 from Q3)
                  </Badge>
                </div>
                <Progress value={84} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  68% rated 4-5 stars. Primary driver: Improved customer service.
                </p>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Areas of Concern</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>32% mentioned "slow checkout process"</li>
                  <li>28% requested "more payment options"</li>
                  <li>Checkout friction may be impacting conversions</li>
                </ul>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Positive Highlights</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Product quality rated 4.6/5.0</li>
                  <li>87% would recommend to friends</li>
                  <li>Mobile experience praised by 73%</li>
                </ul>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3">Sentiment Analysis</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">61%</div>
                  <p className="text-sm text-muted-foreground">Positive</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-gray-600">28%</div>
                  <p className="text-sm text-muted-foreground">Neutral</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-red-600">11%</div>
                  <p className="text-sm text-muted-foreground">Negative</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3">Recommended Actions</h3>
            <div className="space-y-3">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <Badge variant="destructive" className="mt-1">URGENT</Badge>
                    <div>
                      <p className="font-medium">Optimize checkout flow</p>
                      <p className="text-sm text-muted-foreground">
                        Impacts 32% of users. Consider streamlining the payment process.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-1">MONITOR</Badge>
                    <div>
                      <p className="font-medium">Track recommendation rate monthly</p>
                      <p className="text-sm text-muted-foreground">
                        Currently at 87%, maintain this positive trend.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">CONSIDER</Badge>
                    <div>
                      <p className="font-medium">Add Apple Pay/Google Pay options</p>
                      <p className="text-sm text-muted-foreground">
                        Addresses 28% of requests for more payment options.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <Badge variant="default" className="mt-1">MAINTAIN</Badge>
                    <div>
                      <p className="font-medium">Current product quality standards</p>
                      <p className="text-sm text-muted-foreground">
                        High satisfaction with product quality (4.6/5.0).
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
