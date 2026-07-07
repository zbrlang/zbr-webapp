import * as monaco from "monaco-editor";

// Import the JSON data
import snippetsData from "./snippets.json";

export function getZBRCompletions(
  monacoInstance: typeof monaco,
  range: monaco.IRange,
) {
  const completions: monaco.languages.CompletionItem[] = [];

  // Function completions
  Object.entries(snippetsData).forEach(([key, snippet]: any) => {
    if (
      key.startsWith("#") ||
      (snippet.prefix && snippet.prefix.startsWith("#"))
    )
      return;
    completions.push({
      label: key,
      kind: monacoInstance.languages.CompletionItemKind.Function,
      insertText: snippet.body.join("\n"),
      insertTextRules:
        monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: snippet.description,
      range: range,
    });
  });

  return { suggestions: completions };
}
