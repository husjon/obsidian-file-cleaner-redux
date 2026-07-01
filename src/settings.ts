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
          {
            name: translate().Settings.Other.RunOnStartup.Label,
            desc: translate().Settings.Other.RunOnStartup.Description,
            control: { type: "toggle", key: "runOnStartup" },
          },
          {
            name: translate().Settings.Other.DebugLogging.Label,
            desc: translate().Settings.Other.DebugLogging.Description,
            control: { type: "toggle", key: "debugLogging" },
          },
        ],
      },

      // External Plugin Support
      {
        type: "group",
        heading: translate().Settings.ExternalPluginSupport.Header,
        visible: () =>
          [...supportedPlugins].filter((plugin) =>
            userHasPlugin(plugin, this.app),
          ).length > 0,
        items: [
          {
            name: translate().Settings.ExternalPluginSupport.Excalidraw
              .TreatAsAttachments.Label,
            desc: translate().Settings.ExternalPluginSupport.Excalidraw
              .TreatAsAttachments.Description,
            control: {
              // FIXME - Out of the box the Settings API does not do nested keys
              // This either needs to be handled with a migration or adding helper functions to look up the keys
              // see: https://docs.obsidian.md/Plugins/User+interface/Settings#Advanced+nested+settings+with+dot-notation+keys
              type: "toggle",
              key: "ExternalPlugins.Excalidraw.TreatAsAttachments",
            },
          },
        ],
      },

      // Danger Zone
      {
        type: "group",
        heading: translate().Settings.DangerZone.Header,
        items: [
          {
            name: translate().Settings.DangerZone.ResetSettings.Label,
            desc: translate().Settings.DangerZone.ResetSettings.Description,
            render: (setting: Setting) => {
              setting.addButton((button) => {
                button
                  .setWarning()
                  .setButtonText(
                    translate().Settings.DangerZone.ResetSettings.Button,
                  )
                  .onClick(() => {
                    ResetSettingsModal({
                      app: this.app,
                      onConfirm: () => {
                        this.plugin.settings = DEFAULT_SETTINGS;
                        this.plugin.saveSettings();
                        this.update();

                        notify(translate().Notifications.SettingsReset);
                      },
                    });
                  });
              });
            },
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

    // #region Danger Zone
    new Setting(containerEl)
      .setName(translate().Settings.DangerZone.Header)
      .setHeading();

    // #endregion Danger Zone
  }
}
