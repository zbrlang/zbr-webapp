"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import Header from "../../components/Header";

export default function NewBotPage() {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Create new bot
    const botRes = await fetch(`/api/bots/new`, { method: 'POST', body: JSON.stringify({ name, token }) });
    const { botId, error } = await botRes.json();

    if (error) {
        toast.error("The token appears to be invalid.");
    } else {
        // Wait for server response, then update cache
        await mutate("/api/bots", (bots: any[] = []) => [...bots, { 
            id: botId, 
            name, 
            commandCount: 0, 
            variableCount: 0 
        }], { revalidate: false });
    }

    // Import project if file provided
    if (file && botId) {

      const formData = new FormData();
      formData.append('file', file);
      await fetch(`/api/bots/${botId}/import`, { method: 'POST', body: formData });
    }

    await mutate("/api/bots");
    toast.success(`Bot "${name}" added successfully!`);
    setIsSubmitting(false);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 max-w-xl mx-auto pt-12 px-6 pb-24 w-full">
        <div className="mb-12">
          <nav className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">
            <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
            <span>/</span>
            <span className="text-foreground">Add New Bot</span>
          </nav>
          <h1 className="text-4xl font-black tracking-tight italic uppercase">Connect New Bot</h1>
          <p className="text-muted-foreground font-medium mt-2">
            Link your Discord bot to the ZBR dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-surface-20 backdrop-blur-sm p-10 rounded-3xl border border-border-50 shadow-2xl">
          <div className="space-y-3">
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Bot Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., ZBR Assistant"
              className="w-full px-5 py-4 bg-background/50 border border-border-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary transition-all font-bold text-sm"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Bot Token</label>
            <input 
              type="password" 
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="••••••••••••••••••••••••••••••••"
              className="w-full px-5 py-4 bg-background/50 border border-border-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary transition-all font-mono text-sm"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Import Existing Project (Optional)</label>
            <input 
              type="file" 
              accept=".zip"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full px-5 py-4 bg-background/50 border border-border-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary transition-all font-bold text-sm"
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full px-6 py-4 bg-primary text-accent-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center space-x-3 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>CONNECTING...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span>ADD BOT TO FLEET</span>
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
  }