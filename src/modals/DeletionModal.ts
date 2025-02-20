import { App, TAbstractFile, TFile, TFolder } from "obsidian";
import { removeFiles } from "src/helpers/helpers";
import translate from "src/i18n";
import { ConfirmationModal } from "src/modals";
import { FileCleanerSettings } from "src/settings";

interface DeletionConfirmationModalProps {
  app: App;
  files: TAbstractFile[];
  settings: FileCleanerSettings;
}
export function DeletionConfirmationModal({
  app,
  files: filesAndFolders,
  settings,
}: DeletionConfirmationModalProps) {
  const filesAndFoldersToRemove = [...filesAndFolders];

  const modal = new ConfirmationModal(
    app,
    translate().Modals.DeletionConfirmation.Title,
    createEl("p", {
      text: translate().Modals.DeletionConfirmation.Text,
    }),
    async () => {
      await removeFiles(filesAndFoldersToRemove, app, settings);
    },
  );

  function updatedFilesAndFoldersToRemove(path: string, isSelected: boolean) {
    const files = filesAndFolders.filter((file) =>
      Object.keys(file).contains("extension"),
    ) as TFile[];
    const folders = filesAndFolders.filter(
      (folder) => !Object.keys(folder).contains("extension"),
    ) as TFolder[];

    const targetFile = files.filter((file) => file.path === path).pop();
    const targetFolder = folders.filter((folder) => folder.path === path).pop();

    if (isSelected) {
      if (targetFile)
        updatedFilesAndFoldersToRemove(targetFile.parent.path, isSelected);
      else
        targetFolder.children.forEach((child) =>
          filesAndFoldersToRemove.push(child),
        );

      filesAndFoldersToRemove.push(targetFile || targetFolder);
    } else {
      if (targetFile)
        updatedFilesAndFoldersToRemove(targetFile.parent.path, isSelected);
      else
        targetFolder.children.forEach((child) =>
          filesAndFoldersToRemove.remove(child),
        );

      filesAndFoldersToRemove.remove(targetFile || targetFolder);
    }
  }

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
      const checkbox = li.createEl("input", {
        type: "checkbox",
        value: file.path,
      });
      checkbox.checked = filesAndFoldersToRemove.contains(file);
      checkbox.onClickEvent((e) => {
        updatedFilesAndFoldersToRemove(file.path, checkbox.checked);
      });

      li.createEl("a", { text: file.path });
      li.onClickEvent(async () => {
        const leaf = app.workspace.getLeaf();
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
      const checkbox = li.createEl("input", {
        type: "checkbox",
        value: file.path,
      });
      checkbox.checked = filesAndFoldersToRemove.contains(file);
      checkbox.onClickEvent((e) => {
        updatedFilesAndFoldersToRemove(file.path, checkbox.checked);
      });

      li.createEl("a", { text: file.path });
    });
  }

  modal.open();
}
