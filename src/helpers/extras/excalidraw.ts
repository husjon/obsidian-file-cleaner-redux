import { App, TFile } from "obsidian";

interface ExcalidrawElement {
  id: string;
  isDeleted: boolean;
}

export async function checkExcalidraw(file: TFile, app: App) {
  const metadata = app.metadataCache;
  // @ts-ignore (getBacklinksForFile is not part of the type definition)
  const links = Object.keys(metadata.getBacklinksForFile(file).data);

  if (links.length > 0) return false

  const content = await app.vault.cachedRead(file);

  const blockStart = content.search(/{[ \t\n]*"type":[ ]*"excalidraw"/);
  const blockEnd = content.search(/```\n?%%/);

  if (blockStart < 0) return false;
  if (blockEnd < 0) {
    console.warn(
      `Could not determine codeblock boundary for the following Excalidraw file: ${file.path}`,
    );
    return false;
  }

  const codeBlockRaw = content.slice(blockStart, blockEnd);

  // Abort if the file could not be identified
  if (codeBlockRaw.length === 0) return false;

  const data = JSON.parse(codeBlockRaw);

  const elements: ExcalidrawElement[] = data.elements;
  if (elements.length === 0) return true;

  // In the case where the Excalidraw file has been saved just after deleing the last element,
  //  the element is still part of the file but tagged with `isDeleted`, if there are no such element it can be deleted.
  const activeElements = elements.filter((el) => !el.isDeleted);
  if (activeElements.length === 0) return true;

  return false;
}
