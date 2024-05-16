import { App, Notice, TAbstractFile, TFile, TFolder } from "obsidian";
import { ExcludeInclude, FileCleanerSettings } from "./settings";
import translate from "./i18n";
import { Deletion } from "./enums";
import { DeletionConfirmationModal } from "./modals";

interface CanvasNode {
  id: string;
  type: string;
  file?: string;
  text?: string;
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

function getCanvasCardAttachments(canvasNode: CanvasNode) {
  const matches = canvasNode.text.matchAll(/[!]?\[\[(.*?)\]\]/g);
  const files = Array.from(matches).map((file) => {
    if (file[0].startsWith("![[")) return file[1];
    else return `${file[1]}.md`;
  });
  return files;
}

async function getCanvasAttachments(app: App) {
  const canvasAttachmentsInitial = await Promise.all(
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
              if (!data["nodes"]) return [];

              const fileNodes = data["nodes"]
                .filter(
                  // Filter out non-markdown files
                  (node: CanvasNode) =>
                    node.type === "file" && !node.file.endsWith(".md"),
                )
                .map((node: CanvasNode) => node.file)
                .reduce((prev: [], cur: []) => [...prev, cur], []);

              const cardNodes = data["nodes"]
                .filter((node: CanvasNode) => node.type === "text")
                .map((node: CanvasNode) => getCanvasCardAttachments(node))
                .reduce((prev: [], cur: []) => [...prev, ...cur], []);

              return [...fileNodes, ...cardNodes];
            } catch (error) {
              new Notice(`Failed to parse canvas file: ${file.path}`);
            }
          },
        );
      }),
  );

  return canvasAttachmentsInitial
    .filter((f) => f.length > 0)
    .reduce((prev, cur) => [...prev, ...cur], []);
}

function getExtensions(settings: FileCleanerSettings) {
  const extensions = [...settings.attachmentExtensions].filter(
    (extension) => extension !== "*",
  );

  if (settings.attachmentExtensions.includes("*")) extensions.push(".*");

  return RegExp(`^(${["md", ...extensions].join("|")})$`);
}

function getFolders(app: App) {
  return app.vault
    .getAllLoadedFiles()
    .filter((node) => node.hasOwnProperty("children")) as TFolder[];
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
