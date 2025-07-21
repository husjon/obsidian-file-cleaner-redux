import { App, Notice, TAbstractFile, TFile, TFolder } from "obsidian";
import { type FileCleanerSettings } from "../settings";
import { Deletion } from "../enums";
import translate from "../i18n";

async function removeFile(
  file: TAbstractFile,
  app: App,
  settings: FileCleanerSettings,
) {
  switch (settings.deletionDestination) {
    case Deletion.Permanent:
      await app.vault.delete(file, true);
      break;
    case Deletion.SystemTrash:
      await app.vault.trash(file, true);
      break;
    case Deletion.ObsidianTrash:
      await app.vault.trash(file, false);
      break;
  }
}

export async function removeFiles(
  files: TAbstractFile[],
  app: App,
  settings: FileCleanerSettings,
) {
  if (files.length > 0) {
    for (const file of files) {
      removeFile(file, app, settings);
    }
    new Notice(translate().Notifications.CleanSuccessful);
  } else {
    new Notice(translate().Notifications.NoFileToClean);
  }
}

export function getInUseAttachments(app: App) {
  return Object.values(app.metadataCache.resolvedLinks)
    .map((child) => Object.keys(child))
    .filter((file) => file.length > 0)
    .reduce((prev, cur) => [...prev, ...cur], [])
    .filter((file) => !file.endsWith(".md"));
}
export function getFolders(app: App) {
  return app.vault
    .getAllLoadedFiles()
    .filter((node) =>
      Object.prototype.hasOwnProperty.call(node, "children"),
    ) as TFolder[];
}

export function getFilesInFolder(folder: TFolder) {
  return folder.children.filter(
    (node) => !Object.prototype.hasOwnProperty.call(node, "children"),
  ) as TFile[];
}

export function getSubFoldersInFolder(folder: TFolder) {
  return folder.children.filter((node) =>
    Object.prototype.hasOwnProperty.call(node, "children"),
  ) as TFolder[];
}

export function getExtensions(settings: FileCleanerSettings) {
  const extensions = [...settings.attachmentExtensions].filter(
    (extension) => extension !== "*",
  );

  if (settings.attachmentExtensions.includes("*")) extensions.push(".*");

  return RegExp(`^(${["md", ...extensions].join("|")})$`);
}

export interface AppWithPlugins extends App {
  plugins: { plugins: Record<string, any> };
}

export function userHasPlugin(id: string, app: App) {
  const plugins = (app as AppWithPlugins).plugins.plugins;
  return plugins.hasOwnProperty(id);
}
