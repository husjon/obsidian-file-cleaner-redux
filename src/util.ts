import { App, TFile } from "obsidian";
import { FileCleanerSettings } from "./settings";
import { getInUseAttachments } from "./helpers/helpers";
import { getFolders } from "./helpers/helpers";

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

  for (const folder of folders) {
    const files = folder.children.filter(
      (node) => !node.hasOwnProperty("children"),
    ) as TFile[];
    console.log(folder.path);

    let childrenCount = files.length;
    for (const file of files) {
      console.log(` - ${file.path}`);

      if (!inUseAttachments.includes(file.path)) {
        // 1. Check if file can be cleaned up
        //   1.1. If markdown, verify size and frontmatter

        if (true === undefined) filesToRemove.push(file);
        // 2. Reduce childrenCount if it will be
        childrenCount -= 1;
      }
    }

    // 3. If childrenCount is 0, folder will be removed as well (unless it is the root folder)
    if (childrenCount === 0 && !folder.isRoot()) {
      foldersToRemove.push(folder);
    }
  }
}
