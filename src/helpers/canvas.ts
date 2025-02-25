import { App, Notice, TFile } from "obsidian";

interface CanvasNode {
  id: string;
  type: string;
  file?: string;
  text?: string;
}

function getCanvasCardAttachments(
  canvasNode: CanvasNode,
  canvas: TFile,
  app: App,
) {
  const matchedFiles = [];

  // Match attachments using Wikilink syntax `![[path_to_file|imagelabel]]`
  for (const match of canvasNode.text.matchAll(/[!]?\[\[(.*?)\]\]/g)) {
    matchedFiles.push(match[1].split("|")[0]); // strip of the label
  }

  // Match attachments using Markdown syntax `![imagelabel](path_to_file)`
  for (const match of canvasNode.text.matchAll(/[!]\[.*?\]\((.*)\)/g)) {
    matchedFiles.push(
      // markdown link uses URL encoding for links (%20 is a space)
      match[1].replace(/%20/gi, " "),
    );
  }

  const files = matchedFiles.map((filePath) => {
    const fileLink = app.metadataCache.getFirstLinkpathDest(
      filePath,
      canvas.path,
    );
    if (fileLink) return fileLink.path;
  });

  return files;
}

export async function getCanvasAttachments(app: App) {
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
                .map((node: CanvasNode) =>
                  getCanvasCardAttachments(node, file, app),
                )
                .reduce((prev: [], cur: []) => [...prev, ...cur], []);

              return [...fileNodes, ...cardNodes];
            } catch (error) {
              new Notice(`Failed to parse canvas file: ${file.path}`);
            }
          },
        );
      }),
  );

  return (
    canvasAttachmentsInitial
      // filter out undefined (falsely reported files)
      // this can happen for example if a canvas node uses template strings that is prefixed with attachment-style syntax.
      // e.g. prefixed with Wikilink-style `[[` and `![[` or Markdown-style `![`
      .filter((f) => f)
      .filter((f) => f.length > 0)
      .reduce((prev, cur) => [...prev, ...cur], [])
  );
}

export async function checkCanvas(file: TFile, app: App) {
  if (file.extension !== "canvas") return false;

  // A canvas file that has been emptied is 28 bytes by default (24 bytes minified).
  // A brand new canvas file is 2 bytes
  if (file.stat.size <= 28) return true;

  const rawContent = await app.vault.cachedRead(file);
  const canvas = JSON.parse(rawContent);

  if (canvas.nodes.length === 0 && canvas.edges.length === 0) return true;

  return false;
}
