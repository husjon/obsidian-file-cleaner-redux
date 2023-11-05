import { ButtonComponent, Modal } from "obsidian";
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
