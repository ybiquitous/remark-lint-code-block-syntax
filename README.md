[![npm](https://img.shields.io/npm/v/remark-lint-code-block-syntax?style=flat-square)](https://www.npmjs.com/package/remark-lint-code-block-syntax)
[![node](https://img.shields.io/node/v/remark-lint-code-block-syntax.svg?style=flat-square)](https://github.com/ybiquitous/remark-lint-code-block-syntax)

# remark-lint-code-block-syntax

A [remark-lint](https://github.com/remarkjs/remark-lint) rule to check language syntax in a code block.

## Supported languages

- JavaScript
- JSON
- JSONC
- YAML
- CSS

## Install

```shell
npm install remark-lint-code-block-syntax
```

## Usage

Via a command-line argument:

```sh-session
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

Via JavaScript API:

```js
import { reporter } from "vfile-reporter";
import { remark } from "remark";
import remarkLintCodeBlockSyntax from "remark-lint-code-block-syntax";

main();

async function main() {
  const code = `
\`\`\`js
const sum = 1 +;
\`\`\`
`;
  const file = await remark().use(remarkLintCodeBlockSyntax).process(code);
  console.error(reporter(file));
}
```

## Development

This section is for developers or maintainers.

### Releasing

1. Check out the latest code on your local repository
2. Run `npm version <next_version>`
3. Run `git push --follow-tags`
4. Start [editing a new GitHub release](https://github.com/ybiquitous/remark-lint-code-block-syntax/releases/new)
5. Chose the new tag
6. Click **Generate release notes**
7. Remove trivial change items from the release notes
8. Click **Save draft**
9. Double-check the draft release
10. Click **Publish release** if you find no problems (GitHub Actions will start publishing automatically)
