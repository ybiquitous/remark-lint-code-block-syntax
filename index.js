import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import { default as swc } from "@swc/core";
import { default as yaml } from "js-yaml";
import { default as postcss } from "postcss";

const remarkLintCodeBlockSyntax = lintRule("remark-lint:code-block-syntax", codeSyntax);
export default remarkLintCodeBlockSyntax;

function codeSyntax(tree, file) {
  const supportedLangs = ["js", "javascript", "json", "yaml", "yml", "css"];
  const test = supportedLangs.map((lang) => ({ type: "code", lang: lang }));

  visit(tree, test, visitor);

  function visitor(node) {
    const report = (reason, language) => {
      file.message(`Invalid ${language}: ${reason}`, node);
    };

    const { lang, value } = node;

    switch (lang) {
      case "js":
      case "javascript": {
        const reason = checkJs(value);
        if (reason) {
          report(reason, "JavaScript");
        }
        break;
      }
      case "json": {
        const reason = checkJson(value);
        if (reason) {
          report(reason, "JSON");
        }
        break;
      }
      case "yaml":
      case "yml": {
        const reason = checkYaml(value);
        if (reason) {
          report(reason, "YAML");
        }
        break;
      }
      case "css": {
        const reason = checkCss(value);
        if (reason) {
          report(reason, "CSS");
        }
        break;
      }
      default:
        // ignore
        break;
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
}
