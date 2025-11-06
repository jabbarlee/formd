import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Type,
  Mail,
  Hash,
  Phone,
  CheckSquare,
  Star,
  Calendar,
  Upload,
  AlignLeft,
  ChevronDown,
  Settings,
  Eye,
  Save,
  GripVertical,
  Trash2,
} from "lucide-react";

export default function FormBuilderPage() {
  const questionTypes = [
    { icon: Type, label: "Short Text", type: "short_text" },
    { icon: AlignLeft, label: "Long Text", type: "long_text" },
    { icon: Mail, label: "Email", type: "email" },
    { icon: Hash, label: "Number", type: "number" },
    { icon: Phone, label: "Phone", type: "phone" },
    { icon: CheckSquare, label: "Multiple Choice", type: "multiple_choice" },
    { icon: CheckSquare, label: "Checkboxes", type: "checkboxes" },
    { icon: ChevronDown, label: "Dropdown", type: "dropdown" },
    { icon: Star, label: "Rating", type: "rating" },
    { icon: Calendar, label: "Date", type: "date" },
    { icon: Upload, label: "File Upload", type: "file_upload" },
  ];

  return (
    <div className="space-y-6">
      <div>
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
        <div className="flex items-center justify-between mt-4">
          <h1 className="text-3xl font-bold">Form Builder</h1>
          <div className="flex gap-2">
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Question Types</CardTitle>
              <CardDescription>Drag to add to form</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
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
            </CardContent>
          </Card>
        </div>

        <div className="col-span-6">
          <Card>
            <CardHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="formTitle">Form Title</Label>
                  <Input
                    id="formTitle"
                    placeholder="Enter form title"
                    defaultValue="Customer Feedback Survey"
                    className="text-2xl font-bold h-auto py-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="formDescription">Description</Label>
                  <Textarea
                    id="formDescription"
                    placeholder="Enter form description"
                    defaultValue="We value your feedback!"
                    rows={2}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-start gap-2">
                    <Button variant="ghost" size="icon" className="cursor-move">
                      <GripVertical className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Question text"
                        defaultValue="How would you rate our service?"
                        className="font-medium"
                      />
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Star className="h-4 w-4" />
                        <span>Rating</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              <Button variant="outline" className="w-full" size="lg">
                + Add Question
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Properties</CardTitle>
              <CardDescription>Configure question settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="settings">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                  <TabsTrigger value="logic">Logic</TabsTrigger>
                </TabsList>
                <TabsContent value="settings" className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="required">Required</Label>
                    <Switch id="required" />
                  </div>
                  <Separator />
                  <Accordion type="single" collapsible>
                    <AccordionItem value="validation">
                      <AccordionTrigger>Validation Rules</AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="minLength">Min Length</Label>
                          <Input id="minLength" type="number" placeholder="0" />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </TabsContent>
                <TabsContent value="logic" className="space-y-4 mt-4">
                  <p className="text-sm text-muted-foreground">
                    Add conditional logic
                  </p>
                  <Button variant="outline" className="w-full" size="sm">
                    + Add Logic Rule
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
