"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Link2, Check, X } from "lucide-react"

const mockIntegrations = [
  {
    id: "zapier",
    name: "Zapier",
    description: "Automate workflows and connect with 5000+ apps",
    icon: "Z",
    connected: true,
  },
  {
    id: "slack",
    name: "Slack",
    description: "Get notifications in your Slack channels",
    icon: "S",
    connected: true,
  },
  {
    id: "google-sheets",
    name: "Google Sheets",
    description: "Sync responses directly to Google Sheets",
    icon: "G",
    connected: false,
  },
  {
    id: "webhook",
    name: "Webhooks",
    description: "Send form responses to any URL",
    icon: "W",
    connected: false,
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    description: "Add respondents to your Mailchimp lists",
    icon: "M",
    connected: false,
  },
]

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground">Connect FormAI with your favorite tools</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockIntegrations.map((integration) => (
          <Card key={integration.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    {integration.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <CardDescription className="mt-1">{integration.description}</CardDescription>
                  </div>
                </div>
                {integration.connected ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="outline">Not Connected</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {integration.connected ? (
                <div className="space-y-2">
                  <Button variant="outline" className="w-full" size="sm">
                    <Link2 className="mr-2 h-4 w-4" />
                    Manage
                  </Button>
                  <Button variant="ghost" className="w-full" size="sm">
                    <X className="mr-2 h-4 w-4" />
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button className="w-full" size="sm">
                  <Link2 className="mr-2 h-4 w-4" />
                  Connect
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
