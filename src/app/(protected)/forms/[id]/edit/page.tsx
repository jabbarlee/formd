import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Plus,
  Save,
  Eye,
  Settings,
  Sparkles,
  Type,
  Hash,
  Mail,
  Phone,
  CheckSquare,
  List,
  Star,
  Calendar,
  Upload,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FormBuilderPage() {
  const questionTypes = [
    { icon: Type, label: "Short Text", type: "short_text" },
    { icon: Type, label: "Long Text", type: "long_text" },
    { icon: Mail, label: "Email", type: "email" },
    { icon: Hash, label: "Number", type: "number" },
    { icon: Phone, label: "Phone", type: "phone" },
    { icon: CheckSquare, label: "Multiple Choice", type: "multiple_choice" },
    { icon: CheckSquare, label: "Checkboxes", type: "checkboxes" },
    { icon: List, label: "Dropdown", type: "dropdown" },
    { icon: Star, label: "Rating", type: "star_rating" },
    { icon: Calendar, label: "Date", type: "date" },
    { icon: Upload, label: "File Upload", type: "file_upload" },
  ];

  return (
    <ProtectedLayout>
      <div className="space-y-4">
        {/* Top Toolbar */}
        <div className="flex items-center justify-between">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/forms">Forms</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Customer Feedback Survey</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button size="sm" variant="outline">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Builder Layout */}
        <div className="grid grid-cols-12 gap-4 min-h-[calc(100vh-12rem)]">
          {/* Left Sidebar - Question Palette */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle className="text-lg">Add Questions</CardTitle>
              <CardDescription>Drag or click to add</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="basic" className="flex-1">
                    Basic
                  </TabsTrigger>
                  <TabsTrigger value="advanced" className="flex-1">
                    Advanced
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="basic" className="space-y-2 mt-4">
                  {questionTypes.map((type, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      className="w-full justify-start"
                      size="sm"
                    >
                      <type.icon className="h-4 w-4 mr-2" />
                      {type.label}
                    </Button>
                  ))}
                </TabsContent>
                <TabsContent value="advanced" className="space-y-2 mt-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    size="sm"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI Generated
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Center Canvas */}
          <div className="col-span-6 space-y-4">
            <Card>
              <CardHeader>
                <Input
                  placeholder="Form Title"
                  defaultValue="Customer Feedback Survey"
                  className="text-2xl font-bold border-none px-0 h-auto"
                />
                <Textarea
                  placeholder="Form description..."
                  defaultValue="Help us improve our service by sharing your feedback"
                  className="border-none px-0 resize-none"
                  rows={2}
                />
              </CardHeader>
            </Card>

            {/* Sample Questions */}
            <Card className="border-indigo-200 bg-indigo-50/50">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Input
                      defaultValue="What is your name?"
                      className="font-medium mb-2"
                    />
                    <Input
                      placeholder="Question description (optional)"
                      className="text-sm text-muted-foreground"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Input placeholder="Short answer text" disabled />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <Input
                  defaultValue="How satisfied are you with our service?"
                  className="font-medium mb-2"
                />
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  "Very Satisfied",
                  "Satisfied",
                  "Neutral",
                  "Dissatisfied",
                  "Very Dissatisfied",
                ].map((option, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full border-2" />
                    <Input defaultValue={option} className="h-8" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Button variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>

          {/* Right Sidebar - Properties Panel */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle className="text-lg">Question Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="settings" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="settings" className="flex-1">
                    Settings
                  </TabsTrigger>
                  <TabsTrigger value="logic" className="flex-1">
                    Logic
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="settings" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="question-type">Question Type</Label>
                    <Input id="question-type" value="Short Text" disabled />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <Label htmlFor="required">Required</Label>
                    <Switch id="required" />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="description">Show Description</Label>
                    <Switch id="description" defaultChecked />
                  </div>

                  <Separator />

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="validation">
                      <AccordionTrigger>Validation Rules</AccordionTrigger>
                      <AccordionContent className="space-y-2">
                        <div className="space-y-2">
                          <Label>Min Length</Label>
                          <Input type="number" placeholder="0" />
                        </div>
                        <div className="space-y-2">
                          <Label>Max Length</Label>
                          <Input type="number" placeholder="100" />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </TabsContent>
                <TabsContent value="logic" className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    Add conditional logic to show/hide questions based on
                    previous answers
                  </p>
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Logic Rule
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedLayout>
  );
}
