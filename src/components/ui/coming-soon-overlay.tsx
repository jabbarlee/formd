import React from "react";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface ComingSoonOverlayProps {
  /**
   * Whether the overlay is visible
   * @default true
   */
  show?: boolean;
  /**
   * Custom message to display
   * @default "Coming Soon"
   */
  message?: string;
  /**
   * Custom description to display below the message
   */
  description?: string;
  /**
   * Custom width - if not provided, will auto-fit the container
   */
  width?: string | number;
  /**
   * Custom height - if not provided, will auto-fit the container
   */
  height?: string | number;
  /**
   * Blur intensity for the backdrop
   * @default "blur-md"
   */
  blurIntensity?:
    | "blur-sm"
    | "blur"
    | "blur-md"
    | "blur-lg"
    | "blur-xl"
    | "blur-2xl"
    | "blur-3xl";
  /**
   * Background opacity
   * @default "bg-white/80"
   */
  backgroundColor?: string;
  /**
   * Text color
   * @default "text-gray-900"
   */
  textColor?: string;
  /**
   * Custom className for the overlay container
   */
  className?: string;
  /**
   * Custom className for the message container
   */
  messageClassName?: string;
  /**
   * Show icon above the message
   * @default true
   */
  showIcon?: boolean;
  /**
   * Custom icon component to display
   * @default Clock icon
   */
  icon?: React.ReactNode;
  /**
   * Additional content to display
   */
  children?: React.ReactNode;
}

/**
 * ComingSoonOverlay Component
 *
 * A reusable overlay component that displays a "Coming Soon" message
 * with a blur effect over any content. Automatically adjusts to the
 * size of its parent container.
 *
 * Features:
 * - Auto width/height to fit parent container
 * - Configurable blur intensity
 * - Customizable message and styling
 * - Content behind overlay remains visible but blurred
 * - Responsive design
 *
 * @example
 * ```tsx
 * // Basic usage
 * <div className="relative">
 *   <YourContentComponent />
 *   <ComingSoonOverlay />
 * </div>
 *
 * // Custom message and styling
 * <div className="relative">
 *   <YourContentComponent />
 *   <ComingSoonOverlay
 *     message="Under Development"
 *     description="This feature will be available soon"
 *     blurIntensity="blur-lg"
 *   />
 * </div>
 *
 * // Custom icon
 * <div className="relative">
 *   <YourContentComponent />
 *   <ComingSoonOverlay
 *     icon={<Sparkles className="h-8 w-8 text-purple-500" />}
 *     message="AI Features Coming Soon"
 *   />
 * </div>
 *
 * // Without icon
 * <div className="relative">
 *   <YourContentComponent />
 *   <ComingSoonOverlay showIcon={false} />
 * </div>
 *
 * // Conditional display
 * <div className="relative">
 *   <YourContentComponent />
 *   <ComingSoonOverlay show={!isFeatureEnabled} />
 * </div>
 * ```
 */
export const ComingSoonOverlay: React.FC<ComingSoonOverlayProps> = ({
  show = true,
  message = "Coming Soon",
  description,
  width,
  height,
  blurIntensity = "blur-sm",
  backgroundColor = "bg-white/60 dark:bg-gray-900/60",
  textColor = "text-gray-900 dark:text-gray-100",
  className,
  messageClassName,
  showIcon = true,
  icon,
  children,
}) => {
  if (!show) return null;

  const overlayStyle: React.CSSProperties = {
    ...(width && { width: typeof width === "number" ? `${width}px` : width }),
    ...(height && {
      height: typeof height === "number" ? `${height}px` : height,
    }),
  };

  return (
    <div
      className={cn(
        // Positioning - absolute to overlay content
        "absolute inset-0 z-50",
        // Backdrop blur effect
        `backdrop-${blurIntensity}`,
        // Background with opacity
        backgroundColor,
        // Flexbox for centering content
        "flex items-center justify-center",
        // Transitions for smooth appearance
        "transition-all duration-300 ease-in-out",
        className
      )}
      style={overlayStyle}
    >
      {/* Simple text container without card styling */}
      <div
        className={cn(
          // Text container without card styling
          "text-center",
          // Add subtle text shadow for better readability
          "drop-shadow-lg",
          messageClassName
        )}
      >
        <div className={cn("space-y-3", textColor)}>
          {/* Icon */}
          {showIcon && (
            <div className="flex justify-center mb-5">
              {icon || (
                <Clock className="h-8 w-8 text-blue-500 drop-shadow-md" />
              )}
            </div>
          )}

          {/* Main message */}
          <h3 className="text-2xl font-bold tracking-wide drop-shadow-md">
            {message}
          </h3>

          {/* Optional description */}
          {description && (
            <p className="text-base font-medium max-w-md mx-auto leading-relaxed drop-shadow-md">
              {description}
            </p>
          )}

          {/* Optional custom content */}
          {children && <div className="mt-4">{children}</div>}
        </div>
      </div>
    </div>
  );
};

export default ComingSoonOverlay;
