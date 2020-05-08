![npm](https://img.shields.io/npm/v/remark-lint-code-block-syntax?style=flat-square)

# remark-lint-code-block-syntax

A remark-lint rule to check language syntax in a code block.

## Install

```console
$ npm install remark remark-lint-code-block-syntax
```

## Usage

```console
$ npx remark -u remark-lint-code-block-syntax
docs/config.md
  32:1-32:4  warning  Invalid JSON: Unexpected token a in JSON at position 128  code-block-syntax  remark-lint
```
