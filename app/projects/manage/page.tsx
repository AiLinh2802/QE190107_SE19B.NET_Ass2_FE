"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LegacyProjectsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/projects");
  }, [router]);

  return (
    <div className="flex h-64 items-center justify-center text-sm text-slate-500">
      Redirecting to Admin Projects...
    </div>
  );
}
