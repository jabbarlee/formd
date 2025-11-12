import React from "react";

interface CTASectionProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * CTA Section component for form preview
 * TODO: Implement proper CTA functionality
 */
export const CTASection: React.FC<CTASectionProps> = ({
  children,
  className,
}) => {
  return <div className={className}>{children}</div>;
};
