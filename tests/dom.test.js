import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

describe("HTML shell", () => {
  it("renders the game canvas and controls", async () => {
    const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
    const dom = new JSDOM(html);
    const document = dom.window.document;

    expect(document.querySelector("#game")).not.toBeNull();
    expect(document.querySelector("#start")).not.toBeNull();
    expect(document.querySelector("#pause")).not.toBeNull();
    expect(document.querySelector("#reset")).not.toBeNull();
  });
});
