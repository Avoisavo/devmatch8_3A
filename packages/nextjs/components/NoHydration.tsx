"use client";

import { useEffect, useState } from "react";

interface NoHydrationProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that prevents hydration mismatches by only rendering children on the client side.
 * This is useful when dealing with browser extensions that inject attributes or content.
 */
export const NoHydration = ({ children, fallback = null }: NoHydrationProps) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Only render children on the client side
  if (!isClient) {
    return <div suppressHydrationWarning>{fallback}</div>;
  }

  return <div suppressHydrationWarning>{children}</div>;
};
