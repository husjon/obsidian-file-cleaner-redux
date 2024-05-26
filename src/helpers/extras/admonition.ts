import { App } from "obsidian";

export async function getAdmonitionAttachments(app: App) {
  console.group("Admonition");
  const indexingStart = Date.now();

  const attachments: string[] = [];

  // Get list of all markdown files that contains code blocks.
  // Since FileCache doesn't include which type of block it is,
  //   this is as good as it gets for now.
  const admonitionCandidates = await Promise.all(
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
      ),
  );

  console.log(
    `Iterating over ${admonitionCandidates.length} files with codeblocks`,
  );
  for (const { file, cache } of admonitionCandidates) {
    const content = await app.vault.cachedRead(file);

    // Iterate over each section in the file
    for (const section of cache.sections) {
      // Read only the actual code block from the given section
      const codeBlock = content.slice(
        section.position.start.offset,
        section.position.end.offset,
      );
      // If the block is not an admonition block, we'll skip it
      if (!codeBlock.match(/^```ad-\w+/)) continue;

      // Matches the following signatures and capture the filename itself
      // * Admonition: ![](image.png) or ![|100](image.png)
      // * Obsidian:   ![[image.png]] or ![[image.png|100]]
      const matches = codeBlock.matchAll(
        /!(\[.*?\]\((.+?)\)|\[\[(.+?)(\|.*?)?\]\])/g,
      );

      // Push the attachments we find to the resulting attachments array
      Array.from(matches).forEach((match) => {
        const attachmentPath = match[1];
        if (!attachments.contains(attachmentPath))
          attachments.push(attachmentPath);
      });
    }
  }
  const duration = (Date.now() - indexingStart) / 1000;
  console.log(
    `Found ${attachments.length} attachments in Admonition blocks in ${duration}ms.`,
  );
  console.groupEnd();
  return attachments;
}
