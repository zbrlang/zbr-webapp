"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { use, useState, useEffect } from "react";
import { toast } from "sonner";
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
  const [processStatus, setProcessStatus] = useState("stopped");
  const [isProcessLoading, setIsProcessLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/bots/${botId}/meta`)
      .then(res => res.json())
      .then(data => setBotName(data.name || "Unnamed Bot"));

    const fetchStatus = () =>
      fetch(`/api/bots/${botId}/status`)
        .then(res => res.json())
        .then(data => setProcessStatus(data.processStatus || "stopped"));

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [botId]);

  const handleProcessAction = async (action: 'run' | 'stop') => {
    setIsProcessLoading(true);
    try {
      const response = await fetch(`/api/bots/${botId}/${action}`, { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        setProcessStatus(data.status);
        toast.success(`Bot ${action === 'run' ? 'started' : 'stopped'} successfully!`);
      } else {
        throw new Error("Action failed");
      }
    } catch (e) {
      toast.error(`Failed to ${action} bot`);
    } finally {
      setIsProcessLoading(false);
    }
  };

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

        {/* Page Title & Controls */}
        <div className="flex items-center justify-between mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight">{botName}</h1>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => handleProcessAction(processStatus === 'stopped' ? 'run' : 'stop')} 
                disabled={isProcessLoading} 
                className={`px-5 py-2.5 rounded-xl font-black text-xs tracking-widest transition-all shadow-lg flex items-center space-x-2 italic uppercase disabled:opacity-50 ${
                  processStatus === 'stopped' 
                    ? "bg-primary text-accent-foreground hover:bg-primary/90 shadow-primary/20" 
                    : "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-destructive/20"
                }`}
              >
                {isProcessLoading ? (
                  <>
                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{processStatus === 'stopped' ? 'RUNNING...' : 'STOPPING...'}</span>
                  </>
                ) : (
                  <span>{processStatus === 'stopped' ? 'RUN THE BOT' : 'STOP THE BOT'}</span>
                )}
              </button>
            </div>
        </div>

        {/* Tabs */}
        <nav className="mb-10 border-b border-border-50 overflow-x-auto">
          <div className="flex space-x-10 text-sm font-bold tracking-wider whitespace-nowrap pb-1">
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