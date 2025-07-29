import { App, Notice, TAbstractFile, TFile, TFolder } from "obsidian";
import { ExcludeInclude, type FileCleanerSettings } from "./settings";
import {
  getExtensions,
  getFilesInFolder,
  getInUseAttachments,
  getSubFoldersInFolder,
  removeFiles,
  userHasPlugin,
} from "./helpers/helpers";
import { getFolders } from "./helpers/helpers";
import { checkMarkdown } from "./helpers/markdown";
import { checkCanvas, getCanvasAttachments } from "./helpers/canvas";
import { DeletionConfirmationModal } from "./modals/DeletionConfirmationModal";
import translate from "./i18n";
import { getAdmonitionAttachments } from "./helpers/extras/admonition";
import { Deletion } from "./enums";
import { checkExcalidraw } from "./helpers/extras/excalidraw";
import { getCodeblockAttachments } from "./helpers/codeblock";

async function checkFile(
  app: App,
  settings: FileCleanerSettings,
  file: TFile,
  extensions: RegExp,
) {
  const NOW = Date.now();
  const ageThreshold = settings.fileAgeThreshold * 24 * 60 * 60 * 1000;
  const fileAge = file.stat.mtime;

  // Files that have not yet hit the threshold (if it's set) will be skipped
  if (ageThreshold > 0 && fileAge > NOW - ageThreshold) return false;

  if (file.extension === "md") {
    if (
      userHasPlugin("obsidian-excalidraw-plugin", app) &&
      (await checkExcalidraw(file, app))
    )
      return true;

    return await checkMarkdown(file, app, settings);
  } else if (file.extension === "canvas") {
    return await checkCanvas(file, app);
  }

  if (settings.attachmentsExcludeInclude === ExcludeInclude.Include) {
    return file.extension.match(extensions);
  } else if (settings.attachmentsExcludeInclude === ExcludeInclude.Exclude) {
    return !file.extension.match(extensions);
  }
}

function isFolderExcluded(folder: TFolder, settings: FileCleanerSettings) {
  return (
    settings.excludedFolders
      .map((excludedFolder) => folder.path.match(RegExp(`^${excludedFolder}`)))
      .filter((x) => x).length > 0
  );
}
function isFolderIncluded(folder: TFolder, settings: FileCleanerSettings) {
  return (
    settings.excludedFolders
      .map((excludedFolder) => folder.path.match(RegExp(`^${excludedFolder}`)))
      .filter((x) => x).length === 0
  );
}

async function cleanTrashFolder(app: App, settings: FileCleanerSettings) {
  if (settings.obsidianTrashCleanupAge < 0) return;
  if (!app.vault.adapter.exists(".trash")) return;

  const date = new Date();
  const ageThreshold = date.setDate(
    date.getDate() - settings.obsidianTrashCleanupAge,
  );

  console.group("Checking '.trash' folder");
  const trashDirectory = await app.vault.adapter.list(".trash");
  for (const file of trashDirectory.files) {
    const f = await app.vault.adapter.stat(file);

    if (f.ctime < ageThreshold) {
      app.vault.adapter.remove(file);
      console.debug("Removed file:", file);
    }
  }
  for (const folder of trashDirectory.folders) {
    const f = await app.vault.adapter.stat(folder);

    if (f.ctime < ageThreshold) {
      app.vault.adapter.rmdir(folder, true);
      console.debug("Removed folder:", folder);
    }
  }
  console.groupEnd();
}

export async function runCleanup(app: App, settings: FileCleanerSettings) {
  const indexingStart = Date.now();
  console.group("File Cleaner Redux");
  console.log(`Starting cleanup`);

  // Attachments which are linked to according to Obsidian
  const inUseAttachmentsInitial = getInUseAttachments(app);
  inUseAttachmentsInitial.push(...(await getCanvasAttachments(app)));

  if (userHasPlugin("obsidian-admonition", app))
    inUseAttachmentsInitial.push(...(await getAdmonitionAttachments(app)));

  if (settings.codeblockTypes.length > 0) {
    const codeblockLanguages = RegExp(`${settings.codeblockTypes.join("|")}`);
    inUseAttachmentsInitial.push(
      ...(await getCodeblockAttachments(app, codeblockLanguages)),
    );
  }

  // Deduplicated array of attachments
  const inUseAttachments = Array.from(new Set(inUseAttachmentsInitial));

  const folders = getFolders(app)
    .filter((folder) => folder.path !== "/")
    .sort((a, b) =>
      // Sort list of folders by amount of nested subfolders (deepest to shallowest)
      b.path.localeCompare(a.path),
    )
    .reverse();
  folders.push(app.vault.getFolderByPath("/"));

  const filesToRemove: TFile[] = [];
  const foldersToRemove: TFolder[] = [];
  const extensions = getExtensions(settings);

  for (const folder of folders) {
    if (
      (settings.excludeInclude === ExcludeInclude.Exclude &&
        isFolderExcluded(folder, settings)) ||
      (settings.excludeInclude === ExcludeInclude.Include &&
        isFolderIncluded(folder, settings))
    )
      continue;

    const files = getFilesInFolder(folder);

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

  // Post-index check to omit folders that have subfolders that should not be cleaned up from the final list
  [...foldersToRemove].reverse().forEach((folder) => {
    const subFolders = getSubFoldersInFolder(folder);

    subFolders.forEach((subFolder) => {
      if (!foldersToRemove.contains(subFolder)) foldersToRemove.remove(folder);
    });
  });

  const indexingDuration = (Date.now() - indexingStart) / 1000;
  console.log(`Finished indexing after ${indexingDuration}ms`);
  console.log(
    `Found ${filesToRemove.length} files and ${foldersToRemove.length} folders to clean up.`,
  );

  const filesAndFolders: TAbstractFile[] = [...filesToRemove];
  filesAndFolders.push(...foldersToRemove.reverse());

  if (filesAndFolders.length === 0)
    new Notice(translate().Notifications.NoFileToClean);
  else {
    if (!settings.deletionConfirmation)
      await removeFiles(filesAndFolders, app, settings);
    else {
      new DeletionConfirmationModal({
        app,
        filesAndFolders,
        settings,
      });
    }

    console.group("Files:");
    filesToRemove.forEach((item) => console.debug(item.path));
    console.groupEnd();

    console.group("Folders:");
    foldersToRemove.forEach((item) => console.debug(item.path));
    console.groupEnd();
  }

  if (settings.deletionDestination === Deletion.ObsidianTrash)
    cleanTrashFolder(app, settings);

  console.groupEnd();
}
