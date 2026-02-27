"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  User,
  LogOut,
  LayoutDashboard,
  Search,
  Calendar,
} from "lucide-react";

export function Header() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/spiele", label: "Spielplan", icon: Calendar },
    { href: "/bars", label: "Bars finden", icon: Search },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 ${
      scrolled
        ? "glass-dark shadow-xl"
        : "bg-[#1A1A2E]/70 backdrop-blur-sm"
    }`}>
      {/* Animated accent line */}
      <div className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#00D26A] via-[#F5A623] to-[#00D26A] bg-[length:200%_100%] animate-shimmer transition-all duration-500 ${
        scrolled ? "w-full opacity-100" : "w-0 opacity-0"
      }`} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-300 ${
          scrolled ? "h-14" : "h-16"
        }`}>
          {/* Wordmark */}
          <Link href="/" className="flex items-center group">
            <span className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl tracking-wider leading-none text-white transition-all duration-300 group-hover:tracking-[0.15em]">
              SPIELTAG<span className="text-gradient-gold">BAR</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors group py-1"
              >
                <link.icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:text-[#00D26A]" />
                {link.label}
                <span className="absolute -bottom-0.5 left-0 h-[2px] w-0 bg-gradient-to-r from-[#00D26A] to-[#F5A623] rounded-full transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}

            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-gray-300 hover:text-white hover:bg-white/10"
                  >
                    <User className="h-4 w-4 mr-2" />
                    {session.user?.name || "Mein Konto"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ redirect: false }).then(() => { window.location.href = "/"; })}
                    className="cursor-pointer text-red-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Abmelden
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
                  >
                    Anmelden
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-[#00D26A] hover:bg-[#00B85C] text-white hover:scale-105 hover:shadow-[0_0_20px_rgba(0,210,106,0.4)] transition-all duration-300">
                    Registrieren
                  </Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-[#1A1A2E] text-white border-none">
              <div className="mt-4 mb-6">
                <span className="font-[family-name:var(--font-display)] text-2xl tracking-wider leading-none">
                  SPIELTAG<span className="text-gradient-gold">BAR</span>
                </span>
              </div>
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <link.icon className="h-5 w-5" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                ))}

                <div className="border-t border-white/10 my-2" />

                {session ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      <span className="font-medium">Dashboard</span>
                    </Link>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        signOut({ redirect: false }).then(() => { window.location.href = "/"; });
                      }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-white/10 transition-colors"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="font-medium">Abmelden</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <User className="h-5 w-5" />
                      <span className="font-medium">Anmelden</span>
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Button className="w-full bg-[#00D26A] hover:bg-[#00B85C] text-white mt-2">
                        Registrieren
                      </Button>
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
