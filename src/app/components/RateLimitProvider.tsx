"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function RateLimitProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (input, init) => {
      const response = await originalFetch(input, init);

      if (response.status === 429) {
        toast.error("You're moving too fast! Please slow down.");
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return <>{children}</>;
}
