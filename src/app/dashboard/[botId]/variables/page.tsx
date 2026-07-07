"use client";

import { use, useState } from "react";
import { toast } from "sonner";
import useSWR, { useSWRConfig } from "swr";
import { fetcher } from "@/lib/swr";
import ConfirmationModal from "../../../components/ConfirmationModal";

interface Variable {
  id: string;
  name: string;
  value: string;
}

export default function VariablesTab({
  params: paramsPromise,
}: {
  params: Promise<{ botId: string }>;
}) {
  const { botId } = use(paramsPromise);
  const { mutate } = useSWRConfig();
  const { data: variables = [] } = useSWR<Variable[]>(
    `/api/bots/${botId}/variables`,
    fetcher,
  );
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newValue, setNewValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editValue, setEditValue] = useState("");
  const [selectedVar, setSelectedVar] = useState<Variable | null>(null);

  const startEditing = (v: Variable) => {
    setEditingId(v.id);
    setEditName(v.name);
    setEditValue(v.value);
  };

  const handleAddVariable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    try {
      const response = await fetch(`/api/bots/${botId}/variables`, {
        method: "POST",
        body: JSON.stringify({ name: newName, value: newValue }),
      });
      if (!response.ok) throw new Error("Failed to create");

      setNewName("");
      setNewValue("");
      setIsAdding(false);
      toast.success("Variable created successfully!");
      await mutate(`/api/bots/${botId}/variables`, undefined, {
        revalidate: true,
      });
    } catch (e) {
      toast.error("Failed to create variable");
    }
  };

  const handleEditVariable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName || !editingId) return;

    try {
      const response = await fetch(
        `/api/bots/${botId}/variables/${editingId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ name: editName, value: editValue }),
        },
      );
      if (!response.ok) throw new Error("Failed to update");

      setEditingId(null);
      toast.success("Variable updated successfully!");
      await mutate(`/api/bots/${botId}/variables`, undefined, {
        revalidate: true,
      });
    } catch (e) {
      toast.error("Failed to update variable");
    }
  };

  const deleteVariable = async () => {
    if (!selectedVar) return;
    try {
      const response = await fetch(
        `/api/bots/${botId}/variables/${selectedVar.id}`,
        {
          method: "DELETE",
        },
      );
      if (!response.ok) throw new Error("Failed to delete");
      toast.error("Variable deleted");
      await mutate(`/api/bots/${botId}/variables`, undefined, {
        revalidate: true,
      });
    } catch (e) {
      toast.error("Failed to delete variable");
    } finally {
      setSelectedVar(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1 italic uppercase">
            Variables
          </h2>
          <p className="text-sm text-muted-foreground font-medium">
            Store and manage dynamic data for your bot.
          </p>
        </div>
        <button
          onClick={() => {
            setIsAdding(!isAdding);
            setEditingId(null);
          }}
          className="px-5 py-2.5 bg-primary text-accent-foreground rounded-xl font-black text-xs tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center space-x-2 italic uppercase"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{isAdding ? "Cancel" : "Add Variable"}</span>
        </button>
      </div>

      {isAdding && (
        <form
          onSubmit={handleAddVariable}
          className="bg-surface-50 border border-primary/20 p-6 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Variable Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., footer_text"
                className="w-full px-4 py-3 bg-background/50 border border-border-50 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary font-bold text-sm transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Value
              </label>
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="e.g., Welcome to the server!"
                className="w-full px-4 py-3 bg-background/50 border border-border-50 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary font-bold text-sm transition-all"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-primary-20 text-primary border border-primary/30 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-accent-foreground transition-all"
          >
            Create Variable
          </button>
        </form>
      )}

      {variables && variables.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {variables.map((v) => (
            <div
              key={v.id}
              className="bg-surface-30 border border-border-50 p-4 rounded-2xl transition-all"
            >
              {editingId === v.id ? (
                <form onSubmit={handleEditVariable} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        Name
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 bg-background/50 border border-border-50 rounded-lg focus:ring-1 focus:ring-primary font-bold text-xs transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        Value
                      </label>
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full px-3 py-2 bg-background/50 border border-border-50 rounded-lg focus:ring-1 focus:ring-primary font-bold text-xs transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary-20 text-primary border border-primary/30 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-accent-foreground transition-all"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 bg-surface border border-border-50 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-border/20 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div
                  className="flex items-center justify-between group cursor-pointer"
                  onClick={() => startEditing(v)}
                >
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                      {v.name}
                    </p>
                    <p className="font-bold text-sm font-mono truncate">
                      {v.value || (
                        <span className="italic font-normal text-muted-foreground/50">
                          empty
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVar(v);
                      }}
                      className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                      title="Delete Variable"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-surface-20 rounded-3xl border border-dashed border-border-50">
          <div className="h-16 w-16 bg-primary-10 rounded-2xl flex items-center justify-center text-primary mb-6 border border-primary/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">No Variables</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Click 'Add Variable' to start storing data.
          </p>
        </div>
      )}
      <ConfirmationModal
        isOpen={!!selectedVar}
        onClose={() => setSelectedVar(null)}
        onConfirm={deleteVariable}
        title="Delete Variable"
        description={`Are you sure you want to delete the variable "${selectedVar?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isDanger={true}
      />
    </div>
  );
}
