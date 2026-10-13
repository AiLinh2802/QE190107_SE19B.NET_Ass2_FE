"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LegacyTagsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/tags");
  }, [router]);

  return (
    <div className="flex h-64 items-center justify-center text-sm text-slate-500">
      Redirecting to Admin Tags...
    </div>
  );
}
