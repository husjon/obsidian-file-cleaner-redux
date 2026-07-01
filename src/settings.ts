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
          {
            // FIXME - attribute switching based on state does not work
            // TODO - maybe use visible and 2 blocks (one for include and one for exclude?)
            // TODO - might just be better to change to using the File or Folder control type (or custom variant in the case of extentions), see: https://docs.obsidian.md/Plugins/User+interface/Settings#What's+not+yet+a+first-class+control
            name: translate().Settings.Files.Attachments.Excluded.Label,
            desc: translate().Settings.Files.Attachments.Excluded.Description,
            visible: () => !this.plugin.settings.attachmentsExcludeInclude,
            render: (setting: Setting) => {
              setting.addTextArea((text) => {
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

                    console.log(this.plugin.settings.attachmentExtensions);
                    this.plugin.saveSettings();
                  });
                text.setPlaceholder(
                  translate().Settings.Files.Attachments.Excluded.Placeholder,
                );
                text.inputEl.setCssStyles({
                  minWidth: "18rem",
                  maxWidth: "18rem",
                  minHeight: "4rem",
                  maxHeight: "8rem",
                });
              });
            },
          },
          {
            // FIXME - attribute switching based on state does not work
            // TODO - maybe use visible and 2 blocks (one for include and one for exclude?)
            // TODO - might just be better to change to using the File or Folder control type (or custom variant in the case of extentions), see: https://docs.obsidian.md/Plugins/User+interface/Settings#What's+not+yet+a+first-class+control
            name: translate().Settings.Files.Attachments.Included.Label,
            desc: translate().Settings.Files.Attachments.Included.Description,
            visible: () => !!this.plugin.settings.attachmentsExcludeInclude,
            render: (setting: Setting) => {
              setting.addTextArea((text) => {
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

                    console.log(this.plugin.settings.attachmentExtensions);
                    this.plugin.saveSettings();
                  });
                text.setPlaceholder(
                  translate().Settings.Files.Attachments.Included.Placeholder,
                );
                text.inputEl.setCssStyles({
                  minWidth: "18rem",
                  maxWidth: "18rem",
                  minHeight: "4rem",
                  maxHeight: "8rem",
                });
              });
            },
          },
          {
            name: translate().Settings.Files.FileAgeThreshold.Label,
            desc: translate().Settings.Files.FileAgeThreshold.Description,
            control: {
              type: "number",
              key: "fileAgeThreshold",
              min: 0,
              defaultValue: 0,
            },
          },
        ],
      },

      // Markdown files
      {
        type: "group",
        heading: translate().Settings.MarkdownFiles.Header,
        items: [
          {
            name: translate().Settings.MarkdownFiles.DeleteEmptyMarkdownFiles
              .Label,
            desc: translate().Settings.MarkdownFiles.DeleteEmptyMarkdownFiles
              .Description,
            control: { type: "toggle", key: "deleteEmptyMarkdownFiles" },
          },
          {
            name: translate().Settings.MarkdownFiles
              .DeleteEmptyMarkdownFilesWithBacklinks.Label,
            desc: translate().Settings.MarkdownFiles
              .DeleteEmptyMarkdownFilesWithBacklinks.Description,
            control: {
              type: "toggle",
              key: "deleteEmptyMarkdownFilesWithBacklinks",
            },
          },
          {
            name: translate().Settings.MarkdownFiles.IgnoredFrontmatter.Label,
            desc: translate().Settings.MarkdownFiles.IgnoredFrontmatter
              .Description,
            disabled: () => this.plugin.settings.ignoreAllFrontmatter,
            render: (setting: Setting) => {
              setting.addTextArea((text) => {
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
                  translate().Settings.MarkdownFiles.IgnoredFrontmatter
                    .Placeholder,
                );
                text.inputEl.setCssStyles({
                  minWidth: "18rem",
                  maxWidth: "18rem",
                  minHeight: "4rem",
                  maxHeight: "12rem",
                });
              });
            },
          },
          {
            name: translate().Settings.MarkdownFiles.IgnoreAllFrontmatter.Label,
            desc: translate().Settings.MarkdownFiles.IgnoreAllFrontmatter
              .Description,
            control: { type: "toggle", key: "ignoreAllFrontmatter" },
          },
          {
            name: translate().Settings.MarkdownFiles.CodeblockParsing.Label,
            desc: translate().Settings.MarkdownFiles.CodeblockParsing
              .Description,
            disabled: () => this.plugin.settings.ignoreAllFrontmatter,
            render: (setting: Setting) => {
              setting
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
                    translate().Settings.MarkdownFiles.CodeblockParsing
                      .Placeholder,
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
            },
          },
        ],
      },

      // Other
      {
        type: "group",
        heading: translate().Settings.Other.Header,
        items: [
          {
            name: translate().Settings.Other.CloseNewTabs.Label,
            desc: translate().Settings.Other.CloseNewTabs.Description,
            control: { type: "toggle", key: "closeNewTabs" },
          },
          {
            name: translate().Settings.Other.DeleteEmptyFileOnClose.Label,
            desc: translate().Settings.Other.DeleteEmptyFileOnClose.Description,
            control: { type: "toggle", key: "deleteEmptyFileOnClose" },
          },
          {
            name: translate().Settings.Other.PreviewDeletedFiles.Label,
            desc: translate().Settings.Other.PreviewDeletedFiles.Description,
            control: { type: "toggle", key: "deletionConfirmation" },
          },
        ],
      },
    ];
  }

  display(): void {
    const { containerEl } = this;
    this.containerEl.empty();

    // #region Close new tabs
    new Setting(containerEl)
      .setName(translate().Settings.Other.Header)
      .setHeading();

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
