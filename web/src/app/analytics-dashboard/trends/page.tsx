"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TrendsPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/analytics-dashboard?view=trends");
  }, [router]);

  return null;
}
