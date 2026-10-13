import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import { default as swc } from "@swc/core";
import * as yaml from "js-yaml";
import { default as postcss } from "postcss";
import { default as jsonc } from "jsonc-parser";
import { default as JSON5 } from "json5";
import { parseDiff } from "./lib/parse-diff.js";

const remarkLintCodeBlockSyntax = lintRule("remark-lint:code-block-syntax", codeSyntax);
export default remarkLintCodeBlockSyntax;

function codeSyntax(tree, file) {
  const supportedLangs = ["js", "javascript", "json", "jsonc", "json5", "yaml", "yml", "css", "diff"];
  const test = supportedLangs.map((lang) => ({ type: "code", lang }));

  visit(tree, test, visitor);

  function visitor(node) {
    for (const { language, reason, position } of checkSyntax(node)) {
      const message = language === "Diff" ? reason : `Invalid ${language}: ${reason}`;

      file.message(message, position ?? node);
    }
  }

  function checkSyntax(node) {
    switch (node.lang) {
      case "js":
      case "javascript": {
        const reason = checkJs(node.value);
        return reason ? [{ language: "JavaScript", reason }] : [];
      }
      case "json": {
        const reason = checkJson(node.value);
        return reason ? [{ language: "JSON", reason }] : [];
      }
      case "jsonc": {
        const reason = checkJsonc(node.value);
        return reason ? [{ language: "JSONC", reason }] : [];
      }
      case "json5": {
        const reason = checkJson5(node.value);
        return reason ? [{ language: "JSON5", reason }] : [];
      }
      case "yaml":
      case "yml": {
        const reason = checkYaml(node.value);
        return reason ? [{ language: "YAML", reason }] : [];
      }
      case "css": {
        const reason = checkCss(node.value);
        return reason ? [{ language: "CSS", reason }] : [];
      }
      case "diff":
        return checkDiff(node);
      default:
        return [];
    }
  }

  function checkJs(code) {
    try {
      swc.parseSync(code, {
        syntax: "ecmascript",
        target: "esnext",
      });
      return null;
    } catch (e) {
      return e.message;
    }
  }

  function checkJson(code) {
    try {
      JSON.parse(code);
      return null;
    } catch (e) {
      return e.message;
    }
  }

  function checkJsonc(code) {
    try {
      const errors = [];
      jsonc.visit(code, {
        onError(errorCode, _offset, _length, startLine, startCharacter) {
          const reason = jsonc.printParseErrorCode(errorCode);
          errors.push(`${reason} (${startLine + 1}:${startCharacter + 1})`);
        },
      });
      return errors.length === 0 ? null : errors.join(", ");
    } catch (e) {
      return e.message;
    }
  }

  function checkJson5(code) {
    try {
      JSON5.parse(code);
      return null;
    } catch (e) {
      return e.message;
    }
  }

  function checkYaml(code) {
    try {
      yaml.load(code);
      return null;
    } catch (e) {
      return e.message.split(/\r?\n/)[0];
    }
  }

  function checkCss(code) {
    try {
      postcss.parse(code);
      return null;
    } catch (e) {
      return e.message;
    }
  }

  function checkDiff(node) {
    const diff = parseDiff(node.value);

    if (diff.parseFailed) {
      return [{ language: "Diff", reason: "Unable to parse unified diff" }];
    }

    const [markerError] = diff.markerErrors;

    if (!markerError) return [];

    const { line, column } = markerError;

    return [
      {
        language: "Diff",
        reason: `Diff marker must be in column 1, but is in column ${column + 1}`,
        position: {
          line: node.position.start.line + line + 1,
          column: node.position.start.column + column,
        },
      },
    ];
  }
}
