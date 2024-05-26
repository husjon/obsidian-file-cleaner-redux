import { App, Notice, TAbstractFile, TFile, TFolder } from "obsidian";
import { ExcludeInclude, FileCleanerSettings } from "./settings";
import {
  getExtensions,
  getInUseAttachments,
  removeFiles,
} from "./helpers/helpers";
import { getFolders } from "./helpers/helpers";
import { checkMarkdown } from "./helpers/markdown";
import { checkCanvas, getCanvasAttachments } from "./helpers/canvas";
import { DeletionConfirmationModal } from "./modals";
import translate from "./i18n";

async function checkFile(
  app: App,
  settings: FileCleanerSettings,
  file: TFile,
  extensions: RegExp,
) {
  if (file.extension === "md") return await checkMarkdown(app, file);
  else if (file.extension === "canvas") return await checkCanvas(app, file);
  else if (settings.attachmentsExcludeInclude === ExcludeInclude.Include) {
    return file.extension.match(extensions);
  } else if (settings.attachmentsExcludeInclude === ExcludeInclude.Exclude) {
    return !file.extension.match(extensions);
  }

  return false;
}

function isFolderExcluded(settings: FileCleanerSettings, folder: TFolder) {
  return (
    settings.excludedFolders
      .map((excludedFolder) => folder.path.match(RegExp(`^${excludedFolder}`)))
      .filter((x) => x).length > 0
  );
}
function isFolderIncluded(settings: FileCleanerSettings, folder: TFolder) {
  return (
    settings.excludedFolders
      .map((excludedFolder) => folder.path.match(RegExp(`^${excludedFolder}`)))
      .filter((x) => x).length === 0
  );
}

export async function runCleanup(app: App, settings: FileCleanerSettings) {
  const indexingStart = Date.now();
  console.group("File Cleaner Redux");
  console.log(`Starting cleanup`);

  // Attachments which are linked to according to Obsidian
  let inUseAttachmentsInitial = getInUseAttachments(app);
  inUseAttachmentsInitial.push(...(await getCanvasAttachments(app)));
  // TODO: Extend to also include files linked to by Admonition

  // Deduplicated array of attachments
  const inUseAttachments = Array.from(new Set(inUseAttachmentsInitial));

  const folders = getFolders(app)
    .filter((folder) => folder.path !== "/")
    .sort((a, b) =>
      // Sort list of folders by amount of nested subfolders (deepest to shallowest)
      b.path.localeCompare(b.path),
    )
    .reverse();
  folders.push(app.vault.getFolderByPath("/"));

  const filesToRemove: TFile[] = [];
  const foldersToRemove: TFolder[] = [];
  const extensions = getExtensions(settings);

  for (const folder of folders) {
    if (
      (settings.excludeInclude === ExcludeInclude.Exclude &&
        isFolderExcluded(settings, folder)) ||
      (settings.excludeInclude === ExcludeInclude.Include &&
        isFolderIncluded(settings, folder))
    )
      continue;

    const files = folder.children.filter(
      (node) => !node.hasOwnProperty("children"),
    ) as TFile[];

    let childrenCount = files.length;
    for (const file of files) {
      if (inUseAttachments.includes(file.path)) continue;

      if (await checkFile(app, settings, file, extensions)) {
        filesToRemove.push(file);
        childrenCount -= 1;
      }
    }

    if (
      childrenCount === 0 &&
      !settings.excludedFolders.includes(folder.path) &&
      !folder.isRoot() &&
      settings.removeFolders
    ) {
      foldersToRemove.push(folder);
    }
  }

  const indexingDuration = (Date.now() - indexingStart) / 1000;
  console.log(`Finished indexing after ${indexingDuration}ms`);
  console.log(
    `Found ${filesToRemove.length} files and ${foldersToRemove.length} folders to clean up.`,
  );

  const filesAndFolders: TAbstractFile[] = [...filesToRemove];
  filesAndFolders.push(...foldersToRemove);

  if (filesAndFolders.length === 0)
    new Notice(translate().Notifications.NoFileToClean);
  else {
    if (!settings.deletionConfirmation)
      await removeFiles(filesAndFolders, app, settings);
    else {
      DeletionConfirmationModal({
        app,
        files: filesAndFolders,
        onConfirm: async () => {
          await removeFiles(filesAndFolders, app, settings);
        },
      });
    }

    console.group("Files:");
    filesToRemove.forEach((item) => console.debug(item.path));
    console.groupEnd();

    console.group("Folders:");
    foldersToRemove.forEach((item) => console.debug(item.path));
    console.groupEnd();
  }

  console.groupEnd();
}
