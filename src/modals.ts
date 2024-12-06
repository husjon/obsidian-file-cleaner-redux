import {
  App,
  ButtonComponent,
  Modal,
  TAbstractFile,
  TFile,
  TFolder,
} from "obsidian";
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
  files: filesAndFolders,
  onConfirm,
}: DeletionConfirmationModalProps) {
  const modal = new ConfirmationModal(
    app,
    translate().Modals.DeletionConfirmation.Title,
    createEl("p", {
      text: translate().Modals.DeletionConfirmation.Text,
    }),
    onConfirm,
  );

  const container = modal.content.createDiv();

  container.setCssStyles({
    marginTop: "0.5rem",
    maxHeight: "50vh",
    overflowY: "auto",
  });

  const files = filesAndFolders.filter((file) => file instanceof TFile);
  if (files.length > 0) {
    container.createEl("p", {
      text: translate().Modals.DeletionConfirmation.Files + ":",
    });
    const ulFiles = container.createEl("ul");
    files.map((file: TFile) => {
      const li = ulFiles.createEl("li");
      li.createEl("a", { text: file.path });
      li.onClickEvent(async () => {
        const leaf = await app.workspace.getLeaf();
        leaf.openFile(file);
      });
    });
  }

  const folders = filesAndFolders.filter((file) => file instanceof TFolder);
  if (folders.length > 0) {
    container.createEl("p", {
      text: translate().Modals.DeletionConfirmation.Folders + ":",
    });
    const ulFolders = container.createEl("ul");
    folders.map((file) => {
      const li = ulFolders.createEl("li");
      li.createEl("a", { text: file.path });
    });
  }

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
