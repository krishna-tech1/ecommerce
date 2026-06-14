"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/sign-in");
  }, [router]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <p className="text-gray-500">Redirecting to sign in...</p>
    </div>
  );
}
