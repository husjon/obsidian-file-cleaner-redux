import { App, Notice, TFile } from "obsidian";
import { FileCleanerSettings } from "./settings";
import translate from "./i18n";
import { Deletion } from "./enums";
import { ConfirmationModal } from "./helpers";

async function removeFile(
  file: TFile,
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
  files: TFile[],
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

export async function runCleanup(app: App, settings: FileCleanerSettings) {
  const excludedFoldersRegex = RegExp(`^${settings.excludedFolders.join("|")}`);
  const allowedExtensions = RegExp(
    `${["md", ...settings.attachmentExtensions].join("|")}`,
  );
  const inUseAttachments = Object.entries(app.metadataCache.resolvedLinks)
    .map(([parent, child]) => Object.keys(child))
    .filter((file) => file.length > 0)
    .map((file) => file.pop())
    .reduce(
      (prev, cur) => (!prev.includes(cur) ? [...prev, cur] : [...prev]),
      [],
    );

  // Get list of all files
  const files: TFile[] = app.vault
    .getFiles()
    .filter((file) =>
      // Filter out files from excluded folders
      settings.excludedFolders.length > 0
        ? !file.path.match(excludedFoldersRegex)
        : file,
    )
    .filter((file) =>
      // Filters out only allowed extensions (including markdowns)
      file.extension.match(allowedExtensions),
    )
    .filter(
      (file) =>
        // Filters out any markdown file that is empty
        (file.extension === "md" && file.stat.size === 0) ||
        file.extension !== "md",
    )
    .filter(
      (file) =>
        // Filters any attachment that is not in use
        !inUseAttachments.includes(file.path) && file,
    );

  // Run cleanup
  if (!settings.deletionConfirmation) removeFiles(files, app, settings);
  else {
    let modalText = `<h3>${translate().Modals.DeletionConfirmation}:</h3>`;
    modalText += "<ul>";
    for (const file of files) {
      modalText += `<li><a onClick="leaf.openFile(app.vault.getAbstractFileByPath('${file.path}'))">${file.path}</a></li>`;
      console.log(file);
    }
    modalText += "<ul>";

    await ConfirmationModal({
      text: modalText,
      onConfirm: () => {
        removeFiles(files, app, settings);
      },
    });
  }
}
