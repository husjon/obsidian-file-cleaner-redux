import { AbstractInputSuggest, App } from "obsidian";

export class InputSuggester extends AbstractInputSuggest<string> {
  content: Set<string>;

  constructor(
    private inputEl: HTMLInputElement,
    content: Set<string>,
    private onSelectCb: (value: string) => void,
    app: App,
  ) {
    super(app, inputEl);
    this.content = content;
  }

  getSuggestions(inputStr: string): string[] {
    const lowerCaseInputStr = inputStr.toLocaleLowerCase();
    return [...this.content].filter((content) =>
      content.toLocaleLowerCase().contains(lowerCaseInputStr),
    );
  }

  renderSuggestion(content: string, el: HTMLElement): void {
    el.setText(content);
  }

  selectSuggestion(content: string, evt: MouseEvent | KeyboardEvent): void {
    this.content.delete(content);
    this.onSelectCb(content);

    const target = evt.target as HTMLElement;
    target.detach(); // remove the selected element from the visual list

    if (this.content.size < 1) this.inputEl.blur();
  }
}
