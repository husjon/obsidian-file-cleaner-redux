import { App, Notice, TAbstractFile, TFile, TFolder } from "obsidian";
import { FileCleanerSettings } from "./settings";
import translate from "./i18n";
import { Deletion } from "./enums";
import { DeletionConfirmationModal } from "./helpers";

interface CanvasNode {
  id: string;
  type: string;
  file: string;
}

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

export async function runCleanup(app: App, settings: FileCleanerSettings) {
  const excludedFoldersRegex = RegExp(`^${settings.excludedFolders.join("|")}`);
  const allowedExtensions = RegExp(
    `${["md", ...settings.attachmentExtensions].join("|")}`,
  );
  const inUseAttachments = Object.entries(app.metadataCache.resolvedLinks)
    .map(([parent, child]) => Object.keys(child))
    .filter((file) => file.length > 0)
    .reduce((prev, cur) => [...prev, ...cur], [])
    .filter((file) => !file.endsWith(".md"));

  const canvasAttachmentsInitial: string[] = await Promise.all(
    app.vault
      .getFiles()
      .filter((file) => file.extension == "canvas")
      .map(async (file) => {
        return await app.vault.read(file).then(
          // Iterate over found canvas files to fetch the nodes
          (raw) => {
            if (file.stat.size === 0) return [];

            try {
              const data = JSON.parse(raw);
              return data["nodes"]
                .filter(
                  // Filter out non-markdown files
                  (node: CanvasNode) =>
                    node.type === "file" && !node.file.endsWith(".md"),
                )
                .map((node: CanvasNode) => node.file)
                .reduce((prev: [], cur: []) => [...prev, cur], []);
            } catch (error) {
              new Notice(`Failed to parse canvas file: ${file.path}`);
            }
          },
        );
      }),
  );
  // Build up a 1-dimensional array of path strings
  const canvasAttachments = canvasAttachmentsInitial.reduce(
    (prev, cur) => [...prev, ...cur],
    [],
  );

  const emptyFolders = settings.removeFolders
    ? app.vault
        .getAllLoadedFiles()
        .filter((child) => child.hasOwnProperty("children"))
        .filter((child: TFolder) => child["children"].length === 0)
    : [];

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
        !inUseAttachments.includes(file.path) &&
        !canvasAttachments.includes(file.path) &&
        file,
    );

  const filesAndFolders = [...files, ...emptyFolders];

  // Run cleanup
  if (filesAndFolders.length == 0) {
    new Notice(translate().Notifications.NoFileToClean);
    return;
  }

  if (!settings.deletionConfirmation)
    removeFiles(filesAndFolders, app, settings);
  else {
    await DeletionConfirmationModal({
      files: filesAndFolders,
      onConfirm: () => {
        removeFiles(filesAndFolders, app, settings);
      },
      app,
    });
  }
}
