import { App, ButtonComponent, Modal, TAbstractFile } from "obsidian";
import translate from "./i18n";

export class ConfirmationModal extends Modal {
  title: string;
  content: HTMLElement;
  onConfirm: () => void;

  constructor(
    app: App,
    title: string,
    content: HTMLElement,
    onConfirm: () => void,
  ) {
    super(app);
    this.title = title;
    this.content = content;
    this.onConfirm = onConfirm;
  }
  onOpen(): void {
    this.titleEl.innerText = this.title;

    const contentContainer = this.contentEl.createDiv();
    contentContainer.append(this.content);

    const buttonContainer = this.contentEl.createDiv();
    buttonContainer.setCssStyles({
      cssFloat: "right",
      display: "flex",
      gap: "0.5em",
    });

    new ButtonComponent(buttonContainer)
      .setButtonText(translate().Modals.ButtonConfirm)
      .setWarning()
      .onClick(() => {
        this.onConfirm?.();
        this.close();
      });

    new ButtonComponent(buttonContainer)
      .setButtonText(translate().Modals.ButtonCancel)
      .onClick(() => {
        this.close();
      });
  }
}

interface DeletionConfirmationModalProps {
  app: App;
  files: TAbstractFile[];
  onConfirm?: () => void;
}
export function DeletionConfirmationModal({
  app,
  files,
  onConfirm,
}: DeletionConfirmationModalProps) {
  const modal = new ConfirmationModal(
    app,
    translate().Modals.DeletionConfirmation.Title,
    createEl("p", {
      text: translate().Modals.DeletionConfirmation.Text + ":",
    }),
    onConfirm,
  );

  const ul = modal.content.createEl("ul");

  files.map((file) => {
    const li = ul.createEl("li");
    li.innerHTML = `<a>${file.path}</a>`;
    li.onClickEvent(async () => {
      const leaf = await app.workspace.getLeaf();
      leaf.openFile(file);
    });
  });

  modal.open();
}

interface ResetSettingsModalProps {
  app: App;
  onConfirm?: () => void;
}
export function ResetSettingsModal({
  app,
  onConfirm,
}: ResetSettingsModalProps) {
  const modal = new ConfirmationModal(
    app,
    translate().Modals.ResetSettings.Title,
    createEl("p", { text: translate().Modals.ResetSettings.Text }),
    onConfirm,
  );

  modal.open();
}
