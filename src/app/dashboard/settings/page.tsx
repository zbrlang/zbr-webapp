"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ConfirmationModal from "../../components/ConfirmationModal";

export default function GlobalSettingsPage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    const html = document.getElementById("root-html");
    if (savedTheme === "dark") {
      html?.classList.add("dark");
      setIsDarkMode(true);
    } else {
      html?.classList.remove("dark");
      setIsDarkMode(false);
    }
  }, []);

  const toggleTheme = () => {
    const html = document.getElementById("root-html");
    if (html) {
      const newDark = !isDarkMode;
      if (newDark) {
        html.classList.add("dark");
        localStorage.setItem("theme", "dark");
        toast.info("Dark mode enabled");
      } else {
        html.classList.remove("dark");
        localStorage.setItem("theme", "light");
        toast.info("Light mode enabled");
      }
      setIsDarkMode(newDark);
    }
  };

  const handleDeleteAccount = () => {
    toast.error("Account deleted permanently");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto pt-12 px-8 pb-12 w-full">
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="hover:text-primary transition-colors"
            >
              Dashboard
            </button>
            <span>/</span>
            <span className="text-foreground">Settings</span>
          </nav>
          <h1 className="text-4xl font-black tracking-tight italic uppercase">
            Account Settings
          </h1>
        </div>

        <div className="bg-surface-20 backdrop-blur-sm p-8 rounded-3xl border border-border-50 shadow-xl">
          <div className="space-y-12">
            <section className="space-y-6">
              <h3 className="text-xs font-black italic uppercase tracking-widest text-primary/80">
                General Preferences
              </h3>
              <div className="space-y-4">
                <div
                  className="flex items-center justify-between p-5 bg-surface-30 rounded-2xl border border-border-50 cursor-pointer hover:border-primary/30 transition-all group"
                  onClick={toggleTheme}
                >
                  <div>
                    <p className="font-bold text-sm">Theme Appearance</p>
                    <p className="text-xs text-muted-foreground">
                      Currently using {isDarkMode ? "Dark" : "Light"} mode.
                    </p>
                  </div>
                  <div
                    className={`h-6 w-11 rounded-full relative transition-colors duration-300 ${isDarkMode ? "bg-primary" : "bg-muted"}`}
                  >
                    <div
                      className={`absolute top-1 h-4 w-4 bg-accent-foreground rounded-full shadow-sm transition-all duration-300 ${isDarkMode ? "right-1" : "left-1"}`}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-5 bg-surface-30 rounded-2xl border border-border-50 opacity-40 cursor-not-allowed">
                  <div>
                    <p className="font-bold text-sm">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">
                      Coming soon in production.
                    </p>
                  </div>
                  <div className="h-6 w-11 bg-muted rounded-full relative">
                    <div className="absolute left-1 top-1 h-4 w-4 bg-white/20 rounded-full shadow-sm"></div>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h3 className="text-xs font-black italic uppercase tracking-widest text-destructive">
                Danger Zone
              </h3>
              <div className="p-8 bg-destructive/5 rounded-3xl border border-destructive/20">
                <h4 className="font-bold text-sm mb-1 text-destructive">
                  Delete Account
                </h4>
                <p className="text-xs text-muted-foreground mb-8">
                  Permanently remove your account and all associated bot data.
                  This action is irreversible.
                </p>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="px-6 py-3 bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-white transition-all rounded-xl font-black text-[10px] uppercase tracking-widest"
                >
                  Delete My Account
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        description="This will permanently delete your ZBR account and all your bot configurations. Please type your username to confirm."
        confirmText="Permanently Delete"
        confirmValue="zbr#0001"
        isDanger={true}
      />
    </div>
  );
}
