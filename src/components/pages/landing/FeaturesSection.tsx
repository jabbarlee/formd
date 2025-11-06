import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sparkles,
  Palette,
  BarChart3,
  Brain,
  Share2,
  Puzzle,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Form Generation",
    description:
      "Create sophisticated forms in seconds with our intelligent AI assistant",
  },
  {
    icon: Palette,
    title: "Beautiful Design",
    description: "Stunning, customizable themes that make your forms stand out",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Deep insights and visualizations as responses come in",
  },
  {
    icon: Sparkles,
    title: "Smart Responses",
    description: "AI-powered sentiment analysis and automatic categorization",
  },
  {
    icon: Share2,
    title: "Easy Sharing",
    description: "Embed anywhere or share with a beautiful custom link",
  },
  {
    icon: Puzzle,
    title: "Powerful Integrations",
    description: "Connect with Slack, Notion, HubSpot, and 100+ tools",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4">Everything you need</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features that make form building effortless
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="border-2 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300 hover:shadow-lg"
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
