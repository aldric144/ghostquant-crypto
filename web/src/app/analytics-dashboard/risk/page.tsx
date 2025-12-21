"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RiskPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/analytics-dashboard?view=risk");
  }, [router]);

  return null;
}
