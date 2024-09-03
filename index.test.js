import { describe, test } from "node:test";
import assert from "node:assert/strict";

import { remark } from "remark";

import rule from "./index.js";

const run = (lang, code) => {
  const codeBlock = `\`\`\`${lang}\n${code}\n\`\`\``;
  const res = remark().use(rule).processSync(codeBlock);
  return res.messages.map((err) => ({
    column: err.column,
    line: err.line,
    message: err.message,
    ruleId: err.ruleId,
    source: err.source,
  }));
};

describe("JSON", () => {
  test("valid", () => {
    assert.deepEqual(run("json", "{}"), []);
  });

  test("invalid", () => {
    const result = run("json", "{[]}");

    assert.equal(result.length, 1);

    const { message, ...restProps } = result[0];
    assert.match(message, /^Invalid JSON: .+ in JSON at position 1\b/);
    assert.deepEqual(restProps, {
      column: 1,
      line: 1,
      ruleId: "code-block-syntax",
      source: "remark-lint",
    });
  });
});

describe("JSONC", () => {
  test("valid", () => {
    assert.deepEqual(run("jsonc", "{} // comment"), []);
  });

  test("invalid", () => {
    assert.deepEqual(run("jsonc", "{[\n}}"), [
      {
        column: 1,
        line: 1,
        message:
          "Invalid JSONC: PropertyNameExpected (1:2), ValueExpected (2:1), EndOfFileExpected (2:2)",
        ruleId: "code-block-syntax",
        source: "remark-lint",
      },
    ]);
  });
});

describe("JavaScript", () => {
  test("valid", () => {
    assert.deepEqual(run("js", "let a=1"), []);
  });

  test("invalid", () => {
    const result = run("js", "let a=");

    assert.equal(result.length, 1);

    const { message, ...restProps } = result[0];
    assert.match(message, /^Invalid JavaScript:/);
    assert.deepEqual(restProps, {
      column: 1,
      line: 1,
      ruleId: "code-block-syntax",
      source: "remark-lint",
    });
  });

  test("invalid for `javascript` alias", () => {
    assert.match(run("javascript", "let a=")[0].message, /^Invalid JavaScript:/);
  });
});

describe("YAML", () => {
  test("valid", () => {
    assert.deepEqual(run("yaml", "{}"), []);
  });

  test("invalid", () => {
    assert.deepEqual(run("yaml", "a:\n-b"), [
      {
        column: 1,
        line: 1,
        message:
          "Invalid YAML: can not read a block mapping entry; a multiline key may not be an implicit key (3:1)",
        ruleId: "code-block-syntax",
        source: "remark-lint",
      },
    ]);
  });

  test("invalid for `yml` alias", () => {
    assert.match(run("yml", "a:\n-b")[0].message, /^Invalid YAML:/);
  });
});

describe("CSS", () => {
  test("valid", () => {
    assert.deepEqual(run("css", "a{}"), []);
  });

  test("invalid", () => {
    assert.deepEqual(run("css", "a{\n}}"), [
      {
        column: 1,
        line: 1,
        message: "Invalid CSS: <css input>:2:2: Unexpected }",
        ruleId: "code-block-syntax",
        source: "remark-lint",
      },
    ]);
  });
});

describe("Unsupported languages", () => {
  test("Ruby", () => {
    assert.deepEqual(run("ruby", "a="), []);
  });
});
