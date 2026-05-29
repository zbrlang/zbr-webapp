import type * as Monaco from 'monaco-editor'

export const ZBR_LANGUAGE_ID = 'zbr'

export const ZBR_LANGUAGE_CONFIG: Monaco.languages.LanguageConfiguration = {
  comments: { lineComment: '//' },
  wordPattern: /Z[a-zA-Z0-9_]*|[a-zA-Z0-9_]+/,
  autoClosingPairs: [
    { open: '{', close: '}', notIn: ['string', 'comment'] },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
}

export const ZBR_TOKENS_PROVIDER: Monaco.languages.IMonarchLanguage = {
  tokenizer: {
    root: [
      [/\/\/.*$/, 'comment.line.double-slash.zbr'],
      [/\b(Z)([a-zA-Z0-9_]+)\b(?=\{)/, ['keyword.other.zbr', 'entity.name.function.zbr']],
      [/==|!=|>=|<=|>|</, 'keyword.operator.comparison.zbr'],
      [/&&|\|\|/, 'keyword.operator.logical.zbr'],
      [/\\[{};\\]/, 'constant.character.escape.zbr'],
      [/[{}]/, 'meta.brace.curly.zbr'],
      [/;/, 'keyword.other.zbr'],
    ],
  },
}

export const ZBR_THEME: Monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'keyword.other.zbr', foreground: 'bd93f9' },
    { token: 'entity.name.function.zbr', foreground: 'f1fa8c' },
    { token: 'meta.brace.curly.zbr', foreground: 'ff79c6' },
  ],
  colors: {
    'editor.background': '#282c34',
  },
}
