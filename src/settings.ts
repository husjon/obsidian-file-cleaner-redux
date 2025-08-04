import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import FileCleanerPlugin from ".";
import translate from "./i18n";
import { Deletion } from "./enums";
import { ResetSettingsModal } from "./modals";

export interface FileCleanerSettings {
  deletionDestination: Deletion;
  obsidianTrashCleanupAge: number;
  excludeInclude: ExcludeInclude;
  excludedFolders: string[];
  attachmentsExcludeInclude: ExcludeInclude;
  attachmentExtensions: string[];
  deletionConfirmation: boolean;
  runOnStartup: boolean;
  removeFolders: boolean;
  ignoredFrontmatter: string[];
  ignoreAllFrontmatter: boolean;
  codeblockTypes: string[];
  deleteEmptyMarkdownFiles: boolean;
  deleteEmptyMarkdownFilesWithBacklinks: boolean;
  fileAgeThreshold: number;
  closeNewTabs: boolean;
}
export enum ExcludeInclude {
  Exclude = Number(false),
  Include = Number(true),
}

export const DEFAULT_SETTINGS: FileCleanerSettings = {
  deletionDestination: Deletion.SystemTrash,
  obsidianTrashCleanupAge: -1,
  excludeInclude: ExcludeInclude.Exclude,
  excludedFolders: [],
  attachmentsExcludeInclude: ExcludeInclude.Include,
  attachmentExtensions: [],
  deletionConfirmation: true,
  runOnStartup: false,
  removeFolders: false,
  ignoredFrontmatter: [],
  ignoreAllFrontmatter: false,
  codeblockTypes: [],
  deleteEmptyMarkdownFiles: true,
  deleteEmptyMarkdownFilesWithBacklinks: false,
  fileAgeThreshold: 0,
  closeNewTabs: false,
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

    // #region Regular Options
    // #region Deleted files
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
            this.display();
          }),
      );
    this.plugin.settings.deletionDestination === Deletion.ObsidianTrash &&
      new Setting(containerEl)
        .setName(
          translate().Settings.RegularOptions.ObsidianTrashCleanupAge.Label,
        )
        .setDesc(
          translate().Settings.RegularOptions.ObsidianTrashCleanupAge
            .Description,
        )
        .addText((text) => {
          const days = this.plugin.settings.obsidianTrashCleanupAge;

          text.setPlaceholder("7");
          text.setValue(days >= 0 ? String(days) : "");
          text.inputEl.style.minWidth = "18rem";

          text.onChange((value) => {
            const days = Number(value.match(/^\d+/)) || -1;

            this.plugin.settings.obsidianTrashCleanupAge = days;
            this.plugin.saveSettings();
          });
        });
    // #endregion

    // #region Folder inclusion / exclusion
    new Setting(containerEl)
      .setName(translate().Settings.RegularOptions.FolderFiltering.Label)
      .setDesc(translate().Settings.RegularOptions.FolderFiltering.Description)
      .addToggle((toggle) => {
        toggle.setValue(Boolean(this.plugin.settings.excludeInclude));

        toggle.onChange((value) => {
          this.plugin.settings.excludeInclude = Number(value);
          this.plugin.saveSettings();
          this.display();
        });
      });

    new Setting(containerEl)
      .setName(
        this.plugin.settings.excludeInclude
          ? translate().Settings.RegularOptions.FolderFiltering.Included.Label
          : translate().Settings.RegularOptions.FolderFiltering.Excluded.Label,
      )
      .setDesc(
        this.plugin.settings.excludeInclude
          ? translate().Settings.RegularOptions.FolderFiltering.Included
              .Description
          : translate().Settings.RegularOptions.FolderFiltering.Excluded
              .Description,
      )
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
          translate().Settings.RegularOptions.FolderFiltering.Placeholder,
        );
        text.inputEl.style.minWidth = "18rem";
        text.inputEl.style.maxWidth = "18rem";
        text.inputEl.style.minHeight = "8rem";
        text.inputEl.style.maxHeight = "16rem";
      });
    // #endregion

    // #region Extension inclusion / exclusion
    new Setting(containerEl)
      .setName(translate().Settings.RegularOptions.Attachments.Label)
      .setDesc(translate().Settings.RegularOptions.Attachments.Description)
      .addToggle((toggle) => {
        toggle.setValue(
          Boolean(this.plugin.settings.attachmentsExcludeInclude),
        );

        toggle.onChange((value) => {
          this.plugin.settings.attachmentsExcludeInclude = Number(value);
          this.plugin.saveSettings();
          this.display();
        });
      });

    new Setting(containerEl)
      .setName(
        this.plugin.settings.attachmentsExcludeInclude
          ? translate().Settings.RegularOptions.Attachments.Included.Label
          : translate().Settings.RegularOptions.Attachments.Excluded.Label,
      )
      .setDesc(
        this.plugin.settings.attachmentsExcludeInclude
          ? translate().Settings.RegularOptions.Attachments.Included.Description
          : translate().Settings.RegularOptions.Attachments.Excluded
              .Description,
      )
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
          this.plugin.settings.attachmentsExcludeInclude
            ? translate().Settings.RegularOptions.Attachments.Included
                .Placeholder
            : translate().Settings.RegularOptions.Attachments.Excluded
                .Placeholder,
        );
        text.inputEl.style.minWidth = "18rem";
        text.inputEl.style.maxWidth = "18rem";
        text.inputEl.style.minHeight = "4rem";
        text.inputEl.style.maxHeight = "8rem";
      });
    // #endregion

    // #region Delete empty Markdown files
    new Setting(containerEl)
      .setName(
        translate().Settings.RegularOptions.DeleteEmptyMarkdownFiles.Label,
      )
      .setDesc(
        translate().Settings.RegularOptions.DeleteEmptyMarkdownFiles
          .Description,
      )
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.deleteEmptyMarkdownFiles);

        toggle.onChange((value) => {
          this.plugin.settings.deleteEmptyMarkdownFiles = value;
          this.plugin.saveSettings();
          this.display();
        });
      });
    // #endregion

    // #region Delete empty Markdown files
    this.plugin.settings.deleteEmptyMarkdownFiles &&
      new Setting(containerEl)
        .setName(
          translate().Settings.RegularOptions
            .DeleteEmptyMarkdownFilesWithBacklinks.Label,
        )
        .setDesc(
          translate().Settings.RegularOptions
            .DeleteEmptyMarkdownFilesWithBacklinks.Description,
        )
        .addToggle((toggle) => {
          toggle.setValue(
            this.plugin.settings.deleteEmptyMarkdownFilesWithBacklinks,
          );

          toggle.onChange((value) => {
            this.plugin.settings.deleteEmptyMarkdownFilesWithBacklinks = value;
            this.plugin.saveSettings();
            this.display();
          });
        });
    // #endregion

    // #region Ignored frontmatter
    new Setting(containerEl)
      .setName(translate().Settings.RegularOptions.IgnoredFrontmatter.Label)
      .setDesc(
        translate().Settings.RegularOptions.IgnoredFrontmatter.Description,
      )
      .addTextArea((text) => {
        text
          .setValue(this.plugin.settings.ignoredFrontmatter.join(", "))
          .onChange(async (value) => {
            this.plugin.settings.ignoredFrontmatter = value
              .split(",")
              .map((ext) => ext.trim())
              .filter((ext) => ext.length > 1 && ext !== "");

            this.plugin.saveSettings();
          });
        text.setPlaceholder(
          translate().Settings.RegularOptions.IgnoredFrontmatter.Placeholder,
        );
        text.inputEl.style.minWidth = "18rem";
        text.inputEl.style.maxWidth = "18rem";
        text.inputEl.style.minHeight = "4rem";
        text.inputEl.style.maxHeight = "12rem";
      })
      .setDisabled(
        this.plugin.settings.ignoreAllFrontmatter ||
          !this.plugin.settings.deleteEmptyMarkdownFiles,
      )
      .controlEl.setCssStyles(
        this.plugin.settings.ignoreAllFrontmatter && {
          color: "",
        },
      );

    new Setting(containerEl)
      .setName(translate().Settings.RegularOptions.IgnoreAllFrontmatter.Label)
      .setDesc(
        translate().Settings.RegularOptions.IgnoreAllFrontmatter.Description,
      )
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.ignoreAllFrontmatter);

        toggle.onChange((value) => {
          this.plugin.settings.ignoreAllFrontmatter = value;
          this.plugin.saveSettings();
          this.display();
        });
      })
      .setDisabled(!this.plugin.settings.deleteEmptyMarkdownFiles);
    // #endregion

    // #region Codeblock parsing
    new Setting(containerEl)
      .setName(translate().Settings.RegularOptions.CodeblockParsing.Label)
      .setDesc(translate().Settings.RegularOptions.CodeblockParsing.Description)
      .addTextArea((text) => {
        text
          .setValue(this.plugin.settings.codeblockTypes.join(", "))
          .onChange(async (value) => {
            this.plugin.settings.codeblockTypes = value
              .split(",")
              .map((ext) => ext.trim())
              .filter((ext) => ext.length > 1 && ext !== "");

            this.plugin.saveSettings();
          });
        text.setPlaceholder(
          translate().Settings.RegularOptions.CodeblockParsing.Placeholder,
        );
        text.inputEl.style.minWidth = "18rem";
        text.inputEl.style.maxWidth = "18rem";
        text.inputEl.style.minHeight = "4rem";
        text.inputEl.style.maxHeight = "12rem";
      })
      .controlEl.setCssStyles(
        this.plugin.settings.ignoreAllFrontmatter && {
          color: "",
        },
      );
    // #endregion

    // #region File age threshold
    new Setting(containerEl)
      .setName(translate().Settings.RegularOptions.FileAgeThreshold.Label)
      .setDesc(translate().Settings.RegularOptions.FileAgeThreshold.Description)
      .addText((text) => {
        text.setPlaceholder("0");

        if (this.plugin.settings.fileAgeThreshold > 0)
          text.setValue(String(this.plugin.settings.fileAgeThreshold));

        text.onChange((value) => {
          const newAge = Number(value.trim());
          if (newAge >= 0) {
            this.plugin.settings.fileAgeThreshold = newAge;
            this.plugin.saveSettings();
          }
        });
      });
    // #endregion

    // #region Close new tabs
    new Setting(containerEl)
      .setName(translate().Settings.RegularOptions.CloseNewTabs.Label)
      .setDesc(translate().Settings.RegularOptions.CloseNewTabs.Description)
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.closeNewTabs);

        toggle.onChange((value) => {
          this.plugin.settings.closeNewTabs = value;
          this.plugin.saveSettings();
        });
      });
    // #endregion

    // #region Preview deleted files
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
    // #endregion

    // #region Remove folders
    new Setting(containerEl)
      .setName(translate().Settings.RegularOptions.RemoveFolders.Label)
      .setDesc(translate().Settings.RegularOptions.RemoveFolders.Description)
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.removeFolders);

        toggle.onChange((value) => {
          this.plugin.settings.removeFolders = value;
          this.plugin.saveSettings();
        });
      });
    // #endregion

    // #region Run on startup
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
    // #endregion
    // #endregion Regular Options

    // #region Danger Zone
    this.containerEl.createEl("h3", {
      text: translate().Settings.DangerZone.Header,
    });

    // #region Reset settings
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
                this.display();
                this.plugin.loadSettings();

                new Notice(translate().Notifications.SettingsReset);
              },
            });
          });
      });
    // #endregion
    // #endregion Danger Zone
  }
}
