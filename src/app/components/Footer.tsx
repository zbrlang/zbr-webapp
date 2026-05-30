"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full py-8 px-8 border-t border-border/40 bg-background/50 backdrop-blur-md mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-black tracking-tighter uppercase italic">ZBR</span>
          <span className="text-[10px] text-muted-foreground font-medium hidden sm:inline">• The scripting language for discord bots.</span>
        </div>

        <div className="flex items-center space-x-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          <Link href="https://zbrlang.vercel.app/" className="hover:text-primary transition-colors">Website</Link>
          <Link href="https://zbrlang.vercel.app/docs" className="hover:text-primary transition-colors">Docs</Link>
          <Link href="http://zbrlang.vercel.app/docs/guides/webapp-getting-started" className="hover:text-primary transition-colors">Help</Link>
          <Link href="https://github.com/zbrlang" className="hover:text-primary transition-colors">Github</Link>
          <span className="h-3 w-px bg-border/50"></span>
          <span className="text-foreground/40 font-medium normal-case tracking-normal italic">© 2026 zbrlang</span>
        </div>
      </div>
    </footer>
  );
}