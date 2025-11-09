/**
 * Comet Card Component
 * Animated card with comet effect from Aceternity UI
 */

"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CometCardProps {
  children: React.ReactNode;
  className?: string;
}

export function CometCard({ children, className }: CometCardProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Animated comet effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="comet-container">
          <div className="comet" />
        </div>
      </div>

      {/* Card content */}
      <div className="relative z-10">{children}</div>

      <style jsx>{`
        .comet-container {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .comet {
          position: absolute;
          width: 2px;
          height: 80px;
          background: linear-gradient(
            180deg,
            transparent,
            rgba(139, 92, 246, 0.8),
            transparent
          );
          animation: comet-animation 3s linear infinite;
          filter: blur(1px);
        }

        .comet::before {
          content: "";
          position: absolute;
          top: 0;
          left: -1px;
          width: 4px;
          height: 4px;
          background: rgba(139, 92, 246, 1);
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.8);
        }

        @keyframes comet-animation {
          0% {
            transform: translateX(-100px) translateY(-100px) rotate(45deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateX(calc(100% + 100px))
              translateY(calc(100% + 100px)) rotate(45deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
