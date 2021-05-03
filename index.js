import { default as rule } from "unified-lint-rule";
import { default as visit } from "unist-util-visit";
import { default as esprima } from "esprima";
import { default as yaml } from "js-yaml";

export default rule("remark-lint:code-block-syntax", codeSyntax);

function codeSyntax(tree, file) {
  const supportedLangs = ["js", "json", "yaml"];
  const test = supportedLangs.map((lang) => ({ type: "code", lang: lang }));

  visit(tree, test, visitor);

  function visitor(node) {
    switch (node.lang) {
      case "js": {
        const reason = checkJs(node.value);
        if (reason) {
          file.message(`Invalid JavaScript: ${reason}`, node);
        }
        break;
      }
      case "json": {
        const reason = checkJson(node.value);
        if (reason) {
          file.message(`Invalid JSON: ${reason}`, node);
        }
        break;
      }
      case "yaml": {
        const reason = checkYaml(node.value);
        if (reason) {
          file.message(`Invalid YAML: ${reason}`, node);
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
      esprima.parseScript(code);
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
}
