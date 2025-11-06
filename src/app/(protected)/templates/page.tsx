import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Sparkles,
  Users,
  Briefcase,
  Heart,
  GraduationCap,
  ShoppingCart,
  Star,
  TrendingUp,
} from "lucide-react";
import { TemplatesHeader } from "@/components/layout/headers";

export default function TemplatesPage() {
  const categories = [
    { name: "All Templates", icon: Sparkles, count: 48 },
    { name: "Customer Feedback", icon: Users, count: 12 },
    { name: "HR & Recruiting", icon: Briefcase, count: 8 },
    { name: "Event Planning", icon: Heart, count: 6 },
    { name: "Education", icon: GraduationCap, count: 10 },
    { name: "E-commerce", icon: ShoppingCart, count: 7 },
    { name: "Marketing", icon: TrendingUp, count: 5 },
  ];

  const templates = [
    {
      id: 1,
      name: "Customer Satisfaction Survey",
      description: "Measure customer satisfaction and gather valuable feedback",
      category: "Customer Feedback",
      uses: 2847,
      rating: 4.8,
      color: "blue",
      icon: Users,
      featured: true,
    },
    {
      id: 2,
      name: "Employee Feedback Form",
      description: "Collect feedback from your team members",
      category: "HR & Recruiting",
      uses: 1923,
      rating: 4.9,
      color: "violet",
      icon: Briefcase,
      featured: true,
    },
    {
      id: 3,
      name: "Event Registration",
      description: "Streamline event registrations and RSVPs",
      category: "Event Planning",
      uses: 1654,
      rating: 4.7,
      color: "rose",
      icon: Heart,
      featured: false,
    },
    {
      id: 4,
      name: "Course Evaluation",
      description: "Gather student feedback on courses and instructors",
      category: "Education",
      uses: 1432,
      rating: 4.6,
      color: "emerald",
      icon: GraduationCap,
      featured: false,
    },
    {
      id: 5,
      name: "Product Feedback",
      description: "Collect insights about your product from users",
      category: "Customer Feedback",
      uses: 2134,
      rating: 4.8,
      color: "cyan",
      icon: Users,
      featured: true,
    },
    {
      id: 6,
      name: "Job Application Form",
      description: "Professional job application and candidate evaluation",
      category: "HR & Recruiting",
      uses: 1876,
      rating: 4.7,
      color: "indigo",
      icon: Briefcase,
      featured: false,
    },
    {
      id: 7,
      name: "Order Feedback Survey",
      description: "Get feedback on customer orders and delivery",
      category: "E-commerce",
      uses: 1543,
      rating: 4.5,
      color: "amber",
      icon: ShoppingCart,
      featured: false,
    },
    {
      id: 8,
      name: "Newsletter Signup",
      description: "Build your email list with a beautiful signup form",
      category: "Marketing",
      uses: 3421,
      rating: 4.9,
      color: "purple",
      icon: TrendingUp,
      featured: true,
    },
    {
      id: 9,
      name: "Contact Form",
      description: "Simple and elegant contact form for your website",
      category: "Customer Feedback",
      uses: 4532,
      rating: 4.8,
      color: "blue",
      icon: Users,
      featured: false,
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<
      string,
      { bg: string; text: string; border: string; hover: string }
    > = {
      blue: {
        bg: "bg-blue-50 dark:bg-blue-950/20",
        text: "text-blue-600",
        border: "border-l-blue-500",
        hover: "hover:border-blue-300",
      },
      violet: {
        bg: "bg-violet-50 dark:bg-violet-950/20",
        text: "text-violet-600",
        border: "border-l-violet-500",
        hover: "hover:border-violet-300",
      },
      rose: {
        bg: "bg-rose-50 dark:bg-rose-950/20",
        text: "text-rose-600",
        border: "border-l-rose-500",
        hover: "hover:border-rose-300",
      },
      emerald: {
        bg: "bg-emerald-50 dark:bg-emerald-950/20",
        text: "text-emerald-600",
        border: "border-l-emerald-500",
        hover: "hover:border-emerald-300",
      },
      cyan: {
        bg: "bg-cyan-50 dark:bg-cyan-950/20",
        text: "text-cyan-600",
        border: "border-l-cyan-500",
        hover: "hover:border-cyan-300",
      },
      indigo: {
        bg: "bg-indigo-50 dark:bg-indigo-950/20",
        text: "text-indigo-600",
        border: "border-l-indigo-500",
        hover: "hover:border-indigo-300",
      },
      amber: {
        bg: "bg-amber-50 dark:bg-amber-950/20",
        text: "text-amber-600",
        border: "border-l-amber-500",
        hover: "hover:border-amber-300",
      },
      purple: {
        bg: "bg-purple-50 dark:bg-purple-950/20",
        text: "text-purple-600",
        border: "border-l-purple-500",
        hover: "hover:border-purple-300",
      },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div>
      <TemplatesHeader />

      <div className="space-y-6 p-6">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search templates..." className="pl-10" />
          </div>
          <Select defaultValue="popular">
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="recent">Recently Added</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {categories.map((category) => (
            <Card
              key={category.name}
              className="cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] duration-200 hover:border-primary/50"
            >
              <CardContent className="p-4 text-center">
                <category.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold text-sm mb-1">{category.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {category.count} templates
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Templates Grid */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">
              <Sparkles className="h-4 w-4 mr-2" />
              All Templates
            </TabsTrigger>
            <TabsTrigger value="featured">
              <Star className="h-4 w-4 mr-2" />
              Featured
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => {
                const colors = getColorClasses(template.color);
                return (
                  <Card
                    key={template.id}
                    className={`hover:shadow-lg transition-all hover:scale-[1.02] duration-200 border-l-4 ${colors.border} ${colors.hover}`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className={`p-3 rounded-lg ${colors.bg}`}>
                          <template.icon className={`h-6 w-6 ${colors.text}`} />
                        </div>
                        {template.featured && (
                          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="line-clamp-1">
                        {template.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {template.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <Badge variant="secondary">{template.category}</Badge>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span className="font-medium">
                              {template.rating}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{template.uses.toLocaleString()} uses</span>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button className="flex-1" size="sm">
                            Use Template
                          </Button>
                          <Button variant="outline" size="sm">
                            Preview
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="featured" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates
                .filter((t) => t.featured)
                .map((template) => {
                  const colors = getColorClasses(template.color);
                  return (
                    <Card
                      key={template.id}
                      className={`hover:shadow-lg transition-all hover:scale-[1.02] duration-200 border-l-4 ${colors.border} ${colors.hover}`}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <div className={`p-3 rounded-lg ${colors.bg}`}>
                            <template.icon
                              className={`h-6 w-6 ${colors.text}`}
                            />
                          </div>
                          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        </div>
                        <CardTitle className="line-clamp-1">
                          {template.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {template.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-sm">
                            <Badge variant="secondary">
                              {template.category}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                              <span className="font-medium">
                                {template.rating}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>{template.uses.toLocaleString()} uses</span>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button className="flex-1" size="sm">
                              Use Template
                            </Button>
                            <Button variant="outline" size="sm">
                              Preview
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
