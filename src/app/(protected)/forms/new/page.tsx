"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { FileText, Sparkles, FolderOpen, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function NewFormPage() {
  const router = useRouter()
  const [selectedOption, setSelectedOption] = useState("blank")

  const handleCreate = () => {
    // Navigate to form builder with a new form ID
    router.push("/dashboard/forms/1/builder")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Form</h1>
        <p className="text-muted-foreground">Choose how you'd like to start</p>
      </div>

      <Tabs defaultValue="start" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="start">Start Options</TabsTrigger>
          <TabsTrigger value="template">Use Template</TabsTrigger>
          <TabsTrigger value="ai">AI Generation</TabsTrigger>
        </TabsList>

        <TabsContent value="start" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="cursor-pointer transition-colors hover:bg-accent" onClick={() => setSelectedOption("blank")}>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5" />
                  <CardTitle className="text-lg">Start from Scratch</CardTitle>
                </div>
                <CardDescription>Create a blank form and build it from the ground up</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                  <RadioGroupItem value="blank" id="blank" />
                  <Label htmlFor="blank" className="sr-only">Blank</Label>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card className="cursor-pointer transition-colors hover:bg-accent" onClick={() => setSelectedOption("template")}>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <FolderOpen className="h-5 w-5" />
                  <CardTitle className="text-lg">Use Template</CardTitle>
                </div>
                <CardDescription>Choose from 200+ professionally designed templates</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                  <RadioGroupItem value="template" id="template" />
                  <Label htmlFor="template" className="sr-only">Template</Label>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card className="cursor-pointer transition-colors hover:bg-accent" onClick={() => setSelectedOption("ai")}>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5" />
                  <CardTitle className="text-lg">AI Generation</CardTitle>
                </div>
                <CardDescription>Describe your form and AI will generate it for you</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                  <RadioGroupItem value="ai" id="ai" />
                  <Label htmlFor="ai" className="sr-only">AI</Label>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="template" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select a Template</CardTitle>
              <CardDescription>Browse through our template library</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild>
                <a href="/dashboard/templates">Browse Templates</a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Form Generator</CardTitle>
              <CardDescription>Describe what you need and AI will create your form</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ai-prompt">Describe your form</Label>
                <Input
                  id="ai-prompt"
                  placeholder="e.g., Create a customer satisfaction survey for a coffee shop with NPS score and feedback sections"
                />
              </div>
              <Button onClick={handleCreate}>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Form
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleCreate}>
          Create Form
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
