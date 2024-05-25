import { App, Notice, TAbstractFile, TFolder } from "obsidian";
import { FileCleanerSettings } from "../settings";
import { Deletion } from "../enums";
import translate from "../i18n";

async function removeFile(
  file: TAbstractFile,
  app: App,
  settings: FileCleanerSettings,
) {
  switch (settings.deletionDestination) {
    case Deletion.Permanent:
      await app.vault.delete(file);
      break;
    case Deletion.SystemTrash:
      await app.vault.trash(file, true);
      break;
    case Deletion.ObsidianTrash:
      await app.vault.trash(file, false);
      break;
  }
}

async function removeFiles(
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
  return Object.entries(app.metadataCache.resolvedLinks)
    .map(([parent, child]) => Object.keys(child))
    .filter((file) => file.length > 0)
    .reduce((prev, cur) => [...prev, ...cur], [])
    .filter((file) => !file.endsWith(".md"));
}
export function getFolders(app: App) {
  return app.vault
    .getAllLoadedFiles()
    .filter((node) => node.hasOwnProperty("children")) as TFolder[];
}
function getExtensions(settings: FileCleanerSettings) {
  const extensions = [...settings.attachmentExtensions].filter(
    (extension) => extension !== "*",
  );

  if (settings.attachmentExtensions.includes("*")) extensions.push(".*");

  return RegExp(`^(${["md", ...extensions].join("|")})$`);
}