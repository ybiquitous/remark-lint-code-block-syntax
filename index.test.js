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
    expect(run("json", "{}")).toEqual([]);
  });

  test("invalid", () => {
    expect(run("json", "{[]}")).toEqual([
      {
        column: 1,
        line: 1,
        message: "Invalid JSON: Unexpected token [ in JSON at position 1",
        ruleId: "code-block-syntax",
        source: "remark-lint",
      },
    ]);
  });
});

describe("JavaScript", () => {
  test("valid", () => {
    expect(run("js", "let a=1")).toEqual([]);
  });

  test("invalid", () => {
    expect(run("js", "let a=")).toEqual([
      {
        column: 1,
        line: 1,
        message: "Invalid JavaScript: Line 1: Unexpected end of input",
        ruleId: "code-block-syntax",
        source: "remark-lint",
      },
    ]);
  });
});

describe("YAML", () => {
  test("valid", () => {
    expect(run("yaml", "{}")).toEqual([]);
  });

  test("invalid", () => {
    expect(run("yaml", "a:\n-b")).toEqual([
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
});

describe("Unsupported languages", () => {
  test("CSS", () => {
    expect(run("css", "a{")).toEqual([]);
  });
});
