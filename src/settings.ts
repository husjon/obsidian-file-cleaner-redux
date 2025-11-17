import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import FileCleanerPlugin from ".";
import translate from "./i18n";
import { Deletion } from "./enums";
import { ResetSettingsModal } from "./modals";
import { userHasPlugin } from "./helpers/helpers";

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
  deleteEmptyFileOnClose: boolean;

  ExternalPlugins: {
    Excalidraw: {
      TreatAsAttachments: boolean;
    };
  };
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
  deleteEmptyFileOnClose: false,

  ExternalPlugins: {
    Excalidraw: {
      TreatAsAttachments: false,
    },
  },
};

const supportedPlugins = new Set([
  // plugin IDs goes here
  "obsidian-excalidraw-plugin",
]);

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
      .setName(translate().Settings.RegularOptions.DeletedFiles.Label)
      .setDesc(translate().Settings.RegularOptions.DeletedFiles.Description)
      .addDropdown((dropdown) =>
        dropdown
          .addOption(
            "system",
            translate().Settings.RegularOptions.DeletedFiles.Options
              .MoveToSystemTrash,
          )
          .addOption(
            "obsidian",
            translate().Settings.RegularOptions.DeletedFiles.Options
              .MoveToObsidianTrash,
          )
          .addOption(
            "permanent",
            translate().Settings.RegularOptions.DeletedFiles.Options
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
    this.containerEl.createEl("h3", {
      text: translate().Settings.Folders.Header,
    });

    new Setting(containerEl)
      .setName(translate().Settings.Folders.RemoveFolders.Label)
      .setDesc(translate().Settings.Folders.RemoveFolders.Description)
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.removeFolders);

        toggle.onChange((value) => {
          this.plugin.settings.removeFolders = value;
          this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName(translate().Settings.Folders.FolderFiltering.Label)
      .setDesc(translate().Settings.Folders.FolderFiltering.Description)
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
          ? translate().Settings.Folders.FolderFiltering.Included.Label
          : translate().Settings.Folders.FolderFiltering.Excluded.Label,
      )
      .setDesc(
        this.plugin.settings.excludeInclude
          ? translate().Settings.Folders.FolderFiltering.Included.Description
          : translate().Settings.Folders.FolderFiltering.Excluded.Description,
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
          translate().Settings.Folders.FolderFiltering.Placeholder,
        );
        text.inputEl.style.minWidth = "18rem";
        text.inputEl.style.maxWidth = "18rem";
        text.inputEl.style.minHeight = "8rem";
        text.inputEl.style.maxHeight = "16rem";
      });
    // #endregion

    this.containerEl.createEl("h3", {
      text: translate().Settings.Files.Header,
    });

    // #region Extension inclusion / exclusion
    new Setting(containerEl)
      .setName(translate().Settings.Files.Attachments.Label)
      .setDesc(translate().Settings.Files.Attachments.Description)
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

    const attachmentExcludeIncludeSetting = new Setting(containerEl)
      .setName(
        this.plugin.settings.attachmentsExcludeInclude
          ? translate().Settings.Files.Attachments.Included.Label
          : translate().Settings.Files.Attachments.Excluded.Label,
      )
      .setDesc(
        this.plugin.settings.attachmentsExcludeInclude
          ? translate().Settings.Files.Attachments.Included.Description
          : translate().Settings.Files.Attachments.Excluded.Description,
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
            ? translate().Settings.Files.Attachments.Included.Placeholder
            : translate().Settings.Files.Attachments.Excluded.Placeholder,
        );
        text.inputEl.style.minWidth = "18rem";
        text.inputEl.style.maxWidth = "18rem";
        text.inputEl.style.minHeight = "4rem";
        text.inputEl.style.maxHeight = "8rem";
      });
    attachmentExcludeIncludeSetting.descEl.setHTMLUnsafe(
      this.plugin.settings.attachmentsExcludeInclude
        ? translate().Settings.Files.Attachments.Included.Description
        : translate().Settings.Files.Attachments.Excluded.Description,
    );
    // #endregion

    // #region File age threshold
    new Setting(containerEl)
      .setName(translate().Settings.Files.FileAgeThreshold.Label)
      .setDesc(translate().Settings.Files.FileAgeThreshold.Description)
      .addText((text) => {
        text.setPlaceholder("0");
        text.inputEl.type = "number";
        text.inputEl.min = "0";

        if (this.plugin.settings.fileAgeThreshold > 0)
          text.setValue(String(this.plugin.settings.fileAgeThreshold));

        text.onChange((value) => {
          const newAge = Number(value.trim());
          if (newAge >= 0) {
            this.plugin.settings.fileAgeThreshold = newAge;
            this.plugin.saveSettings();
          } else text.setValue("0");
        });
      });
    // #endregion

    this.containerEl.createEl("h4", {
      text: translate().Settings.MarkdownFiles.Header,
    });

    // #region Delete empty Markdown files
    new Setting(containerEl)
      .setName(
        translate().Settings.MarkdownFiles.DeleteEmptyMarkdownFiles.Label,
      )
      .setDesc(
        translate().Settings.MarkdownFiles.DeleteEmptyMarkdownFiles.Description,
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
          translate().Settings.MarkdownFiles
            .DeleteEmptyMarkdownFilesWithBacklinks.Label,
        )
        .setDesc(
          translate().Settings.MarkdownFiles
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
      .setName(translate().Settings.MarkdownFiles.IgnoredFrontmatter.Label)
      .setDesc(
        translate().Settings.MarkdownFiles.IgnoredFrontmatter.Description,
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
          translate().Settings.MarkdownFiles.IgnoredFrontmatter.Placeholder,
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
      .setName(translate().Settings.MarkdownFiles.IgnoreAllFrontmatter.Label)
      .setDesc(
        translate().Settings.MarkdownFiles.IgnoreAllFrontmatter.Description,
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
      .setName(translate().Settings.MarkdownFiles.CodeblockParsing.Label)
      .setDesc(translate().Settings.MarkdownFiles.CodeblockParsing.Description)
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
          translate().Settings.MarkdownFiles.CodeblockParsing.Placeholder,
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

    // #region Close new tabs
    this.containerEl.createEl("h3", {
      text: translate().Settings.Other.Header,
    });

    new Setting(containerEl)
      .setName(translate().Settings.Other.CloseNewTabs.Label)
      .setDesc(translate().Settings.Other.CloseNewTabs.Description)
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.closeNewTabs);

        toggle.onChange((value) => {
          this.plugin.settings.closeNewTabs = value;
          this.plugin.saveSettings();
        });
      });
    // #endregion

    // #region Delete empty file on close
    new Setting(containerEl)
      .setName(translate().Settings.Other.DeleteEmptyFileOnClose.Label)
      .setDesc(translate().Settings.Other.DeleteEmptyFileOnClose.Description)
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.deleteEmptyFileOnClose);

        toggle.onChange((value) => {
          this.plugin.settings.deleteEmptyFileOnClose = value;
          this.plugin.saveSettings();
        });
      });
    // #endregion

    // #region Preview deleted files
    new Setting(containerEl)
      .setName(translate().Settings.Other.PreviewDeletedFiles.Label)
      .setDesc(translate().Settings.Other.PreviewDeletedFiles.Description)
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.deletionConfirmation);

        toggle.onChange((value) => {
          this.plugin.settings.deletionConfirmation = value;
          this.plugin.saveSettings();
        });
      });
    // #endregion

    // #region Run on startup
    new Setting(containerEl)
      .setName(translate().Settings.Other.RunOnStartup.Label)
      .setDesc(translate().Settings.Other.RunOnStartup.Description)
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.runOnStartup);

        toggle.onChange((value) => {
          this.plugin.settings.runOnStartup = value;
          this.plugin.saveSettings();
        });
      });
    // #endregion
    // #endregion Regular Options

    // #region External Plugin Options
    if (
      [...supportedPlugins].filter((plugin) => userHasPlugin(plugin, this.app))
        .length > 0
    ) {
      this.containerEl.createEl("h3", {
        text: translate().Settings.ExternalPluginSupport.Header,
      });

      // #region Excalidraw
      if (userHasPlugin("obsidian-excalidraw-plugin", this.app)) {
        this.containerEl.createEl("h4", {
          text: translate().Settings.ExternalPluginSupport.Excalidraw.Header,
        });

        new Setting(containerEl)
          .setName(
            translate().Settings.ExternalPluginSupport.Excalidraw
              .TreatAsAttachments.Label,
          )
          .setDesc(
            translate().Settings.ExternalPluginSupport.Excalidraw
              .TreatAsAttachments.Description,
          )
          .addToggle((toggle) => {
            toggle.setValue(
              this.plugin.settings.ExternalPlugins.Excalidraw
                .TreatAsAttachments,
            );

            toggle.onChange((value) => {
              this.plugin.settings.ExternalPlugins.Excalidraw.TreatAsAttachments =
                value;
              this.plugin.saveSettings();
            });
          });
      }
      // #endregion Excalidraw
    }
    // #endregion External Plugin Options

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
