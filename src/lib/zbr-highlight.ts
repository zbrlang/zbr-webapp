export default function (hljs: any) {
  return {
    name: "ZBR",
    aliases: ["zbr"],
    case_insensitive: false,
    contains: [
      hljs.COMMENT("//", "$"),

      {
        begin: /Z[a-zA-Z_][a-zA-Z0-9_]*\{/,
        beginScope: "title.function",
        end: /\}/,
        endScope: "punctuation",
        contains: ["self"],
        relevance: 10,
      },

      {
        begin: /on[a-zA-Z_][a-zA-Z0-9_]*\{/,
        beginScope: "tag",
        end: /\}/,
        endScope: "punctuation",
        contains: ["self"],
        relevance: 10,
      },

      {
        match: /^[ \t]*#(name|trigger|description|type|scope|option)\b/,
        scope: "keyword",
        relevance: 10,
      },

      { scope: "punctuation", match: /\{|\}/ },

      { scope: "keyword", match: /==|!=|>=|<=|>|<|\&\&|\|\||;/ },

      { scope: "string.escape", match: /\\{};\\]/ },
    ],
  };
}
