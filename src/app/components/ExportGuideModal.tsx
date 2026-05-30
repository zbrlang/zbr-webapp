"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface ExportGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ExportGuideModal({ isOpen, onClose, onConfirm }: ExportGuideModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-lg max-h-[90vh] bg-surface border border-border-50 rounded-3xl p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto">
        <h3 className="text-2xl font-black mb-6 italic uppercase">Export Project</h3>
        
        <div className="text-left space-y-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            You are about to export your bot's configuration. To run your bot locally, follow these steps:
          </p>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Step 1: Install ZBR CLI</span>
              <div className="bg-background/50 border border-border-50 rounded-xl p-3 font-mono text-xs flex items-center justify-between group">
                <code>npm i -g @zbrlang/zbr</code>
                <button 
                  onClick={() => navigator.clipboard.writeText("npm i -g @zbrlang/zbr")}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-primary-10 rounded transition-all text-primary"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Step 2: Unzip & Initialize</span>
              <p className="text-xs text-muted-foreground italic">Unzip the downloaded file and open a terminal in that folder.</p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Step 3: Run the Bot</span>
              <div className="bg-background/50 border border-border-50 rounded-xl p-3 font-mono text-xs flex items-center justify-between group">
                <code>zbr run</code>
                <button 
                  onClick={() => navigator.clipboard.writeText("zbr run")}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-primary-10 rounded transition-all text-primary"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground font-medium italic pt-2">
            The ZBR runtime will handle the rest. Make sure your environment variables are configured in the project root.
          </p>
        </div>

        <div className="flex space-x-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest bg-surface border border-border-50 hover:bg-border/20 transition-all active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest bg-primary text-accent-foreground hover:bg-primary/90 transition-all active:scale-[0.98]"
          >
            Download ZIP
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
