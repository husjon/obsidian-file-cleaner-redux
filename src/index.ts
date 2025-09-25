import { FileView, Plugin, TFile } from "obsidian";
import {
  type FileCleanerSettings,
  DEFAULT_SETTINGS,
  FileCleanerSettingTab,
} from "./settings";
import { runCleanup, scanVault } from "./util";
import translate from "./i18n";
import { checkMarkdown } from "./helpers/markdown";
import { removeFile } from "./helpers/helpers";

export default class FileCleanerPlugin extends Plugin {
  plugin: FileCleanerPlugin;
  settings: FileCleanerSettings;

  lastOpenedFiles: TFile[] = [];

  async onload() {
    await this.loadSettings();

    this.addRibbonIcon(
      "trash",
      translate().Buttons.CleanFiles,
      this.runVaultCleanup,
    );

    this.addCommand({
      id: "clean-files",
      name: translate().Buttons.CleanFiles,
      callback: this.runVaultCleanup,
    });

    this.addSettingTab(new FileCleanerSettingTab(this.app, this));

    if (this.settings.runOnStartup) setTimeout(this.runVaultCleanup, 1000);

    this.registerEvent(
      this.app.workspace.on("layout-change", async () => {
        if (!this.settings.deleteEmptyFileOnClose) return;

        const currentlyOpenedFiles: TFile[] = this.app.workspace
          .getLeavesOfType("markdown")
          .map((leaf) => (leaf.view as FileView).file);

        this.lastOpenedFiles
          .filter((f) => !currentlyOpenedFiles.includes(f))
          .forEach(async (f) => {
            if (await checkMarkdown(f, this.app, this.settings))
              removeFile(f, this.app, this.settings);
          });

        this.lastOpenedFiles = currentlyOpenedFiles;
      }),
    );
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  private runVaultCleanup = async () => {
    const { filesToRemove, foldersToRemove } = await scanVault(
      this.app,
      this.settings,
    );
    runCleanup(filesToRemove, foldersToRemove, this.app, this.settings);
  };
}
