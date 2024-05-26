import { App, TFile } from "obsidian";

export async function checkMarkdown(app: App, file: TFile) {
  if (file.extension !== "md") return false;

  if (file.stat.size === 0) return true;

  const content = await app.vault.cachedRead(file);
  if (content.trim().length === 0) return true;

  // TODO: Add check for Ignored frontmatter

  return false;
}
