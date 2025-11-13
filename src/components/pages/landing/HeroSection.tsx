import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white pt-16">
      {/* Subtle indigo bursts - decorative elements matching button colors */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-32 left-10 w-96 h-96 bg-indigo-700/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-indigo-600/8 rounded-full blur-3xl" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-200 mb-8">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
            AI-Powered Form Builder
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-6 tracking-tight leading-[1.1]">
          Beautiful forms,
          <br />
          <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            intelligent insights
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
          The AI-powered survey platform that turns data collection into a
          delightful experience
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button className="group">
            Get Started Free
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>

          <Button variant="outline">View Demo</Button>
        </div>

        {/* Social Proof */}
        {/* <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-blue-400 border-2 border-white"
                />
              ))}
            </div>
            <span>10,000+ users</span>
          </div>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-300" />
          <span>⭐⭐⭐⭐⭐ 4.9/5 rating</span>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-300" />
          <span>🚀 100% free to start</span>
        </div> */}
      </div>
    </section>
  );
}
