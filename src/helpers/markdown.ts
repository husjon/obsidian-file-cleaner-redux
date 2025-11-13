import { App, TFile } from "obsidian";
import { type FileCleanerSettings } from "../settings";

export async function checkMarkdown(
  file: TFile,
  app: App,
  settings: FileCleanerSettings,
) {
  if (file.extension !== "md") return false;
  if (!settings.deleteEmptyMarkdownFiles) return false;

  // Check if file has any backlinks
  const metadata = app.metadataCache;
  // @ts-expect-error (getBacklinksForFile is not part of the type definition)
  const links = metadata.getBacklinksForFile(file).data as Map<
    String,
    Array<any>
  >;
  if (
    links.size > 0 &&
    settings.deleteEmptyMarkdownFilesWithBacklinks === false
  )
    return false;

  // Checks for filesize to be literally 0 bytes
  if (file.stat.size === 0) return true;

  // Checks for content of a file to be 0 length after trimming all whitespace
  const content = await app.vault.cachedRead(file);
  if (content.trim().length === 0) return true;

  // Check for file which contains only frontmatter whihc contains only the properties defined in the settings
  const fileCache = app.metadataCache.getFileCache(file);
  if (fileCache.sections.length === 1 && fileCache.frontmatter) {
    if (settings.ignoreAllFrontmatter) return true;

    const frontmatterKeys = Object.keys(fileCache.frontmatter);

    return frontmatterKeys.every((frontmatterKey) =>
      settings.ignoredFrontmatter.includes(frontmatterKey),
    );
  }

  return false;
}

export async function getMarkdownSections(file: TFile, app: App, type = "") {
  const cache = app.metadataCache.getFileCache(file);

  if (!cache.sections) return [];

  if (type !== "")
    return cache.sections.filter((section) => section.type === type);

  return cache.sections;
}
