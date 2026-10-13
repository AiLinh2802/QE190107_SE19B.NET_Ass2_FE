"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Shield,
  Tags,
  Users,
} from "lucide-react";
import { api } from "@/lib/api";
import { getUser, isAuthenticated } from "@/lib/auth";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/ui";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [counts, setCounts] = useState({
    departments: 0,
    projects: 0,
    tasks: 0,
    tags: 0,
  });

  const currentUser = getUser();
  const adminUser = currentUser?.role === 1 || currentUser?.roleName?.toLowerCase() === "admin";

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    Promise.all([
      api.departments.list(),
      api.projects.list(),
      api.tasks.list(),
      api.tags.list(),
    ])
      .then(([depts, projs, tasks, tags]) => {
        setCounts({
          departments: depts?.length || 0,
          projects: projs?.length || 0,
          tasks: tasks?.length || 0,
          tags: tags?.length || 0,
        });
      })
      .catch((err) => {
        setError(err.message || "Failed to load dashboard statistics.");
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <LoadingState label="Loading dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const sections = [
    {
      title: "Departments",
      desc: "Organize company branches, divisions, and teams",
      href: "/admin/departments",
      count: counts.departments,
      icon: Building2,
      color: "from-sky-500 to-blue-600",
      lightColor: "bg-sky-50 text-sky-700",
    },
    {
      title: "Projects",
      desc: "Track client deliveries, deadlines, and project statuses",
      href: "/admin/projects",
      count: counts.projects,
      icon: FolderKanban,
      color: "from-brand-600 to-indigo-600",
      lightColor: "bg-brand-50 text-brand-700",
    },
    {
      title: "Tasks",
      desc: "Assign team tasks, set priorities, and link colored tags",
      href: "/admin/tasks",
      count: counts.tasks,
      icon: ListTodo,
      color: "from-emerald-500 to-teal-600",
      lightColor: "bg-emerald-50 text-emerald-700",
    },
    {
      title: "Tags",
      desc: "Manage custom hexadecimal color tags and labels",
      href: "/admin/tags",
      count: counts.tags,
      icon: Tags,
      color: "from-purple-500 to-pink-600",
      lightColor: "bg-purple-50 text-purple-700",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-3.5 py-1 text-xs font-bold text-indigo-300">
            <Shield className="h-3.5 w-3.5" />
            <span>Authenticated Workspace</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Welcome back, {currentUser?.fullName || "Team Member"}!
          </h1>
          <p className="text-sm text-slate-300">
            Role: <span className="font-bold text-white uppercase">{currentUser?.roleName || (adminUser ? "Admin" : "Staff")}</span>. Manage organizational units, review tasks, or update account roles.
          </p>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div>
        <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">System Overview</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sections.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{item.title}</span>
                  <div className={`grid h-10 w-10 place-items-center rounded-xl ${item.lightColor} transition group-hover:scale-110`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-black tracking-tight text-slate-900">{item.count}</span>
                  <span className="text-xs font-medium text-slate-400">Total</span>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-brand-600 group-hover:underline">
                  <span>Manage {item.title.toLowerCase()}</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Protected Management Links */}
      <div>
        <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Management Portals</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:border-brand-500 hover:shadow-md"
              >
                <div className="space-y-2">
                  <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr ${item.color} text-white shadow-md`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition">
                    {item.title} Management
                  </h3>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
                <div className="mt-6 flex items-center gap-1 text-xs font-bold text-brand-600">
                  <span>Open Management View</span>
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}

          {/* Admin Only Portal Card */}
          {adminUser && (
            <Link
              href="/admin/accounts"
              className="group flex flex-col justify-between rounded-2xl border border-amber-200 bg-amber-50/50 p-6 shadow-sm transition hover:border-amber-400 hover:shadow-md"
            >
              <div className="space-y-2">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20">
                  <Users className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-800 transition">
                    System Accounts
                  </h3>
                  <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-black uppercase text-amber-900">
                    Admin
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Manage registered users, update permissions & roles between Staff and Admin
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1 text-xs font-bold text-amber-800">
                <span>Manage Accounts</span>
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
