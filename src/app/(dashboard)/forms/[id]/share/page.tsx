"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, QrCode, Facebook, Twitter, Linkedin, Mail, ArrowLeft } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

export default function FormSharePage({ params }: { params: { id: string } }) {
  const [copied, setCopied] = useState(false)
  const formUrl = `https://formai.com/form/${params.id}`

  const handleCopy = () => {
    navigator.clipboard.writeText(formUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/forms/${params.id}/builder`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Share Form</h1>
          <p className="text-muted-foreground">Share your form with respondents</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Share Link</CardTitle>
            <CardDescription>Copy and share this link with your respondents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={formUrl} readOnly className="flex-1" />
              <Button onClick={handleCopy} variant="outline" size="icon">
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Facebook className="mr-2 h-4 w-4" />
                Facebook
              </Button>
              <Button variant="outline" size="sm">
                <Twitter className="mr-2 h-4 w-4" />
                Twitter
              </Button>
              <Button variant="outline" size="sm">
                <Linkedin className="mr-2 h-4 w-4" />
                LinkedIn
              </Button>
              <Button variant="outline" size="sm">
                <Mail className="mr-2 h-4 w-4" />
                Email
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>QR Code</CardTitle>
            <CardDescription>Scan to open the form</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
              <QrCode className="h-32 w-32 text-muted-foreground" />
            </div>
            <Button className="w-full mt-4" variant="outline">
              Download QR Code
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Embed Code</CardTitle>
          <CardDescription>Embed this form on your website</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="iframe">
            <TabsList>
              <TabsTrigger value="iframe">iframe</TabsTrigger>
              <TabsTrigger value="script">Script</TabsTrigger>
            </TabsList>
            <TabsContent value="iframe" className="space-y-2">
              <Label>HTML Code</Label>
              <Input
                value={`<iframe src="${formUrl}" width="100%" height="600"></iframe>`}
                readOnly
              />
            </TabsContent>
            <TabsContent value="script" className="space-y-2">
              <Label>JavaScript Code</Label>
              <Input
                value={`<script src="${formUrl}/embed.js"></script>`}
                readOnly
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Access Settings</CardTitle>
          <CardDescription>Control who can access your form</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Public Access</Label>
              <p className="text-sm text-muted-foreground">Anyone with the link can access</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Email</Label>
              <p className="text-sm text-muted-foreground">Respondents must provide email</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Limit Responses</Label>
              <p className="text-sm text-muted-foreground">Set maximum number of responses</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Collect Email Addresses</Label>
              <p className="text-sm text-muted-foreground">Store respondent email addresses</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
