import { AbstractInputSuggest, App } from "obsidian";

export class SimpleSuggester extends AbstractInputSuggest<string> {
  content: string[];
  textInputEl: HTMLInputElement;
  cb: (value: string) => void;

  constructor(
    app: App,
    textInputEl: HTMLInputElement,
    content: string[],
    cb: (value: string) => void,
  ) {
    super(app, textInputEl);

    this.textInputEl = textInputEl;
    this.content = content;
    this.cb = cb;
  }

  protected getSuggestions(query: string): string[] | Promise<string[]> {
    // Returns the filtered content using simple fuzzy search
    return this.content.filter((entry) =>
      entry.toLocaleLowerCase().match(RegExp(`${query.replace(/\s+/, ".*")}`)),
    );
  }

  selectSuggestion(value: string, _: MouseEvent | KeyboardEvent): void {
    console.log(`Add: "${value}" to the UI`);

    this.textInputEl.value = "";
    this.textInputEl.blur();

    this.cb(value);
  }

  renderSuggestion(value: string, el: HTMLElement): void {
    el.setText(value);
  }
}
