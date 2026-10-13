"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  CheckSquare2,
  ChevronDown,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  LogIn,
  LogOut,
  Menu,
  Search,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Tags,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { clearAuth, getUser, isAuthenticated, isAdmin } from "@/lib/auth";
import type { SystemAccount } from "@/types";
import { useToast } from "@/components/ToastProvider";

const publicLinks = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/departments", label: "Departments", icon: Building2 },
  { href: "/search", label: "Search Tasks", icon: Search },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [authed, setAuthed] = useState(false);
  const [currentUser, setCurrentUser] = useState<SystemAccount | null>(null);

  useEffect(() => {
    const syncAuth = () => {
      setAuthed(isAuthenticated());
      setCurrentUser(getUser());
    };

    syncAuth();
    window.addEventListener("auth-changed", syncAuth);
    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener("auth-changed", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setManageOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearAuth();
    toast("You have been signed out.");
    router.push("/");
    setMobileOpen(false);
  };

  const isManageActive = pathname.startsWith("/admin");
  const adminRole = currentUser?.role === 1 || currentUser?.roleName?.toLowerCase() === "admin";

  const manageLinks = [
    { href: "/admin/departments", label: "Departments", icon: Building2, desc: "Create & organize teams" },
    { href: "/admin/projects", label: "Projects", icon: FolderKanban, desc: "Track milestones & goals" },
    { href: "/admin/tasks", label: "Tasks", icon: ListTodo, desc: "Assign & soft-delete tasks" },
    { href: "/admin/tags", label: "Tags", icon: Tags, desc: "Color labels & categories" },
    ...(adminRole
      ? [
          {
            href: "/admin/accounts",
            label: "Accounts",
            icon: Users,
            desc: "User roles & permissions",
            adminOnly: true,
          },
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 font-black text-slate-900 transition hover:opacity-90"
          onClick={() => {
            setMobileOpen(false);
            setManageOpen(false);
          }}
        >
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-tr from-brand-600 to-sky-500 text-white shadow-md shadow-brand-500/20 transition group-hover:scale-105">
            <CheckSquare2 className="h-5 w-5" />
          </div>
          <span className="text-xl tracking-tight">
            Task<span className="text-brand-600">Track</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1.5 md:flex">
          {publicLinks.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-150 ${
                  active
                    ? "bg-brand-50 text-brand-700 font-bold"
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-brand-600" : "text-slate-400"}`} />
                {item.label}
              </Link>
            );
          })}

          {authed && (
            <Link
              href="/admin"
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-150 ${
                pathname === "/admin"
                  ? "bg-brand-50 text-brand-700 font-bold"
                  : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
              }`}
            >
              <LayoutDashboard className={`h-4 w-4 ${pathname === "/admin" ? "text-brand-600" : "text-slate-400"}`} />
              Dashboard
            </Link>
          )}

          <div className="mx-2 h-5 w-[1px] bg-slate-200" />

          {/* Manage Dropdown (when authenticated or for quick access) */}
          {authed && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setManageOpen(!manageOpen)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-150 ${
                  isManageActive && pathname !== "/admin"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100/90 text-slate-700 hover:bg-slate-200/80"
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Management</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${manageOpen ? "rotate-180" : ""}`}
                />
              </button>

              {manageOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Protected Admin Areas
                  </div>
                  {manageLinks.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setManageOpen(false)}
                        className={`flex items-start gap-3 rounded-xl p-2.5 transition ${
                          active ? "bg-brand-50 text-brand-700" : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div
                          className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                            active ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold">{item.label}</span>
                            {item.adminOnly && (
                              <span className="rounded bg-purple-100 px-1.5 py-0.2 text-[10px] font-bold text-purple-700">
                                Admin
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">{item.desc}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* User Section / Auth Buttons */}
          <div className="ml-2 flex items-center gap-2">
            {authed && currentUser ? (
              <div className="flex items-center gap-2.5 pl-2">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white shadow-sm">
                    {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-800 leading-tight">
                      {currentUser.fullName}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                      {adminRole ? (
                        <span className="text-purple-600 flex items-center gap-0.5">
                          <ShieldCheck className="h-2.5 w-2.5" /> Admin
                        </span>
                      ) : (
                        <span className="text-emerald-600 flex items-center gap-0.5">
                          <Shield className="h-2.5 w-2.5" /> Staff
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition"
                  title="Sign out of TaskTrack"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
                >
                  <LogIn className="h-4 w-4 text-slate-500" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-sm font-bold text-white shadow-sm hover:bg-brand-700 transition"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile menu button */}
        <button
          className="rounded-xl p-2.5 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden animate-in slide-in-from-top-2 duration-150">
          {/* User status in mobile */}
          {authed && currentUser ? (
            <div className="mb-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 font-bold text-white">
                  {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{currentUser.fullName}</div>
                  <div className="text-xs text-slate-500">
                    {adminRole ? "Administrator" : "Staff Member"} • {currentUser.email}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-xl bg-rose-50 p-2 text-rose-600 hover:bg-rose-100"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="mb-4 grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="btn-secondary text-center justify-center text-xs"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="btn-primary text-center justify-center text-xs"
              >
                Register
              </Link>
            </div>
          )}

          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Navigation</p>
          <div className="space-y-1">
            {publicLinks.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                    active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}

            {authed && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                  pathname === "/admin" ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Admin Dashboard
              </Link>
            )}
          </div>

          {authed && (
            <>
              <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                Protected Management
              </p>
              <div className="grid grid-cols-2 gap-2">
                {manageLinks.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2 rounded-xl p-2.5 text-xs font-bold ${
                        active ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
}
