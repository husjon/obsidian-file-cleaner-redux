import { describe, expect, test } from "@jest/globals";
import { isEmpty } from "@/helpers/canvas";

describe("Handle empty canvas files", () => {
  test("New empty canvas file", () => {
    const content = JSON.stringify({});

    expect(isEmpty(content)).toBe(true);
  });

  test("Emptied canvas file after use", () => {
    const content = JSON.stringify({ nodes: [], edges: [] });

    expect(isEmpty(content)).toBe(true);
  });
});

describe("Handle non-empty canvas files", () => {
  test("Non-empty files", () => {
    const content = JSON.stringify({
      nodes: [
        {
          id: "d8b6a102e6b0af3a",
          x: -125,
          y: -30,
          width: 250,
          height: 60,
          type: "text",
          text: "not empty",
        },
      ],
      edges: [],
    });

    expect(isEmpty(content)).toBe(false);
  });
});
