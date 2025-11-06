"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Product Manager at TechCorp",
    avatar: "/avatars/sarah.jpg",
    fallback: "SJ",
    rating: 5,
    content:
      "FormAI completely transformed how we collect user feedback. The AI insights are incredibly valuable and save us hours of analysis time.",
  },
  {
    name: "Michael Chen",
    role: "Marketing Director at GrowthLab",
    avatar: "/avatars/michael.jpg",
    fallback: "MC",
    rating: 5,
    content:
      "The most beautiful form builder I've ever used. Our response rates increased by 40% just from switching to FormAI's elegant designs.",
  },
  {
    name: "Emily Rodriguez",
    role: "HR Manager at StartupXYZ",
    avatar: "/avatars/emily.jpg",
    fallback: "ER",
    rating: 5,
    content:
      "Creating employee surveys used to take hours. Now with AI generation, I can build comprehensive forms in minutes. Game changer!",
  },
  {
    name: "David Park",
    role: "Founder at InnovateCo",
    avatar: "/avatars/david.jpg",
    fallback: "DP",
    rating: 5,
    content:
      "The analytics dashboard is phenomenal. We can spot trends and sentiment in real-time. Best investment we've made this year.",
  },
  {
    name: "Lisa Thompson",
    role: "UX Researcher at DesignHub",
    avatar: "/avatars/lisa.jpg",
    fallback: "LT",
    rating: 5,
    content:
      "Finally, a form tool that doesn't feel like it's from 2010. The user experience is smooth, modern, and our participants love it.",
  },
  {
    name: "James Wilson",
    role: "Operations Lead at ScaleUp",
    avatar: "/avatars/james.jpg",
    fallback: "JW",
    rating: 5,
    content:
      "The integrations with our existing tools made rollout seamless. FormAI fits perfectly into our workflow.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4">Loved by thousands</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See what our customers have to say about FormAI
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card className="h-full">
                      <CardContent className="p-6">
                        {/* Star Rating */}
                        <div className="flex gap-1 mb-4">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-5 h-5 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>

                        {/* Testimonial Content */}
                        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                          "{testimonial.content}"
                        </p>

                        {/* Author */}
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage
                              src={testimonial.avatar}
                              alt={testimonial.name}
                            />
                            <AvatarFallback className="bg-indigo-100 text-indigo-600">
                              {testimonial.fallback}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-sm">
                              {testimonial.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {testimonial.role}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
