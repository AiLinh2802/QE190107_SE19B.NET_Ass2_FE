"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LegacyTasksRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/tasks");
  }, [router]);

  return (
    <div className="flex h-64 items-center justify-center text-sm text-slate-500">
      Redirecting to Admin Tasks...
    </div>
  );
}
