"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const perms = ['Manage Bots', 'Create Commands', 'Use Variables', 'View Analytics', 'Billing Access'];

  const user = session?.user;
  const username = user?.name || "User";
  const avatar = user?.image;
  const email = user?.email || "No email available";
  const initials = username.substring(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto pt-12 px-8 pb-12 w-full">
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">
            <button onClick={() => router.push("/dashboard")} className="hover:text-primary transition-colors">Dashboard</button>
            <span>/</span>
            <span className="text-foreground">Profile</span>
          </nav>
          <h1 className="text-4xl font-black tracking-tight italic uppercase">User Profile</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Avatar and Basic Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-surface-20 backdrop-blur-sm p-8 rounded-3xl border border-border-50 shadow-xl flex flex-col items-center text-center">
              <div className="h-32 w-32 rounded-full bg-primary-20 flex items-center justify-center text-primary text-4xl font-black border-4 border-surface shadow-2xl mb-6 relative group overflow-hidden">
                {avatar ? (
                  <img src={avatar} alt={username} className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
                <div className="absolute bottom-1 right-1 h-6 w-6 bg-green-500 border-4 border-surface rounded-full"></div>
              </div>
              <h2 className="text-2xl font-black">{username}</h2>
              <p className="text-muted-foreground font-bold text-sm">{email}</p>
              
              <div className="w-full h-px bg-border/50 my-6"></div>
              
              <div className="w-full space-y-4 text-left">
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Account ID</p>
                  <p className="text-[10px] font-mono font-bold break-all opacity-70">{(user as any)?.id || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Current Plan</p>
                  <span className="px-2 py-1 bg-primary-10 text-primary text-[10px] font-black rounded uppercase tracking-wider border border-primary/20">Free Tier</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Settings */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-surface-20 backdrop-blur-sm p-8 rounded-3xl border border-border-50 shadow-xl">
              <h3 className="text-xs font-black italic uppercase tracking-widest text-primary/80 mb-8">Profile Information</h3>
              
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Username</label>
                    <div className="px-4 py-3 bg-surface-50 border border-border-50 rounded-xl font-bold text-sm">{username}</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Email</label>
                    <div className="px-4 py-3 bg-surface-50 border border-border-50 rounded-xl font-bold text-sm">{email}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Status</label>
                  <div className="px-4 py-4 bg-surface-50 border border-border-50 rounded-xl font-medium text-sm text-muted-foreground">
                    Connected via Discord OAuth.
                  </div>
                </div>

                <div className="pt-6 border-t border-border-50">
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Account Permissions (Read-only)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {Array.isArray(perms) ? perms.map(perm => (
                      <div key={perm} className="flex items-center space-x-2 text-xs font-bold p-3 bg-surface-30 rounded-lg border border-border-50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>{perm}</span>
                      </div>
                    )) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
