import {
  App,
  PluginSettingTab,
  Setting,
  type SettingDefinitionItem,
} from "obsidian";
import FileCleanerPlugin from ".";
import translate from "./i18n";
import { Deletion, Notification } from "./enums";
import { ResetSettingsModal } from "./modals";
import { notify, userHasPlugin } from "./helpers/helpers";

export interface FileCleanerSettings {
  deletionDestination: Deletion;
  obsidianTrashCleanupAge: number;
  notifications: Notification;
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
  debugLogging: boolean;

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
  notifications: Notification.ShowAll,
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
  debugLogging: false,

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
  icon: string = "trash";

  constructor(app: App, plugin: FileCleanerPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  getSettingDefinitions(): SettingDefinitionItem<string>[] {
    return [
      // Regular options
      {
        name: translate().Settings.RegularOptions.DeletedFiles.Label,
        desc: translate().Settings.RegularOptions.DeletedFiles.Description,
        control: {
          type: "dropdown",
          key: "deletionDestination",
          defaultValue: "system",
          options: {
            system:
              translate().Settings.RegularOptions.DeletedFiles.Options
                .MoveToSystemTrash,
            obsidian:
              translate().Settings.RegularOptions.DeletedFiles.Options
                .MoveToObsidianTrash,
            permanent:
              translate().Settings.RegularOptions.DeletedFiles.Options
                .PermanentDelete,
          },
        },
        visible: () =>
          this.plugin.settings.deletionDestination === Deletion.ObsidianTrash,
      },
      {
        name: translate().Settings.RegularOptions.ObsidianTrashCleanupAge.Label,
        desc: translate().Settings.RegularOptions.ObsidianTrashCleanupAge
          .Description,
        control: {
          type: "number",
          key: "obsidianTrashCleanupAge",
          min: 1,
          defaultValue: 30,
        },
        visible: () =>
          this.plugin.settings.deletionDestination === Deletion.ObsidianTrash,
      },
      {
        name: translate().Settings.RegularOptions.Notifications.Label,
        desc: translate().Settings.RegularOptions.Notifications.Description,
        control: {
          type: "dropdown",
          key: "notifications",
          defaultValue: "system",
          options: {
            showAll:
              translate().Settings.RegularOptions.Notifications.Options
                .ShowAllNotifications,
            showOnlyErrors:
              translate().Settings.RegularOptions.Notifications.Options
                .ShowOnlyErrors,
            hideAll:
              translate().Settings.RegularOptions.Notifications.Options.HideAll,
          },
        },
      },

      // Folders
      {
        type: "group",
        heading: translate().Settings.Folders.Header,
        items: [
          {
            name: translate().Settings.Folders.RemoveFolders.Label,
            desc: translate().Settings.Folders.RemoveFolders.Description,
            control: { type: "toggle", key: "removeFolders" },
          },
          {
            name: translate().Settings.Folders.FolderFiltering.Label,
            desc: translate().Settings.Folders.FolderFiltering.Description,
            control: {
              type: "toggle",
              key: "excludeInclude",
              defaultValue: false,
            },
          },
          {
            // FIXME - attribute switching based on state does not work
            // TODO - maybe use visible and 2 blocks (one for include and one for exclude?)
            // TODO - might just be better to change to using the File or Folder control type (or custom variant in the case of extentions), see: https://docs.obsidian.md/Plugins/User+interface/Settings#What's+not+yet+a+first-class+control
            name: translate().Settings.Folders.FolderFiltering.Excluded.Label,
            desc: translate().Settings.Folders.FolderFiltering.Excluded
              .Description,
            visible: () => !this.plugin.settings.excludeInclude,
            render: (setting: Setting) => {
              setting.addTextArea((text) => {
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
                text.inputEl.setCssStyles({
                  minWidth: "18rem",
                  maxWidth: "18rem",
                  minHeight: "8rem",
                  maxHeight: "16rem",
                });
              });
            },
          },
          {
            // FIXME - attribute switching based on state does not work
            // TODO - maybe use visible and 2 blocks (one for include and one for exclude?)
            // TODO - might just be better to change to using the File or Folder control type (or custom variant in the case of extentions), see: https://docs.obsidian.md/Plugins/User+interface/Settings#What's+not+yet+a+first-class+control
            name: translate().Settings.Folders.FolderFiltering.Included.Label,
            desc: translate().Settings.Folders.FolderFiltering.Included
              .Description,
            visible: () => !!this.plugin.settings.excludeInclude,
            render: (setting: Setting) => {
              setting.addTextArea((text) => {
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
                text.inputEl.setCssStyles({
                  minWidth: "18rem",
                  maxWidth: "18rem",
                  minHeight: "8rem",
                  maxHeight: "16rem",
                });
              });
            },
          },
        ],
      },

      // Files
      {
        type: "group",
        heading: translate().Settings.Files.Header,
        items: [
          {
            name: translate().Settings.Files.Attachments.Label,
            desc: translate().Settings.Files.Attachments.Description,
            control: { type: "toggle", key: "attachmentsExcludeInclude" },
          },
        ],
      },
    ];
  }

  display(): void {
    const { containerEl } = this;
    this.containerEl.empty();

    new Setting(containerEl)
      .setName(translate().Settings.Files.Header)
      .setHeading();

    // #region Extension inclusion / exclusion
    new Setting(containerEl)
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

            await this.plugin.saveSettings();
          });
        text.setPlaceholder(
          this.plugin.settings.attachmentsExcludeInclude
            ? translate().Settings.Files.Attachments.Included.Placeholder
            : translate().Settings.Files.Attachments.Excluded.Placeholder,
        );
        text.inputEl.setCssStyles({
          minWidth: "18rem",
          maxWidth: "18rem",
          minHeight: "4rem",
          maxHeight: "8rem",
        });
      });
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

        text.onChange(async (value) => {
          const newAge = Number(value.trim());
          if (newAge >= 0) {
            this.plugin.settings.fileAgeThreshold = newAge;
            await this.plugin.saveSettings();
          } else text.setValue("0");
        });
      });
    // #endregion

    new Setting(containerEl)
      .setName(translate().Settings.MarkdownFiles.Header)
      .setHeading();

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

        toggle.onChange(async (value) => {
          this.plugin.settings.deleteEmptyMarkdownFiles = value;
          await this.plugin.saveSettings();
          this.display();
        });
      });
    // #endregion

    // #region Delete empty Markdown files
    if (this.plugin.settings.deleteEmptyMarkdownFiles) {
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

          toggle.onChange(async (value) => {
            this.plugin.settings.deleteEmptyMarkdownFilesWithBacklinks = value;
            await this.plugin.saveSettings();
            this.display();
          });
        });
    }
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

            await this.plugin.saveSettings();
          });
        text.setPlaceholder(
          translate().Settings.MarkdownFiles.IgnoredFrontmatter.Placeholder,
        );
        text.inputEl.setCssStyles({
          minWidth: "18rem",
          maxWidth: "18rem",
          minHeight: "4rem",
          maxHeight: "12rem",
        });
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

        toggle.onChange(async (value) => {
          this.plugin.settings.ignoreAllFrontmatter = value;
          await this.plugin.saveSettings();
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

            await this.plugin.saveSettings();
          });
        text.setPlaceholder(
          translate().Settings.MarkdownFiles.CodeblockParsing.Placeholder,
        );
        text.inputEl.setCssStyles({
          minWidth: "18rem",
          maxWidth: "18rem",
          minHeight: "4rem",
          maxHeight: "12rem",
        });
      })
      .controlEl.setCssStyles(
        this.plugin.settings.ignoreAllFrontmatter && {
          color: "",
        },
      );
    // #endregion

    // #region Close new tabs
    new Setting(containerEl)
      .setName(translate().Settings.Other.Header)
      .setHeading();

    new Setting(containerEl)
      .setName(translate().Settings.Other.CloseNewTabs.Label)
      .setDesc(translate().Settings.Other.CloseNewTabs.Description)
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.closeNewTabs);

        toggle.onChange(async (value) => {
          this.plugin.settings.closeNewTabs = value;
          await this.plugin.saveSettings();
        });
      });
    // #endregion

    // #region Delete empty file on close
    new Setting(containerEl)
      .setName(translate().Settings.Other.DeleteEmptyFileOnClose.Label)
      .setDesc(translate().Settings.Other.DeleteEmptyFileOnClose.Description)
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.deleteEmptyFileOnClose);

        toggle.onChange(async (value) => {
          this.plugin.settings.deleteEmptyFileOnClose = value;
          await this.plugin.saveSettings();
        });
      });
    // #endregion

    // #region Preview deleted files
    new Setting(containerEl)
      .setName(translate().Settings.Other.PreviewDeletedFiles.Label)
      .setDesc(translate().Settings.Other.PreviewDeletedFiles.Description)
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.deletionConfirmation);

        toggle.onChange(async (value) => {
          this.plugin.settings.deletionConfirmation = value;
          await this.plugin.saveSettings();
        });
      });
    // #endregion

    // #region Run on startup
    new Setting(containerEl)
      .setName(translate().Settings.Other.RunOnStartup.Label)
      .setDesc(translate().Settings.Other.RunOnStartup.Description)
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.runOnStartup);

        toggle.onChange(async (value) => {
          this.plugin.settings.runOnStartup = value;
          await this.plugin.saveSettings();
        });
      });
    // #endregion
    // #region Run on startup
    new Setting(containerEl)
      .setName(translate().Settings.Other.DebugLogging.Label)
      .setDesc(translate().Settings.Other.DebugLogging.Description)
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.debugLogging);

        toggle.onChange(async (value) => {
          this.plugin.settings.debugLogging = value;
          await this.plugin.saveSettings();
        });
      });
    // #endregion
    // #endregion Regular Options

    // #region External Plugin Options
    if (
      [...supportedPlugins].filter((plugin) => userHasPlugin(plugin, this.app))
        .length > 0
    ) {
      new Setting(containerEl)
        .setName(translate().Settings.ExternalPluginSupport.Header)
        .setHeading();

      // #region Excalidraw
      if (userHasPlugin("obsidian-excalidraw-plugin", this.app)) {
        new Setting(containerEl)
          .setName(translate().Settings.ExternalPluginSupport.Excalidraw.Header)
          .setHeading();

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

            toggle.onChange(async (value) => {
              this.plugin.settings.ExternalPlugins.Excalidraw.TreatAsAttachments =
                value;
              await this.plugin.saveSettings();
            });
          });
      }
      // #endregion Excalidraw
    }
    // #endregion External Plugin Options

    // #region Danger Zone
    new Setting(containerEl)
      .setName(translate().Settings.DangerZone.Header)
      .setHeading();

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
              onConfirm: async () => {
                this.plugin.settings = DEFAULT_SETTINGS;
                await this.plugin.saveSettings();
                this.display();
                await this.plugin.loadSettings();

                notify(translate().Notifications.SettingsReset);
              },
            });
          });
      });
    // #endregion
    // #endregion Danger Zone
  }
}
