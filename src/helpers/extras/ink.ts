import { App } from "obsidian";
import { getCodeblocksFromMarkdownFiles } from "../codeblock";

type HandDrawnFile = {
  versionAtEmbed: string;
  filepath: string;
  aspectRatio: number;
};

type HandWrittenFile = {
  versionAtEmbed: string;
  filepath: string;
};
type InkFile = HandDrawnFile | HandWrittenFile;

export async function getInkAttachments(app: App) {
  console.group("Ink");
  const indexingStart = Date.now();

  const files = await getCodeblocksFromMarkdownFiles(app);

  const codeblocks = files
    .flatMap((file) => file.codeblocks)
    .filter((block) =>
      ["handwritten-ink", "handdrawn-ink"].includes(block.language),
    );

  const attachments = codeblocks.map((block) => {
    const content = JSON.parse(block.content) as InkFile;

    return content.filepath;
  });

  const duration = (Date.now() - indexingStart) / 1000;
  console.log(
    `Found ${attachments.length} attachments in Ink blocks in ${duration}ms.`,
  );
  console.groupEnd();
  return attachments;
}
