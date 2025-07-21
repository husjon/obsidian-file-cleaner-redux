import { App, Modal, TAbstractFile } from "obsidian";
import { mount, unmount } from "svelte";
import translate from "src/i18n";
import type { FileCleanerSettings } from "src/settings";
import DeletionConfirmationModalComponent from "./DeletionConfirmationModalComponent.svelte";

export class DeletionConfirmationModal extends Modal {
  private component:
    | ReturnType<typeof DeletionConfirmationModalComponent>
    | undefined;

  filesAndFolders: TAbstractFile[] = [];
  settings: FileCleanerSettings;

  constructor({
    app,
    filesAndFolders,
    settings,
  }: {
    app: App;
    filesAndFolders: TAbstractFile[];
    settings: FileCleanerSettings;
  }) {
    super(app);

    this.filesAndFolders = filesAndFolders;
    this.settings = settings;

    this.modalEl.style.maxWidth = "90%";

    this.open();
  }

  async onOpen(): Promise<void> {
    this.titleEl.innerText = translate().Modals.DeletionConfirmation.Title;

    this.component = mount(DeletionConfirmationModalComponent, {
      target: this.contentEl,
      props: {
        app: this.app,
        settings: this.settings,
        filesAndFolders: this.filesAndFolders,

        closeModal: () => this.close(),
      },
    });

    const buttonContainer = this.contentEl.createDiv();
    buttonContainer.setCssStyles({
      cssFloat: "right",
      display: "flex",
      gap: "0.5em",
    });
  }

  async onClose() {
    unmount(this.component);
  }
}
