import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, CreditCard, Download } from "lucide-react";
import { BillingHeader } from "@/components/layout/headers";

export default function BillingSettingsPage() {
  const billingHistory = [
    { id: "INV-001", date: "Jan 1, 2024", amount: "$29.00", status: "paid" },
    { id: "INV-002", date: "Dec 1, 2023", amount: "$29.00", status: "paid" },
    { id: "INV-003", date: "Nov 1, 2023", amount: "$29.00", status: "paid" },
    { id: "INV-004", date: "Oct 1, 2023", amount: "$29.00", status: "paid" },
    { id: "INV-005", date: "Sep 1, 2023", amount: "$29.00", status: "paid" },
  ];

  return (
    <div>
      <BillingHeader />

      <div className="space-y-6 p-6">
        {/* Current Plan */}
        <Card className="border-l-4 border-l-rose-500 bg-gradient-to-br from-rose-50/30 to-background dark:from-rose-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-rose-600" />
              Current Plan
            </CardTitle>
            <CardDescription>You are currently on the Pro plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  Pro Plan
                  <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400">
                    Active
                  </Badge>
                </h3>
                <p className="text-muted-foreground font-medium">
                  $29/month • Billed monthly
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Next billing date: February 1, 2024
                </p>
              </div>
              <Button
                variant="outline"
                className="hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 dark:hover:bg-rose-950"
              >
                Change Plan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Available Plans */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Available Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free Plan */}
            <Card className="hover:shadow-lg transition-all hover:scale-[1.02] duration-200">
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>Perfect for trying out FormAI</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-blue-600">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {[
                    "Up to 3 forms",
                    "100 responses/month",
                    "Basic templates",
                    "Email notifications",
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full">
                  Current Plan
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-violet-600 border-2 relative shadow-lg shadow-violet-100 dark:shadow-violet-950/50">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-md">
                Current Plan
              </Badge>
              <CardHeader>
                <CardTitle className="text-violet-600">Pro</CardTitle>
                <CardDescription>For growing businesses</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-violet-600">
                    $29
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {[
                    "Unlimited forms",
                    "5,000 responses/month",
                    "AI form generation",
                    "Custom branding",
                    "Advanced analytics",
                    "Priority support",
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 shadow-sm"
                  disabled
                >
                  Current Plan
                </Button>
              </CardContent>
            </Card>

            {/* Business Plan */}
            <Card className="hover:shadow-lg transition-all hover:scale-[1.02] duration-200 border-amber-200 dark:border-amber-900">
              <CardHeader>
                <CardTitle className="text-amber-600">Business</CardTitle>
                <CardDescription>For larger organizations</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-amber-600">$99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {[
                    "Everything in Pro",
                    "25,000 responses/month",
                    "Team collaboration",
                    "Advanced integrations",
                    "Custom domain",
                    "Dedicated support",
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  className="w-full hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 dark:hover:bg-amber-950"
                >
                  Upgrade
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Manage your payment information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-16 bg-muted rounded flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">•••• •••• •••• 4242</p>
                  <p className="text-sm text-muted-foreground">
                    Expires 12/2025
                  </p>
                </div>
              </div>
              <Button variant="outline">Update</Button>
            </div>
          </CardContent>
        </Card>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>
              View and download your past invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billingHistory.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell>{invoice.amount}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{invoice.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
