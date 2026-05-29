"use client";

import { useState, useEffect } from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText: string;
  confirmValue?: string; // The value user needs to type to confirm (e.g. username or ID)
  isDanger?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  confirmValue,
  isDanger = false,
}: ConfirmationModalProps) {
  const [inputValue, setInputValue] = useState("");

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

  if (!isOpen) return null;

  const canConfirm = !confirmValue || inputValue === confirmValue;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-surface border border-border-50 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <h3 className="text-2xl font-black mb-2 italic uppercase">{title}</h3>
        <p className="text-muted-foreground text-sm mb-6">{description}</p>

        {confirmValue && (
          <div className="mb-6 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              Type <span className="text-foreground select-all">{confirmValue}</span> to confirm
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full px-4 py-3 bg-background/50 border border-border-50 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary font-bold text-sm transition-all"
              placeholder={confirmValue}
            />
          </div>
        )}

        <div className="flex space-x-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest bg-surface border border-border-50 hover:bg-border/20 transition-all active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (canConfirm) {
                onConfirm();
                onClose();
              }
            }}
            disabled={!canConfirm}
            className={`flex-1 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-[0.98] ${
              isDanger
                ? "bg-destructive text-white hover:bg-destructive/90 disabled:opacity-30"
                : "bg-primary text-accent-foreground hover:bg-primary/90 disabled:opacity-30"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
