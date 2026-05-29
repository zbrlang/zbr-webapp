"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/swr";
import Header from "../components/Header";
import Footer from "../components/Footer";

function BotCard({ bot }: { bot: any }) {
  const router = useRouter();
  const { data: meta } = useSWR(`/api/bots/${bot.id}/meta`, fetcher, { revalidateOnFocus: false });
  const metaData = meta || { avatar: null, banner: null };

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase();
  const getGradient = (name: string) => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = ["#6366f1", "#a855f7", "#f43f5e", "#fb923c", "#10b981", "#3b82f6"];
    const color = colors[hash % colors.length];
    return `linear-gradient(to right, ${color}, #1f2937)`;
  };

  return (
    <div 
      className="bg-surface-30 backdrop-blur-xl rounded-[2rem] border border-border-50 hover:border-primary/50 transition-all hover:translate-y-[-4px] cursor-pointer group shadow-xl overflow-hidden flex flex-col"
      onClick={() => router.push(`/dashboard/${bot.id}`)}
    >
      <div className="h-24 w-full relative transition-transform group-hover:scale-105 duration-500" style={{ background: metaData.banner || getGradient(bot.name) }}>
        <div className="absolute inset-0 bg-black/5"></div>
      </div>
      <div className="px-6 pb-6 pt-0 relative flex-1">
        <div className="absolute -top-10 left-6 h-16 w-16 rounded-2xl bg-surface border-[4px] border-background flex items-center justify-center text-primary text-xl font-black shadow-xl overflow-hidden group-hover:scale-105 transition-transform duration-300" style={{ background: !metaData.avatar ? getGradient(bot.name) : 'transparent' }}>
          {metaData.avatar ? <img src={metaData.avatar} alt={bot.name} className="h-full w-full object-cover"/> : getInitials(bot.name)}
        </div>
        <div className="mt-10 mb-6">
          <h3 className="text-xl font-black tracking-tight group-hover:text-primary transition-colors italic">{bot.name}</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-surface-50 rounded-xl p-3 border border-border-50">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] block mb-0.5">Commands</span>
            <span className="text-xl font-black tabular-nums">{bot.commandCount}</span>
          </div>
          <div className="bg-surface-50 rounded-xl p-3 border border-border-50">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] block mb-0.5">Variables</span>
            <span className="text-xl font-black tabular-nums">{bot.variableCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: bots = [] } = useSWR("/api/bots", fetcher, { revalidateOnFocus: false });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center pt-12 pb-24">
        <div className="w-full max-w-6xl px-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-20 space-y-8 md:space-y-0 text-center md:text-left">
            <div>
              <h1 className="text-6xl font-black tracking-tighter mb-4 italic uppercase">Your Fleet</h1>
              <p className="text-muted-foreground text-lg font-medium">Manage and monitor your Discord bot ecosystem.</p>
            </div>
            <Link 
              href="/dashboard/new"
              className="px-10 py-5 bg-primary text-accent-foreground rounded-2xl hover:bg-primary/90 transition-all font-black text-xs uppercase tracking-widest flex items-center space-x-3 shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Add New Bot</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(bots) ? bots.map((bot: any) => <BotCard key={bot.id} bot={bot} />) : null}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
