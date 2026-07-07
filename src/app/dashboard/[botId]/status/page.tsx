"use client";

import { use, useState, useEffect } from "react";
import { toast } from "sonner";

export default function StatusTab({
  params: paramsPromise,
}: {
  params: Promise<{ botId: string }>;
}) {
  const { botId } = use(paramsPromise);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState("online");
  const [activityType, setActivityType] = useState("playing");
  const [activityName, setActivityName] = useState("");
  const [isLoggingEnabled, setIsLoggingEnabled] = useState(false);

  useEffect(() => {
    fetch(`/api/bots/${botId}/status`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status) {
          setStatus(data.status);
          setActivityType(data.activity?.type || "playing");
          setActivityName(data.activity?.name || "");
          setIsLoggingEnabled(data.logging || false);
        }
      });
  }, [botId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const statusData = {
      status,
      activityType,
      activityName,
      isLoggingEnabled,
    };

    await fetch(`/api/bots/${botId}/status`, {
      method: "POST",
      body: JSON.stringify(statusData),
    });

    setIsSaving(false);
    toast.success("Bot status and activity updated!");
  };

  const statusOptions = [
    { value: "online", label: "Online", color: "bg-green-500" },
    { value: "idle", label: "Idle", color: "bg-yellow-500" },
    { value: "dnd", label: "Do Not Disturb", color: "bg-red-500" },
    { value: "invisible", label: "Invisible", color: "bg-gray-500" },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-bold mb-2 italic uppercase">Bot Status</h2>
        <p className="text-muted-foreground text-sm font-medium">
          Control how your bot appears to other users on Discord.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-10 max-w-2xl">
        <div className="space-y-4">
          <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
            Presence Status
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.isArray(statusOptions)
              ? statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatus(opt.value)}
                    className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border transition-all font-bold text-xs ${
                      status === opt.value
                        ? "bg-primary-10 border-primary text-primary"
                        : "bg-surface-30 border-border-50 text-muted-foreground hover:border-border"
                    }`}
                  >
                    <div
                      className={`h-2 w-2 rounded-full ${opt.color} shadow-sm`}
                    ></div>
                    <span>{opt.label}</span>
                  </button>
                ))
              : null}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              Activity Type
            </label>
            <div className="relative">
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className="w-full px-4 py-3 bg-surface-50 backdrop-blur-sm border border-border-50 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer transition-all"
              >
                <option value="playing">Playing</option>
                <option value="streaming">Streaming</option>
                <option value="listening">Listening</option>
                <option value="watching">Watching</option>
                <option value="competing">Competing</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              Activity Name
            </label>
            <input
              type="text"
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              placeholder="e.g., with commands"
              className="w-full px-4 py-3 bg-surface-50 backdrop-blur-sm border border-border-50 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
        </div>

        <div className="p-6 bg-surface-30 rounded-3xl border border-border-50 space-y-4">
          <h3 className="text-[10px] font-black italic uppercase tracking-widest text-primary/80">
            Diagnostic Logging
          </h3>
          <div
            className="flex items-center justify-between group cursor-pointer"
            onClick={() => setIsLoggingEnabled(!isLoggingEnabled)}
          >
            <div>
              <p className="font-bold text-sm">Enable Logging</p>
              <p className="text-[10px] text-muted-foreground font-medium">
                Record command usage and system errors.
              </p>
            </div>
            <div
              className={`h-6 w-11 rounded-full relative transition-colors duration-300 ${isLoggingEnabled ? "bg-primary" : "bg-muted"}`}
            >
              <div
                className={`absolute top-1 h-4 w-4 bg-accent-foreground rounded-full shadow-sm transition-all duration-300 ${isLoggingEnabled ? "right-1" : "left-1"}`}
              ></div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-border-50">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-4 bg-primary text-accent-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center space-x-3 active:scale-[0.98]"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>SAVING...</span>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>SAVE CHANGES</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
