"use client";

import Link from "next/link";
import { useState, useEffect, use } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useSWRConfig } from "swr";
import hljs from "highlight.js/lib/core";
import "highlight.js/styles/atom-one-dark.css";
import zbrLanguage from "@/lib/zbr-highlight";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});
import {
  ZBR_LANGUAGE_CONFIG,
  ZBR_TOKENS_PROVIDER,
  ZBR_THEME,
} from "@/lib/zbr-monaco";
import { getZBRCompletions } from "@/lib/zbr-completions";

hljs.registerLanguage("zbr", zbrLanguage);

export default function CommandEditor({
  params: paramsPromise,
}: {
  params: Promise<{ botId: string; commandId: string }>;
}) {
  const { botId, commandId } = use(paramsPromise);
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const isNew = commandId === "new";
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState("prefix");
  const [saving, setSaving] = useState(false);
  const derivedFilename =
    (name || "script").toLowerCase().replace(/\s+/g, "-") + ".zbr";

  const [scope, setScope] = useState("guild");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<
    { name: string; description: string; type: string; required: boolean }[]
  >([]);

  useEffect(() => {
    if (type === "interaction" && !trigger.startsWith("onInteraction{")) {
      setTrigger("onInteraction{ }");
    }
  }, [type]);

  useEffect(() => {
    const draft = localStorage.getItem(`zbr-draft-${commandId}`);
    if (draft) {
      setCode(draft);
    } else if (!isNew) {
      fetch(`/api/bots/${botId}/commands?id=${commandId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setName(data.name || "");
            setTrigger(data.trigger || "");
            setCode(data.body || "");
            setType(data.type || "prefix");
            setScope(data.scope || "guild");
            setDescription(data.description || "");
            if (data.options) setOptions(JSON.parse(data.options));
          }
        });
    }
  }, [botId, commandId, isNew]);

  const handleCodeChange = (val: string | undefined) => {
    const newCode = val || "";
    setCode(newCode);
    localStorage.setItem(`zbr-draft-${commandId}`, newCode);
  };

  function handleBeforeMount(monaco: typeof import("monaco-editor")) {
    if (monaco.languages.getLanguages().some((l) => l.id === "zbr")) return;
    monaco.languages.register({ id: "zbr" });
    monaco.languages.setLanguageConfiguration("zbr", ZBR_LANGUAGE_CONFIG);
    monaco.languages.setMonarchTokensProvider("zbr", ZBR_TOKENS_PROVIDER);
    monaco.editor.defineTheme("zbr-dark", ZBR_THEME);
    monaco.languages.registerCompletionItemProvider("zbr", {
      triggerCharacters: ["Z"],
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        if (!word.word.startsWith("Z")) return { suggestions: [] };
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };
        return getZBRCompletions(monaco, range);
      },
    });
  }

  const commandTypes = [
    { value: "prefix", label: "Prefix" },
    { value: "slash", label: "Slash" },
    { value: "sub-slash", label: "Sub-Slash" },
    { value: "interaction", label: "Interaction" },
    { value: "event", label: "Event" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Basic required fields
    if (!name || !trigger) {
      toast.error("Name and Trigger are required");
      return;
    }

    // 2. Type-specific validation
    if (type === "slash" || type === "sub-slash") {
      if (options.some((opt) => !opt.name || !opt.description)) {
        toast.error("All options must have a name and description");
        return;
      }
    } else if (type === "interaction") {
      const isValid =
        trigger === "onInteraction" ||
        (trigger.startsWith("onInteraction{") && trigger.endsWith("}"));
      if (!isValid) {
        toast.error(
          "Interaction trigger must be 'onInteraction' or in the format: onInteraction{...}",
        );
        return;
      }
    } else if (type === "event") {
      if (!trigger.startsWith("on")) {
        toast.error("Event trigger must start with 'on'");
        return;
      }
    }

    setSaving(true);

    const method = isNew ? "POST" : "PATCH";
    const url = isNew
      ? `/api/bots/${botId}/commands`
      : `/api/bots/${botId}/commands/${commandId}`;

    const payload: any = {
      name,
      trigger,
      body: code,
      type,
      filename: derivedFilename,
    };
    if (type === "slash" || type === "sub-slash") {
      payload.scope = scope;
      payload.description = description;
      payload.options = JSON.stringify(options);
    }

    await fetch(url, {
      method: method,
      body: JSON.stringify(payload),
    });

    localStorage.removeItem(`zbr-draft-${commandId}`);
    toast.success(isNew ? "Command created successfully!" : "Changes saved!");
    setSaving(false);

    mutate(`/api/bots/${botId}/commands`);

    router.push(`/dashboard/${botId}/commands`);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold italic uppercase">
            {isNew ? "Create Command" : "Edit Command"}
          </h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">
            Configure your command details.
          </p>
        </div>
        <Link
          href={`/dashboard/${botId}/commands`}
          className="px-4 py-2 bg-surface border border-border-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all flex items-center space-x-2"
        >
          <span>Back</span>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Command Name"
            className="w-full px-4 py-3 bg-surface/50 border border-border-50 rounded-xl font-bold text-sm"
            required
          />
          <input
            type="text"
            value={trigger}
            onChange={(e) => setTrigger(e.target.value)}
            placeholder="Trigger"
            className="w-full px-4 py-3 bg-surface/50 border border-border-50 rounded-xl font-bold text-sm"
            required
          />
        </div>

        <div className="space-y-3">
          <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {commandTypes.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`px-3 py-3 rounded-xl border font-bold text-[10px] uppercase tracking-widest ${type === t.value ? "bg-primary/10 border-primary text-primary" : "bg-surface/30 border-border-50 text-muted-foreground"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {(type === "slash" || type === "sub-slash") && (
          <div className="space-y-4 p-6 bg-surface/20 rounded-xl border border-border-50">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground">
                  Scope
                </label>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  className="w-full px-4 py-3 bg-surface/50 border border-border-50 rounded-xl text-sm font-bold"
                >
                  <option value="guild">Guild</option>
                  <option value="global">Global</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Command description"
                  className="w-full px-4 py-3 bg-surface/50 border border-border-50 rounded-xl text-sm font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Options
              </label>
              {options.map((opt, i) => (
                <div
                  key={i}
                  className="flex gap-2 items-center bg-surface/30 p-2 rounded-lg"
                >
                  <input
                    type="text"
                    placeholder="Name"
                    value={opt.name}
                    onChange={(e) =>
                      setOptions(
                        options.map((o, idx) =>
                          idx === i ? { ...o, name: e.target.value } : o,
                        ),
                      )
                    }
                    className="flex-1 px-3 py-2 bg-surface border border-border-50 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Desc"
                    value={opt.description}
                    onChange={(e) =>
                      setOptions(
                        options.map((o, idx) =>
                          idx === i ? { ...o, description: e.target.value } : o,
                        ),
                      )
                    }
                    className="flex-1 px-3 py-2 bg-surface border border-border-50 rounded-lg text-xs"
                  />
                  <select
                    value={opt.type}
                    onChange={(e) =>
                      setOptions(
                        options.map((o, idx) =>
                          idx === i ? { ...o, type: e.target.value } : o,
                        ),
                      )
                    }
                    className="px-3 py-2 bg-surface border border-border-50 rounded-lg text-xs"
                  >
                    {[
                      "string",
                      "integer",
                      "boolean",
                      "user",
                      "channel",
                      "role",
                      "number",
                    ].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <label className="flex items-center text-xs gap-1 font-bold text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={opt.required}
                      onChange={(e) =>
                        setOptions(
                          options.map((o, idx) =>
                            idx === i
                              ? { ...o, required: e.target.checked }
                              : o,
                          ),
                        )
                      }
                    />{" "}
                    Required
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setOptions(options.filter((_, idx) => idx !== i))
                    }
                    className="text-red-500 font-bold px-2"
                  >
                    X
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setOptions([
                    ...options,
                    {
                      name: "",
                      description: "",
                      type: "string",
                      required: false,
                    },
                  ])
                }
                className="w-full py-2 bg-primary/20 text-primary rounded-lg text-xs font-black uppercase tracking-widest hover:bg-primary/30"
              >
                + Add Option
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Command Body
          </label>
          <div
            className="bg-[#282c34] border border-border-50 rounded-2xl shadow-2xl"
            style={{ overflow: "visible" }}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-border-50 bg-surface-20 rounded-t-2xl">
              <div className="flex items-center">
                <div className="flex space-x-1.5 mr-4">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-500"></div>
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
                </div>
                <p className="text-[10px] font-black text-muted-foreground uppercase">
                  {derivedFilename}
                </p>
              </div>
            </div>
            <MonacoEditor
              height="600px"
              language="zbr"
              theme="zbr-dark"
              value={code}
              onChange={handleCodeChange}
              beforeMount={handleBeforeMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                wordWrap: "on",
                automaticLayout: true,
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                fixedOverflowWidgets: false,
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          onClick={handleSubmit}
          disabled={saving}
          className="w-full py-4 bg-primary text-accent-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all"
        >
          {saving ? "SAVING..." : isNew ? "CREATE COMMAND" : "SAVE CHANGES"}
        </button>
      </form>
    </div>
  );
}
