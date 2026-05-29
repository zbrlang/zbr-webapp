"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { use, useState, useEffect } from "react";
import Header from "../../components/Header";

export default function BotLayout({
  children,
  params: paramsPromise,
}: {
  children: React.ReactNode;
  params: Promise<{ botId: string }>;
}) {
  const { botId } = use(paramsPromise);
  const pathname = usePathname();
  const [botName, setBotName] = useState("Loading...");

  useEffect(() => {
    fetch(`/api/bots/${botId}/meta`)
      .then(res => res.json())
      .then(data => setBotName(data.name || "Unnamed Bot"));
  }, [botId]);

  const tabs = [
    { id: "commands", label: "COMMANDS", href: `/dashboard/${botId}/commands` },
    { id: "variables", label: "VARIABLES", href: `/dashboard/${botId}/variables` },
    { id: "status", label: "STATUS", href: `/dashboard/${botId}/status` },
    { id: "settings", label: "SETTINGS", href: `/dashboard/${botId}/settings` },
  ];

  // Helper to determine if a tab is active
  const isActive = (href: string) => {
    if (href.endsWith("/commands") && (pathname === `/dashboard/${botId}` || pathname === href)) {
      return true;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-6xl mx-auto pt-12 px-8 pb-12">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
          <Link href="/dashboard" className="hover:text-primary transition-colors">Account</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{botName}</span>
        </nav>

        {/* Page Title */}
        <h1 className="text-4xl font-extrabold tracking-tight mb-10">{botName}</h1>

        {/* Tabs */}
        <nav className="mb-10 border-b border-border-50">
          <div className="flex space-x-10 text-sm font-bold tracking-wider">
            {tabs.map(tab => (
              <Link
                key={tab.id}
                href={tab.href}
                className={`${isActive(tab.href) 
                  ? "text-primary border-b-2 border-primary" 
                  : "text-muted-foreground hover:text-primary"
                } transition-all pb-4 px-1`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Tab Content */}
        <div className="bg-surface-20 backdrop-blur-sm p-8 rounded-3xl border border-border-50 shadow-xl min-h-[400px]">
          {children}
        </div>
      </main>
    </div>
  );
}