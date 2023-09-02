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
        message: expect.stringMatching(/^Invalid JSON: .+ in JSON at position 1$/),
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
        message: expect.stringMatching(/^Invalid JavaScript:/),
        ruleId: "code-block-syntax",
        source: "remark-lint",
      },
    ]);
  });

  test("invalid for `javascript` alias", () => {
    expect(run("javascript", "let a=")).toEqual([
      expect.objectContaining({ message: expect.stringMatching(/^Invalid JavaScript:/) }),
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

  test("invalid for `yml` alias", () => {
    expect(run("yml", "a:\n-b")).toEqual([
      expect.objectContaining({ message: expect.stringMatching(/^Invalid YAML:/) }),
    ]);
  });
});

describe("CSS", () => {
  test("valid", () => {
    expect(run("css", "a{}")).toEqual([]);
  });

  test("invalid", () => {
    expect(run("css", "a{\n}}")).toEqual([
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
    expect(run("ruby", "a=")).toEqual([]);
  });
});
