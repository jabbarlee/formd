import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function FinalCTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-800 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Ready to create beautiful forms?
          </h2>

          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto">
            Join thousands of teams already using Form
            <span className="italic text-indigo-600">D</span> to collect better
            data and gain deeper insights
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button className="bg-white text-indigo-600 hover:bg-white/90 shadow-2xl group">
              Get Started Free
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              variant="ghost"
              className="border-2 border-white text-white hover:bg-indigo-100/10 dark:hover:bg-indigo-900/50"
            >
              Schedule Demo
            </Button>
          </div>

          <p className="text-white/80 mt-8 text-sm">
            No credit card required • Free forever plan • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}
