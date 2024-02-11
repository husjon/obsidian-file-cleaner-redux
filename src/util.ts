import { App, Notice, TAbstractFile, TFile, TFolder } from "obsidian";
import { ExcludeInclude, FileCleanerSettings } from "./settings";
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

function getInUseAttachments(app: App) {
  return Object.entries(app.metadataCache.resolvedLinks)
    .map(([parent, child]) => Object.keys(child))
    .filter((file) => file.length > 0)
    .reduce((prev, cur) => [...prev, ...cur], [])
    .filter((file) => !file.endsWith(".md"));
}

async function getCanvasAttachments(app: App) {
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

  return canvasAttachmentsInitial.reduce((prev, cur) => [...prev, ...cur], []);
}

export async function runCleanup(app: App, settings: FileCleanerSettings) {
  const indexingStart = Date.now();
  const excludedFoldersRegex = RegExp(`^${settings.excludedFolders.join("|")}`);

  const extensions = [...settings.attachmentExtensions].filter(
    (extension) => extension !== "*",
  );

  if (settings.attachmentExtensions.includes("*")) extensions.push("\\.*");

  const allowedExtensions = RegExp(`${["md", ...extensions].join("|")}`);

  const inUseAttachments = getInUseAttachments(app);

  const canvasAttachments = await getCanvasAttachments(app);

  const allFilesAndFolders = app.vault.getAllLoadedFiles();
  const allFolders = allFilesAndFolders.filter((node) =>
    node.hasOwnProperty("children"),
  );

  const initialEmptyFolders = settings.removeFolders
    ? allFolders.filter((folder: TFolder) => folder.children.length === 0)
    : [];

  const emptyFolders = [];
  for (const folder of initialEmptyFolders) {
    let parent = folder.parent;
    emptyFolders.push(folder);

    while (parent !== null && parent.children.length === 1) {
      if (parent.parent === null) break;

      emptyFolders.push(parent);
      parent = parent.parent;
    }
  }

  // Get list of all files
  const allFiles = allFilesAndFolders.filter(
    (node) => !node.hasOwnProperty("children"),
  ) as TFile[];
  const files: TFile[] = allFiles
    .filter((file) =>
      // Filters out only allowed extensions (including markdowns)
      file.extension.match(allowedExtensions),
    )
    // Filters out files for further processing
    .filter((file) => {
      // Filter out all files that are not markdown
      if (file.extension !== "md") return true;

      // Filter out any markdown files that are empty including only whitespace
      const fileCache = app.metadataCache.getFileCache(file);
      const sections = fileCache.sections;
      if (sections === undefined) return true;

      // Filter out any files that are empty and only contains ignored frontmatter properties
      const fileFrontmatter = Object.keys(fileCache.frontmatter || {}).sort();
      const settingsFrontmatter = settings.ignoredFrontmatter.sort();
      if (settings.ignoredFrontmatter.length === 0) return false;

      if (sections.length === 1 && sections.at(0).type === "yaml") {
        if (fileFrontmatter.toString() === settingsFrontmatter.toString())
          return true;
      }

      return false; // Ignore all other files
    })
    .filter(
      (file) =>
        // Filters any attachment that is not in use
        !inUseAttachments.includes(file.path) &&
        !canvasAttachments.includes(file.path) &&
        file,
    );

  const filesAndFolders = [...files, ...emptyFolders].filter((file) => {
    // Filter out files from excluded / included folders
    if (settings.excludedFolders.length === 0) return file;
    else {
      return settings.excludeInclude === ExcludeInclude.Exclude
        ? !file.path.match(excludedFoldersRegex)
        : file.path.match(excludedFoldersRegex);
    }
  });

  const indexingDuration = Date.now() - indexingStart;
  console.log(
    `File Cleaner Redux: Finished indexing ${allFiles.length} files and ${allFolders.length} folders in ${indexingDuration}ms`,
  );

  // Run cleanup
  if (filesAndFolders.length == 0) {
    new Notice(translate().Notifications.NoFileToClean);
    return;
  }

  const fileCountText = `${files.length} file(s)`;
  const folderCountText = `${emptyFolders.length} folder(s)`;
  console.log(
    `File Cleaner Redux: Found ${fileCountText} and ${folderCountText} to remove`,
  );

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
