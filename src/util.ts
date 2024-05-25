import { App, TFile } from "obsidian";
import { ExcludeInclude, FileCleanerSettings } from "./settings";
import { getExtensions, getInUseAttachments } from "./helpers/helpers";
import { getFolders } from "./helpers/helpers";
import { checkMarkdown } from "./helpers/markdown";
import { checkCanvas } from "./helpers/canvas";

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

export async function runCleanup(app: App, settings: FileCleanerSettings) {
  const indexingStart = Date.now();
  console.log(`File Cleaner Redux: Starting cleanup`);

  // Attachments which are linked to according to Obsidian
  let inUseAttachments = getInUseAttachments(app);
  // TODO: Extend to also include files linked to Canvas files
  // TODO: Extend to also include files linked to by Admonition

  const folders = getFolders(app)
    .filter((folder) => folder.path !== "/")
    .sort((a, b) =>
      // Sort list of folders by amount of nested subfolders (deepest to shallowest)
      b.path.localeCompare(b.path),
    )
    .reverse();
  folders.push(app.vault.getFolderByPath("/"));

  const filesToRemove = [];
  const foldersToRemove = [];
  const extensions = getExtensions(settings);

  for (const folder of folders) {
    const files = folder.children.filter(
      (node) => !node.hasOwnProperty("children"),
    ) as TFile[];

    let childrenCount = files.length;
    for (const file of files) {
      if (!inUseAttachments.includes(file.path)) {
        if (await checkFile(app, settings, file, extensions)) {
          filesToRemove.push(file);
          childrenCount -= 1;
        }
      }
    }

    // 3. If childrenCount is 0, folder will be removed as well (unless it is the root folder)
    if (
      childrenCount === 0 &&
      !settings.excludedFolders.includes(folder.path) &&
      !folder.isRoot()
    ) {
      foldersToRemove.push(folder);
    }
  }
}
