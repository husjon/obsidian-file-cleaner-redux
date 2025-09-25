import { Plugin } from "obsidian";
import {
  type FileCleanerSettings,
  DEFAULT_SETTINGS,
  FileCleanerSettingTab,
} from "./settings";
import { runCleanup } from "./util";
import translate from "./i18n";

export default class FileCleanerPlugin extends Plugin {
  plugin: FileCleanerPlugin;
  settings: FileCleanerSettings;

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
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  private runVaultCleanup = async () => {
    runCleanup(this.app, this.settings);
  };
}
