import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { ToastProvider } from "@/components/ToastProvider";
import { CheckSquare2 } from "lucide-react";

export const metadata: Metadata = {
  title: "TaskTrack — Task & Team Management Platform",
  description: "A public, modern workspace for managing departments, projects, and work items with clarity.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <ToastProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-slate-200/80 bg-white py-8">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs font-semibold text-slate-500 sm:flex-row sm:px-6">
              <div className="flex items-center gap-2.5 text-slate-700">
                <div className="grid h-6 w-6 place-items-center rounded-lg bg-brand-600 text-white shadow-2xs">
                  <CheckSquare2 className="h-3.5 w-3.5" />
                </div>
                <span className="font-black text-slate-900 tracking-tight">TaskTrack</span>
                <span className="text-slate-300">·</span>
                <span>Team & Project Management Platform</span>
              </div>
              <p className="text-slate-400">
                © {new Date().getFullYear()} TaskTrack. Modern team collaboration workspace.
              </p>
            </div>
          </footer>
        </ToastProvider>
      </body>
    </html>
  );
}

