import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import FileCleanerPlugin from ".";
import translate from "./i18n";
import { Deletion } from "./enums";
import { ResetSettingsModal } from "./helpers";

export interface FileCleanerSettings {
  deletionDestination: Deletion;
  excludedFolders: string[];
  attachmentExtensions: string[];
  deletionConfirmation: boolean;
  runOnStartup: boolean;
}

export const DEFAULT_SETTINGS: FileCleanerSettings = {
  deletionDestination: Deletion.SystemTrash,
  excludedFolders: [],
  attachmentExtensions: [],
  deletionConfirmation: true,
  runOnStartup: false,
};

export class FileCleanerSettingTab extends PluginSettingTab {
  plugin: FileCleanerPlugin;

  constructor(app: App, plugin: FileCleanerPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    this.containerEl.empty();

    //#region Regular Options {{{
    this.containerEl.createEl("h3", {
      text: translate().Settings.RegularOptions.Header,
    });

    new Setting(containerEl)
      .setName(translate().Settings.RegularOptions.CleanedFiles.Label)
      .setDesc(translate().Settings.RegularOptions.CleanedFiles.Description)
      .addDropdown((dropdown) =>
        dropdown
          .addOption(
            "system",
            translate().Settings.RegularOptions.CleanedFiles.Options
              .MoveToSystemTrash,
          )
          .addOption(
            "obsidian",
            translate().Settings.RegularOptions.CleanedFiles.Options
              .MoveToObsidianTrash,
          )
          .addOption(
            "permanent",
            translate().Settings.RegularOptions.CleanedFiles.Options
              .PermanentDelete,
          )
          .setValue(this.plugin.settings.deletionDestination)
          .onChange((value) => {
            switch (value) {
              case Deletion.Permanent:
                this.plugin.settings.deletionDestination = Deletion.Permanent;
                break;

              case Deletion.ObsidianTrash:
                this.plugin.settings.deletionDestination =
                  Deletion.ObsidianTrash;
                break;

              default:
              case Deletion.SystemTrash:
                this.plugin.settings.deletionDestination = Deletion.SystemTrash;
                break;
            }
            this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName(translate().Settings.RegularOptions.ExcludedFolders.Label)
      .setDesc(translate().Settings.RegularOptions.ExcludedFolders.Description)
      .addTextArea((text) => {
        text
          .setValue(this.plugin.settings.excludedFolders.join("\n"))
          .onChange(async (value) => {
            this.plugin.settings.excludedFolders = value
              .split(/\n/)
              .map((ext) => ext.trim())
              .filter((ext) => ext !== "");

            this.plugin.saveSettings();
          });
        text.setPlaceholder(
          translate().Settings.RegularOptions.ExcludedFolders.Placeholder,
        );
        text.inputEl.rows = 8;
        text.inputEl.cols = 30;
      });

    new Setting(containerEl)
      .setName(translate().Settings.RegularOptions.Attachments.Label)
      .setDesc(translate().Settings.RegularOptions.Attachments.Description)
      .addTextArea((text) => {
        text
          .setValue(
            this.plugin.settings.attachmentExtensions
              .map((ext) => `.${ext}`)
              .join(", "),
          )
          .onChange(async (value) => {
            this.plugin.settings.attachmentExtensions = value
              .split(",")
              .map((ext) => ext.trim())
              .filter((ext) => ext.startsWith(".") && ext.length > 1)
              .filter((ext) => ext !== "")
              .map((ext) => ext.replace(/^\./, ""));

            this.plugin.saveSettings();
          });
        text.setPlaceholder(
          translate().Settings.RegularOptions.Attachments.Placeholder,
        );
        text.inputEl.rows = 3;
        text.inputEl.cols = 30;
      });

    new Setting(containerEl)
      .setName(translate().Settings.RegularOptions.PreviewDeletedFiles.Label)
      .setDesc(
        translate().Settings.RegularOptions.PreviewDeletedFiles.Description,
      )
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.deletionConfirmation);

        toggle.onChange((value) => {
          this.plugin.settings.deletionConfirmation = value;
          this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName(translate().Settings.RegularOptions.RunOnStartup.Label)
      .setDesc(translate().Settings.RegularOptions.RunOnStartup.Description)
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.runOnStartup);

        toggle.onChange((value) => {
          this.plugin.settings.runOnStartup = value;
          this.plugin.saveSettings();
        });
      });
    //#endregion Regular Options }}}

    //#region Danger Zone {{{
    this.containerEl.createEl("h3", {
      text: translate().Settings.DangerZone.Header,
    });

    new Setting(containerEl)
      .setName(translate().Settings.DangerZone.ResetSettings.Label)
      .setDesc(translate().Settings.DangerZone.ResetSettings.Description)
      .addButton((button) => {
        button
          .setWarning()
          .setButtonText(translate().Settings.DangerZone.ResetSettings.Button)
          .onClick(() => {
            ResetSettingsModal({
              app: this.app,
              onConfirm: () => {
                this.plugin.settings = DEFAULT_SETTINGS;
                this.plugin.saveSettings();

                new Notice(translate().Notifications.SettingsReset);
              },
            });
          });
      });
    //#endregion Danger Zone }}}
  }
}
