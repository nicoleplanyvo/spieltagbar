import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  LayoutDashboard,
  Users,
  Building2,
  Star,
  Shield,
  ArrowLeft,
} from "lucide-react";

const navItems = [
  { href: "/dashboard/admin", label: "Übersicht", icon: LayoutDashboard },
  { href: "/dashboard/admin/users", label: "Nutzer", icon: Users },
  { href: "/dashboard/admin/bars", label: "Bars", icon: Building2 },
  { href: "/dashboard/admin/bewertungen", label: "Bewertungen", icon: Star },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, name: true },
  });

  if (user?.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Admin Header */}
      <div className="bg-[#1A1A2E] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <Shield className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h1 className="font-semibold text-lg">Admin Dashboard</h1>
                <p className="text-xs text-white/60">{user.name}</p>
              </div>
            </div>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Zur Seite
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex gap-1 overflow-x-auto pb-0 -mb-px">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-4 py-3 text-sm text-white/70 hover:text-white border-b-2 border-transparent hover:border-[#00D26A] transition-all whitespace-nowrap"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </div>
    </div>
  );
}
