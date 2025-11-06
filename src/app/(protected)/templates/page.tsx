"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Search, FileText } from "lucide-react"
import { mockTemplates } from "@/lib/mock-data"

const categories = [
  "All",
  "Customer Feedback",
  "HR",
  "Events",
  "Product",
  "Education",
  "Healthcare",
  "Marketing",
]

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filteredTemplates =
    selectedCategory === "All"
      ? mockTemplates
      : mockTemplates.filter((t) => t.category === selectedCategory)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground">Choose from 200+ professionally designed templates</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create from Template
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search templates..." className="pl-8" />
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          {categories.map((category) => (
            <TabsTrigger
              key={category}
              value={category.toLowerCase()}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory.toLowerCase()} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <Dialog key={template.id}>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer transition-colors hover:bg-accent">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{template.title}</CardTitle>
                          <CardDescription className="mt-1">{template.description}</CardDescription>
                        </div>
                        <Badge variant="secondary">{template.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{template.questions} questions</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{template.title}</DialogTitle>
                    <DialogDescription>{template.description}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge>{template.category}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {template.questions} questions
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1">Use Template</Button>
                      <Button variant="outline">Preview</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
