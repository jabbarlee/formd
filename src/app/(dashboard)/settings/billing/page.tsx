"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Download, ArrowRight } from "lucide-react"

const mockBillingHistory = [
  {
    id: "1",
    date: "2024-11-01",
    amount: "$29.00",
    plan: "Pro",
    status: "Paid",
  },
  {
    id: "2",
    date: "2024-10-01",
    amount: "$29.00",
    plan: "Pro",
    status: "Paid",
  },
  {
    id: "3",
    date: "2024-09-01",
    amount: "$29.00",
    plan: "Pro",
    status: "Paid",
  },
]

export default function BillingSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription and billing information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your active subscription plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">Pro Plan</div>
              <p className="text-sm text-muted-foreground">$29/month</p>
            </div>
            <Badge>Active</Badge>
          </div>
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Forms</span>
              <span>Unlimited</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Responses</span>
              <span>Unlimited</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Storage</span>
              <span>50 GB</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Team Members</span>
              <span>Up to 10</span>
            </div>
          </div>
          <Separator />
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">Change Plan</Button>
            <Button variant="destructive" className="flex-1">Cancel Subscription</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Manage your payment methods</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <CreditCard className="mr-2 h-4 w-4" />
              Add Payment Method
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">•••• •••• •••• 4242</div>
                <div className="text-sm text-muted-foreground">Expires 12/25</div>
              </div>
            </div>
            <Button variant="ghost" size="sm">Edit</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Usage</CardTitle>
              <CardDescription>Current month usage statistics</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Responses</span>
              <span>847 / Unlimited</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Storage</span>
              <span>12.5 GB / 50 GB</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Team Members</span>
              <span>3 / 10</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View and download your invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockBillingHistory.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                  <TableCell>{invoice.plan}</TableCell>
                  <TableCell>{invoice.amount}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{invoice.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
