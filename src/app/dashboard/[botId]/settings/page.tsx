"use client";

import { use, useState, useEffect } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import ConfirmationModal from "../../../components/ConfirmationModal";
import ExportGuideModal from "../../../components/ExportGuideModal";

export default function SettingsTab({
  params: paramsPromise,
}: {
  params: Promise<{ botId: string }>;
}) {
  const { botId } = use(paramsPromise);
  const [showToken, setShowToken] = useState(false);
  const [botToken, setBotToken] = useState("");
  const [guildId, setGuildId] = useState("");
  const [isLoginEnabled, setIsLoginEnabled] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSecuritySaving, setIsSecuritySaving] = useState(false);

  // Load saved state from Firestore
  useEffect(() => {
    fetch(`/api/bots/${botId}/settings`)
      .then(res => res.json())
      .then(data => {
        setBotToken(data.botToken || "");
        setGuildId(data.guildId || "");
        setIsLoginEnabled(data.isLoginEnabled ?? true);
      });
  }, [botId]);

  const handleSaveConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const res = await fetch(`/api/bots/${botId}/settings`, {
      method: 'POST',
      body: JSON.stringify({ botToken, guildId }),
    });
    const { tokenError } = await res.json();
    
    if (tokenError) {
        toast.error("The token appears to be invalid.");
    } else {
        toast.success("Connection settings updated successfully");
    }
    setIsSaving(false);
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSecuritySaving(true);
    
    await fetch(`/api/bots/${botId}/settings`, {
      method: 'POST',
      body: JSON.stringify({ isLoginEnabled }),
    });
    
    toast.success("Security settings updated");
    setIsSecuritySaving(false);
  };

  const handleExport = () => {
    window.open(`/api/bots/${botId}/export`);
    setIsExportModalOpen(false);
  };

  const { mutate } = useSWRConfig();
  const handleDeleteBot = async () => {
    // Perform server operation
    await fetch(`/api/bots/${botId}`, {
      method: 'DELETE',
    });
    
    // Update local cache: remove the deleted bot after server confirmation
    await mutate("/api/bots", (bots: any[] = []) => bots.filter(b => b.id !== botId), { revalidate: false });
    
    toast.error("Bot deleted permanently");
    // Redirect to dashboard
    window.location.href = "/dashboard";
  };
  
  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2 italic uppercase">Connection Settings</h2>
          <p className="text-muted-foreground text-sm font-medium">Configure your bot's core identity and API access.</p>
        </div>
        
        <form onSubmit={handleSaveConnection} className="space-y-8 max-w-2xl bg-surface-30 p-8 rounded-3xl border border-border-50">
          <div className="space-y-3">
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Bot Token</label>
            <div className="relative">
              <input 
                type={showToken ? "text" : "password"} 
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                className="w-full px-5 py-4 bg-background/50 backdrop-blur-sm border border-border-50 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary pr-12 transition-all"
                placeholder="••••••••••••••••••••••••••••••••"
              />
              <button 
                type="button" 
                onClick={() => setShowToken(!showToken)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-2"
                title={showToken ? "Hide Token" : "Show Token"}
              >
                {showToken ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.476 3 10 3a9.997 9.997 0 00-4.59 1.123L3.707 2.293zM10 13a3 3 0 01-2.977-2.63l4.403 4.403A2.97 2.97 0 0110 13z" clipRule="evenodd" />
                    <path d="M12.438 11.024L9.472 8.059A3 3 0 0011.025 11.024z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 12a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.524 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.066 7-9.542 7S.458 14.057.458 10z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground italic font-bold">
              Your bot token is used to authenticate with Discord's API. Never share this with anyone.
            </p>
          </div>
          
          <div className="space-y-3">
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Guild ID (Optional)</label>
            <input 
              type="text" 
              value={guildId}
              onChange={(e) => setGuildId(e.target.value)}
              className="w-full px-5 py-4 bg-background/50 backdrop-blur-sm border border-border-50 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder="e.g., 123456789012345678"
            />
            <p className="text-[10px] text-muted-foreground italic font-bold">
              Specify a server ID to limit your bot's operation to a single guild.
            </p>
          </div>
          
          <div className="pt-4 border-t border-border-50">
            <button 
              type="submit" 
              disabled={isSaving}
              className="px-8 py-4 bg-primary text-accent-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Update Connection"}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2 italic uppercase">Advanced Settings</h2>
          <p className="text-muted-foreground text-sm font-medium">Security, Accessibility, and fine-tuned control.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Security & Accessibility */}
          <div className="space-y-6">
            <div className="bg-surface-30 p-6 rounded-3xl border border-border-50 space-y-6">
              <h3 className="text-xs font-black italic uppercase tracking-widest text-primary/80">Security & Login</h3>
              <div className="flex items-center justify-between group">
                <div>
                  <p className="font-bold text-sm">Enable Login</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Require authentication for dashboard access.</p>
                </div>
                <button 
                  onClick={() => setIsLoginEnabled(!isLoginEnabled)}
                  className={`h-6 w-11 rounded-full relative transition-colors duration-300 ${isLoginEnabled ? "bg-primary" : "bg-muted"}`}
                >
                  <div className={`absolute top-1 h-4 w-4 bg-accent-foreground rounded-full shadow-sm transition-all duration-300 ${isLoginEnabled ? "right-1" : "left-1"}`}></div>
                </button>
              </div>
              <button 
                onClick={handleSaveSecurity}
                disabled={isSecuritySaving}
                className="w-full py-3 bg-surface border border-border-50 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-border/20 transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
              >
                {isSecuritySaving ? (
                  <>
                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Security Settings</span>
                )}
              </button>
            </div>

            <div className="bg-surface-30 p-6 rounded-3xl border border-border-50">
              <h3 className="text-xs font-black italic uppercase tracking-widest text-primary/80 mb-4">Accessibility</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between opacity-50 cursor-not-allowed">
                  <div>
                    <p className="font-bold text-sm">Screen Reader Support</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Enhanced labels for screen readers.</p>
                  </div>
                  <div className="h-6 w-11 bg-muted rounded-full relative">
                    <div className="absolute left-1 top-1 h-4 w-4 bg-white/20 rounded-full shadow-sm"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-surface-30 p-6 rounded-3xl border border-border-50">
              <h3 className="text-xs font-black italic uppercase tracking-widest text-primary/80 mb-4">Data Management</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm">Export Project</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Download your bot configuration as a ZIP file.</p>
                  </div>
                  <button 
                    onClick={() => setIsExportModalOpen(true)}
                    className="px-4 py-2 bg-primary-10 text-primary border border-primary/20 hover:bg-primary hover:text-accent-foreground transition-all rounded-xl font-black text-[10px] uppercase tracking-widest"
                  >
                    Export
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-destructive/5 border border-destructive/20 p-8 rounded-3xl flex flex-col justify-between">
          <div>
            <h3 className="text-destructive font-black text-xs italic uppercase tracking-widest mb-4">Danger Zone</h3>
            <p className="text-muted-foreground text-sm font-medium mb-6">Once you delete a bot, there is no going back. All command data and variables will be purged.</p>
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={() => setIsDeleteModalOpen(true)}
              className="w-full px-6 py-4 bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-white transition-all rounded-2xl font-black text-xs uppercase tracking-widest"
            >
              Delete this Bot
            </button>
          </div>
          </div>
          </div>
          </section>
      <ExportGuideModal 
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onConfirm={handleExport}
      />
      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteBot}
        title="Delete Bot"
        description={`This will permanently delete bot ${botId}. All commands and variables associated with this bot will be lost.`}
        confirmText="Delete Permanently"
        confirmValue={botId}
        isDanger={true}
      />
    </div>
  );
}