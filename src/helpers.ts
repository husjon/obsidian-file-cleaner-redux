import { App, ButtonComponent, Modal, TFile } from "obsidian";
import translate from "./i18n";

interface ConfirmationModalProps {
  text: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onConfirm?: any;
}
export function ConfirmationModal({ text, onConfirm }: ConfirmationModalProps) {
  const modal = new Modal(this.app);

  modal.contentEl.createEl("p", {
    text: document.createRange().createContextualFragment(text),
  });

  new ButtonComponent(modal.contentEl)
    .setButtonText(translate().Modals.ButtonNo)
    .onClick(() => {
      modal.close();
    }).buttonEl.style.marginRight = "1em";

  new ButtonComponent(modal.contentEl)
    .setButtonText(translate().Modals.ButtonYes)
    .setWarning()
    .onClick(() => {
      onConfirm?.();
      modal.close();
    });

  modal.open();
}

interface DeletionModalProps {
  files: TFile[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onConfirm?: any;
  app: App;
}
export function DeletionModal({ files, onConfirm, app }: DeletionModalProps) {
  const modal = new Modal(this.app);

  modal.contentEl.createEl("p", {
    text: "The following files will be removed:",
  });

  const ul = modal.contentEl.createEl("ul");

  files.map((file) => {
    const li = ul.createEl("li");
    li.innerHTML = `<a>${file.path}</a>`;
    li.onClickEvent(async () => {
      const leaf = await app.workspace.getLeaf();
      leaf.openFile(file);
    });
  });

  new ButtonComponent(modal.contentEl)
    .setButtonText(translate().Modals.ButtonNo)
    .onClick(() => {
      modal.close();
    }).buttonEl.style.marginRight = "1em";

  new ButtonComponent(modal.contentEl)
    .setButtonText(translate().Modals.ButtonYes)
    .setWarning()
    .onClick(() => {
      onConfirm?.();
      modal.close();
    });

  modal.open();
}
