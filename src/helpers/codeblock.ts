import { App, TFile } from "obsidian";

async function getCodeblocksFromMarkdownFiles(app: App) {
  // Get list of all markdown files that contains code blocks.
  // Since FileCache doesn't include which type of block it is,
  //   this is as good as it gets for now.
  const files = await Promise.all(
    app.vault
      .getFiles()
      .filter((file) => file.extension == "md")
      .map((file) => {
        return { file: file, cache: app.metadataCache.getFileCache(file) };
      })
      .filter((file) => file.cache.sections)
      .filter(
        (file) =>
          file.cache.sections.filter((section) => section.type === "code")
            .length > 0,
      )
      .map(({ file }) => file)
      .map(async (file) => {
        return {
          file,
          codeblocks: await getMarkdownCodeblocks(file, app),
        };
      }),
  );

  return files;
}

type CodeBlock = {
  content: string;
  language: string;
};
export async function getMarkdownCodeblocks(
  file: TFile,
  app: App,
): Promise<CodeBlock[]> {
  const cache = app.metadataCache.getFileCache(file);
  if (!cache.sections) return [];

  const fileContentRaw = await app.vault.cachedRead(file);

  const sections = cache.sections
    .filter((section) => section.type === "code")
    .map(async (section) => {
      const content = fileContentRaw.slice(
        section.position.start.offset,
        section.position.end.offset,
      );
      return parseCodeblock(content);
    });

  return Promise.all(sections);
}

function parseCodeblock(codeblock: string): CodeBlock | null {
  /* Parses a complete codeblock including the fence markers
   * Example:
   *   ```js
   *   console.log('Hello, World!);
   *   ```
   */

  if (!codeblock.matchAll(/^[`~]{3,}.*?[`~]{3,}$/g)) return null;

  const fenceType = codeblock[0];

  const content = codeblock
    .replace(RegExp(`^${fenceType}+`), "") //  strip of the code block fence at the beginning
    .replace(RegExp(`${fenceType}+$`), ""); // strip of the code block fence at the end

  const language = content.split(/[\r\n]+/)[0];

  return {
    language,
    content: content.replace(RegExp(`^${language}`), "").trim(),
  };
}
