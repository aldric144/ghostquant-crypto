"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NarrativesPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/analytics-dashboard?view=narratives");
  }, [router]);

  return null;
}
