"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WhalesPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/analytics-dashboard?view=whales");
  }, [router]);

  return null;
}
