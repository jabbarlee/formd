import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, TrendingDown, FileText, Users } from "lucide-react"
import { mockForms } from "@/lib/mock-data"
import Link from "next/link"

export default function AnalyticsPage() {
  const totalResponses = mockForms.reduce((sum, f) => sum + f.responses, 0)
  const totalForms = mockForms.length

  const stats = [
    {
      title: "Total Responses",
      value: totalResponses.toLocaleString(),
      change: "+12%",
      trend: "up",
      icon: Users,
    },
    {
      title: "Active Forms",
      value: totalForms,
      change: "+3",
      trend: "up",
      icon: FileText,
    },
    {
      title: "Avg. Completion Rate",
      value: "78%",
      change: "+3%",
      trend: "up",
      icon: TrendingUp,
    },
    {
      title: "Bounce Rate",
      value: "22%",
      change: "-5%",
      trend: "down",
      icon: TrendingDown,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Overview of all your forms and responses</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className={`flex items-center gap-1 text-xs mt-1 ${
                stat.trend === "up" ? "text-green-600" : "text-red-600"
              }`}>
                {stat.trend === "up" ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {stat.change}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Performance</CardTitle>
          <CardDescription>Response statistics for each form</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Form Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Responses</TableHead>
                <TableHead>Completion Rate</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockForms.map((form) => (
                <TableRow key={form.id}>
                  <TableCell className="font-medium">{form.title}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        form.status === "published"
                          ? "default"
                          : form.status === "draft"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {form.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{form.responses}</TableCell>
                  <TableCell>78%</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/forms/${form.id}/analytics`}>View</Link>
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
