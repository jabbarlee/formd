import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, FileText, TrendingUp, Users, Clock } from "lucide-react"
import Link from "next/link"
import { mockForms } from "@/lib/mock-data"

export default function DashboardPage() {
  const totalForms = mockForms.length
  const publishedForms = mockForms.filter((f) => f.status === "published").length
  const totalResponses = mockForms.reduce((sum, f) => sum + f.responses, 0)
  const recentForms = mockForms.slice(0, 5)

  const stats = [
    {
      title: "Total Forms",
      value: totalForms,
      icon: FileText,
      description: "All forms",
    },
    {
      title: "Published",
      value: publishedForms,
      icon: TrendingUp,
      description: "Active forms",
    },
    {
      title: "Total Responses",
      value: totalResponses,
      icon: Users,
      description: "All time",
    },
    {
      title: "Avg. Response Time",
      value: "3m 42s",
      icon: Clock,
      description: "Last 30 days",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your forms.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/forms/new">
            <Plus className="mr-2 h-4 w-4" />
            New Form
          </Link>
        </Button>
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
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Forms</CardTitle>
          <CardDescription>Your most recently updated forms</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Responses</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentForms.map((form) => (
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
                  <TableCell>
                    {new Date(form.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/forms/${form.id}/builder`}>Edit</Link>
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
