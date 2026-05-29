"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

export default function LoginPage() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    await signIn("discord", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="p-12 bg-surface-20 backdrop-blur-xl rounded-[2.5rem] border border-border-50 w-full max-w-md shadow-2xl text-center">
        <div className="mb-12">
          <h1 className="text-5xl font-black tracking-tighter mb-4 italic uppercase">ZBR Dashboard</h1>
          <p className="text-muted-foreground font-medium text-sm">
            The next generation of Discord bot management.
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full px-8 py-5 bg-[#5865F2] text-white rounded-2xl hover:bg-[#4752C4] transition-all font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center space-x-4 shadow-xl shadow-[#5865F2]/20 disabled:opacity-50 active:scale-[0.98]"
          >
            {isLoggingIn ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037 19.736 19.736 0 00-4.885 1.515.069.069 0 00-.032.027C.533 9.048-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 01.077.01 10.366 10.366 0 00.372.292.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z" />
                </svg>
                <span>Sign in with Discord</span>
              </>
            )}
          </button>
        </div>
        
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-12 flex flex-col space-y-2 opacity-50">
        <p>Secure authentication powered by Discord</p>
        <div className="flex justify-center space-x-4">
          <a href="https://zbrlang.vercel.app/terms" className="hover:text-primary transition-colors">Terms</a>
          <a href="https://zbrlang.vercel.app/privacy" className="hover:text-primary transition-colors">Privacy</a>
        </div>
        </div>

      </div>
    </div>
  );
}