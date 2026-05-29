import Prism from 'prismjs';

// Define ZBR language for Prism
Prism.languages.zbr = {
    'comment': /\/\/.*$/,
    'string': {
        pattern: /(["'])(?:(?=(\\?))\2.)*?\1/,
        greedy: true
    },
    'keyword': /\b(Z[a-zA-Z0-9_]+|on[a-zA-Z0-9_]+|#name|#trigger|#description|#type|#scope|#option)\b/,
    'operator': /==|!=|>=|<=|>|<|&&|\|\|/,
    'punctuation': /[{};]/,
};
