"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EntitiesPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/analytics-dashboard?view=entities");
  }, [router]);

  return null;
}
