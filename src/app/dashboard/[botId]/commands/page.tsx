"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { use } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import useSWR, { useSWRConfig } from "swr";
import { fetcher } from "@/lib/swr";
import ConfirmationModal from "../../../components/ConfirmationModal";

export default function CommandsIndex({
  params: paramsPromise,
}: {
  params: Promise<{ botId: string }> | { botId: string };
}) {
  const { botId } = paramsPromise instanceof Promise ? use(paramsPromise) : paramsPromise;
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const { data: commands = [] } = useSWR(`/api/bots/${botId}/commands`, fetcher);
  const [selectedCmd, setSelectedCmd] = useState<{id: string, name: string} | null>(null);

  const handleDeleteCommand = async () => {
    if (selectedCmd) {
      const commandId = selectedCmd.id;

      try {
        await fetch(`/api/bots/${botId}/commands/${commandId}`, {
          method: 'DELETE',
        });
        toast.error(`Command "${selectedCmd.name}" deleted`);

        // Wait briefly for Firestore to propagate, then force re-fetch
        await new Promise(resolve => setTimeout(resolve, 500));
        await mutate(`/api/bots/${botId}/commands`, undefined, { revalidate: true });
      } catch (e) {
        toast.error("Failed to delete command");
      }
      setSelectedCmd(null);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold italic uppercase">Commands</h2>
          <p className="text-sm text-muted-foreground font-medium">Manage your bot's interaction and triggers.</p>
        </div>
        <Link
          href={`/dashboard/${botId}/commands/new`}
          className="px-5 py-2.5 bg-primary text-accent-foreground rounded-xl font-black text-xs tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center space-x-2 italic uppercase"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          <span>Create</span>
        </Link>
      </div>

      {/* Commands List */}
      <div className="grid grid-cols-1 gap-3">
        {Array.isArray(commands) && commands.length > 0 ? (
          commands.map((cmd: any) => (
            <div 
              key={cmd.id} 
              onClick={() => router.push(`/dashboard/${botId}/commands/${cmd.id}`)}
              className="bg-surface-30 backdrop-blur-sm rounded-2xl border border-border-50 p-5 flex items-center justify-between group hover:border-primary/30 transition-all cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground mb-1">{cmd.name}</h3>
                <p className="text-xs text-muted-foreground font-mono truncate flex items-center">
                  <span className="bg-primary-10 text-primary px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border border-primary/20 mr-3">{cmd.type}</span>
                  {cmd.trigger}
                </p>
              </div>
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all">
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedCmd(cmd); }}
                  className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                  title="Delete Command"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-surface-20 rounded-3xl border border-dashed border-border-50">
            <div className="h-16 w-16 bg-primary-10 rounded-2xl flex items-center justify-center text-primary mb-6 border border-primary/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">No Commands</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">Click '+ Create' to add your first command.</p>
          </div>
        )}
      </div>

      <ConfirmationModal 
        isOpen={!!selectedCmd}
        onClose={() => setSelectedCmd(null)}
        onConfirm={handleDeleteCommand}
        title="Delete Command"
        description={`Are you sure you want to delete the command "${selectedCmd?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isDanger={true}
      />
    </div>
  );
}
