import { describe, expect, jest, test } from "@jest/globals";
import { readFileSync } from "node:fs";
import { isEmpty, parseExcalidraw } from "@/helpers/extras/excalidraw";

describe("Handle empty Excalidraw files", () => {
  test("Newly created empty file", () => {
    const filePath = "test/Excalidraw/new.excalidraw.md";
    const content = readFileSync(filePath, "utf8");
    const data = parseExcalidraw(content, filePath);

    expect(isEmpty(data.elements)).toBe(true);
  });

  test("Empty file after drawing", () => {
    const filePath = "test//Excalidraw/empty-after-drawing.excalidraw.md";
    const content = readFileSync(filePath, "utf8");
    const data = parseExcalidraw(content, filePath);

    expect(isEmpty(data.elements)).toBe(true);
  });
});

describe("Handle non-empty Excalidraw files", () => {
  test("Newly created empty file", () => {
    const filePath = "test/Excalidraw/not-empty.excalidraw.md";
    const content = readFileSync(filePath, "utf8");
    const data = parseExcalidraw(content, filePath);

    expect(isEmpty(data.elements)).toBe(false);
  });
});
