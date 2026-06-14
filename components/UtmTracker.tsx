"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { captureUtmParameters } from "@/lib/utm";

export default function UtmTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    captureUtmParameters();
  }, [searchParams]);

  return null;
}
