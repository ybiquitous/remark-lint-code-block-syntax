[![npm](https://img.shields.io/npm/v/remark-lint-code-block-syntax?style=flat-square)](https://www.npmjs.com/package/remark-lint-code-block-syntax)

# remark-lint-code-block-syntax

A remark-lint rule to check language syntax in a code block.

## Supported languages

- JavaScript
- JSON
- YAML
- CSS

## Install

```console
$ npm install remark-lint-code-block-syntax
```

## Usage

Via a command-line argument:

```console
$ remark --use remark-lint-code-block-syntax
docs/config.md
  32:1-32:4  warning  Invalid JSON: Unexpected token a in JSON at position 128  code-block-syntax  remark-lint
```

Via a configuration file:

```json
{
  "plugins": ["remark-lint-code-block-syntax"]
}
```
