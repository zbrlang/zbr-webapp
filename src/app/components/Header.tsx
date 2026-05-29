"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSession, signOut } from "next-auth/react";
import ConfirmationModal from "./ConfirmationModal";

export default function Header() {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const user = session?.user;
  const username = user?.name || "User";
  const avatar = user?.image;
  const initials = username.substring(0, 2).toUpperCase();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return (
    <>
      <header className="flex items-center justify-between px-6 py-4 border-b border-border-50 bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="h-10 w-10">
            <img src="/ZBR_icon.png" alt="ZBR Logo" className="h-full w-full object-contain" />
          </Link>
          <div className="flex flex-col">
            <p className="font-bold leading-none mb-1 text-sm tracking-tight">{username}</p>
            <div className="flex items-center space-x-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_6px_#22c55e]"></div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active</p>
            </div>
          </div>
        </div>
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="group flex items-center space-x-2 px-3 py-2 bg-surface-30 hover:bg-surface/60 rounded-xl transition-all text-xs font-black uppercase tracking-widest border border-border-50 active:scale-95"
          >
            {avatar ? (
              <img src={avatar} alt={username} className="h-4 w-4 rounded-full" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.533 1.533 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.533 1.533 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            )}
            <span className="hidden sm:inline">Settings</span>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-background border border-border-50 rounded-2xl shadow-2xl py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[100]">
              <div className="px-4 py-3 border-b border-border-50 mb-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Signed in as</p>
                <div className="flex items-center space-x-2">
                  <div className="h-6 w-6 rounded-lg bg-primary-20 flex items-center justify-center text-[10px] font-black text-primary border border-primary/20">
                    {avatar ? <img src={avatar} alt={username} className="h-full w-full rounded-lg object-cover" /> : initials}
                  </div>
                  <p className="text-sm font-bold truncate tracking-tight">{username}</p>
                </div>
              </div>
              
              <Link 
                href="/dashboard/profile"
                className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-primary-10 transition-colors flex items-center space-x-3 group uppercase tracking-wider"
                onClick={() => setIsDropdownOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span>Profile</span>
              </Link>
              
              <Link 
                href="/dashboard/settings"
                className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-primary-10 transition-colors flex items-center space-x-3 group uppercase tracking-wider"
                onClick={() => setIsDropdownOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.533 1.533 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.533 1.533 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                <span>Settings</span>
              </Link>

              <div className="h-px bg-border/50 my-2 mx-2"></div>
              
              <button 
                onClick={() => {
                  setIsLogoutModalOpen(true);
                  setIsDropdownOpen(false);
                }}
                className="w-full px-4 py-2.5 text-left text-xs font-bold text-destructive hover:bg-destructive/10 transition-colors flex items-center space-x-3 group uppercase tracking-wider"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-destructive/70 group-hover:text-destructive transition-colors" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <ConfirmationModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Logout"
        description="Are you sure you want to log out of your ZBR account?"
        confirmText="Logout"
      />
    </>
  );
}
