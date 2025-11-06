"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Save,
  Eye,
  Share2,
  Plus,
  GripVertical,
  Trash2,
  Settings,
  Sparkles,
} from "lucide-react"

const questionTypes = [
  { value: "short-text", label: "Short Text" },
  { value: "long-text", label: "Long Text" },
  { value: "multiple-choice", label: "Multiple Choice" },
  { value: "checkboxes", label: "Checkboxes" },
  { value: "dropdown", label: "Dropdown" },
  { value: "rating", label: "Rating" },
  { value: "date", label: "Date" },
  { value: "file-upload", label: "File Upload" },
]

export default function FormBuilderPage({ params }: { params: { id: string } }) {
  const [questions, setQuestions] = useState([
    { id: "1", title: "What is your name?", type: "short-text", required: true },
    { id: "2", title: "How did you hear about us?", type: "multiple-choice", required: false },
  ])

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      {/* Left Sidebar - Questions List */}
      <div className="w-64 border-r bg-muted/50 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Questions</h2>
          <Badge variant="secondary">{questions.length}</Badge>
        </div>
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="space-y-2">
            {questions.map((question, index) => (
              <Card
                key={question.id}
                className="cursor-pointer transition-colors hover:bg-accent"
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <GripVertical className="mt-1 h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{question.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {question.type.replace("-", " ")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" className="w-full" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </div>
        </ScrollArea>
      </div>

      {/* Center - Editor */}
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-3xl p-6">
          <div className="mb-6 space-y-2">
            <Input
              placeholder="Form Title"
              className="text-2xl font-bold border-0 focus-visible:ring-0"
              defaultValue="Customer Satisfaction Survey"
            />
            <Textarea
              placeholder="Form Description (optional)"
              className="min-h-[60px] resize-none border-0 focus-visible:ring-0"
              defaultValue="Help us improve by sharing your feedback"
            />
          </div>

          <div className="space-y-4">
            {questions.map((question) => (
              <Card key={question.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Question title"
                        defaultValue={question.title}
                        className="text-base font-medium"
                      />
                      <Select defaultValue={question.type}>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {questionTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {question.type === "multiple-choice" && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input placeholder="Option 1" defaultValue="Social Media" />
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input placeholder="Option 2" defaultValue="Search Engine" />
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Option
                      </Button>
                    </div>
                  )}
                  {question.type === "short-text" && (
                    <Input placeholder="Enter your answer..." disabled />
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch id={`required-${question.id}`} defaultChecked={question.required} />
                      <Label htmlFor={`required-${question.id}`}>Required</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Settings */}
      <div className="w-80 border-l bg-muted/50 p-4">
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="ai">AI Assistant</TabsTrigger>
          </TabsList>
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Question Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Question Type</Label>
                  <Select defaultValue="short-text">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {questionTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Required</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Allow Multiple</Label>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Logic & Branching</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Build Logic
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="ai" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Ask AI to generate questions, optimize text, or get suggestions..."
                  className="min-h-[100px]"
                />
                <Button className="w-full">Generate</Button>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Suggestions</p>
                  <div className="space-y-1">
                    <Button variant="outline" size="sm" className="w-full justify-start text-left">
                      Add follow-up question
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start text-left">
                      Optimize this question
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Header Actions - will be in dashboard layout header */}
    </div>
  )
}
