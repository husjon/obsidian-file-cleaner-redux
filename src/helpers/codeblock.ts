type CodeBlock = {
  content: string;
  language: string;
};
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
