import { describe, expect, test } from "@jest/globals";
import { parseAdmonition } from "@/helpers/extras/admonition";

function createAdmonitionBlock(content: string) {
  const output = [];
  output.push("```ad-note");

  output.push(content);

  output.push("```");

  return output.join("\n");
}

describe("Handle empty Admonition codeblocks", () => {
  test("Admonition block with no attachments", () => {
    const content = createAdmonitionBlock("This admonition block only contains text");
    const attachments = parseAdmonition(content);

    expect(attachments.length).toBe(0);
  });
});

describe("Handle Admonition codeblocks with Obsidian attachment styles", () => {
  // * Admonition: ![](image.png) or ![|100](image.png)
  // * Obsidian:   ![[image.png]] or ![[image.png|100]]

  test("Simple", () => {
    const content = createAdmonitionBlock("![[image.png]]");
    const attachments = parseAdmonition(content);

    expect(attachments.length).toEqual(1);
  });

  test("With size argument", () => {
    const content = createAdmonitionBlock("![[image.png|100]]");
    const attachments = parseAdmonition(content);

    expect(attachments.length).toEqual(1);
  });
});

describe("Handle Admonition codeblocks with Obsidian attachment styles", () => {
  test("Simple", () => {
    const content = createAdmonitionBlock("![](image.png)");
    const attachments = parseAdmonition(content);

    expect(attachments.length).toEqual(1);
  });

  test("With size argument", () => {
    const content = createAdmonitionBlock("![|100](image.png)");
    const attachments = parseAdmonition(content);

    expect(attachments.length).toEqual(1);
  });
});

describe("Handle Admonition codeblocks varying attachment styles", () => {
  test("All styles in one file", () => {
    const content = createAdmonitionBlock(
      [
        // One on separate lines
        "![](image1.png)",
        "![|100](image2.png)",
        "![[image3.png]]",
        "![[image4.png|100]]",

        // All on same line
        "![](image5.png) ![|100](image6.png) ![[image7.png]] ![[image8.png|100]]",
      ].join("\n"),
    );
    const attachments = parseAdmonition(content);

    expect(attachments.length).toEqual(8);
  });

  test("With size argument", () => {
    const content = createAdmonitionBlock("![|100](image.png)");
    const attachments = parseAdmonition(content);

    expect(attachments.length).toEqual(1);
  });
});
