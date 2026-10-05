import {
  App,
  PluginSettingTab,
  Setting,
  type SettingDefinitionItem,
} from "obsidian";
import FileCleanerPlugin from ".";
import translate from "./i18n";
import { Deletion, Notification, ObsidianPreferenceTrashOption } from "./enums";
import { ResetSettingsModal } from "./modals";
import {
  getUserPreferenceTrashOption,
  notify,
  userHasPlugin,
} from "./helpers/helpers";

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
  deletionDestination: Deletion.UseObsidianGlobalOption,
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

  getSettingDefinitions(): SettingDefinitionItem[] {
    return [
      {
        type: "group",
        items: [
          {
            // Obsidian Trash Cleanup Age
            name: translate().Settings.RegularOptions.ObsidianTrashCleanupAge
              .Label,
            desc: translate().Settings.RegularOptions.ObsidianTrashCleanupAge
              .Description,
            render: (setting: Setting) => {
              setting.addText((text) => {
                const days = this.plugin.settings.obsidianTrashCleanupAge;

                text.setPlaceholder("7");
                text.setValue(days >= 0 ? String(days) : "");
                text.inputEl.setCssStyles({
                  width: "6rem",
                });

                text.onChange(async (value) => {
                  const days = Number(value.match(/^\d+/)) || -1;

                  this.plugin.settings.obsidianTrashCleanupAge = days;
                  await this.plugin.saveSettings();
                });
              });
            },
            visible: () =>
              getUserPreferenceTrashOption() ===
              ObsidianPreferenceTrashOption.local,
          },

          // TODO: Add checkbox to toggle if the `.trash` folder should be checked at all
          // TODO: Only run cleanup of `.trash` folder if this checkbox is enabled

          {
            name: translate().Settings.RegularOptions.Notifications.Label,
            desc: translate().Settings.RegularOptions.Notifications.Description,
            control: {
              key: "notifications",
              type: "dropdown",
              options: {
                [Notification.ShowAll]:
                  translate().Settings.RegularOptions.Notifications.Options
                    .ShowAllNotifications,
                [Notification.ShowOnlyErrors]:
                  translate().Settings.RegularOptions.Notifications.Options
                    .ShowOnlyErrors,
                [Notification.HideAll]:
                  translate().Settings.RegularOptions.Notifications.Options
                    .HideAll,
              },
            },
          },
        ],
      },

      {
        heading: translate().Settings.Folders.Header,
        type: "group",
        items: [
          {
            name: translate().Settings.Folders.RemoveFolders.Label,
            desc: translate().Settings.Folders.RemoveFolders.Description,
            control: {
              type: "toggle",
              key: "removeFolders",
            },
          },

          {
            name: translate().Settings.Folders.FolderFiltering.Label,
            type: "page",
            items: [
              {
                name: translate().Settings.Folders.FolderFiltering.Label,
                desc: translate().Settings.Folders.FolderFiltering.Description,
                render: (setting: Setting) => {
                  setting.addDropdown((component) => {
                    component.addOption("0", "Excluded");
                    component.addOption("1", "Included");

                    component.setValue(
                      String(this.plugin.settings.excludeInclude),
                    );

                    component.onChange(async (value: string) => {
                      this.plugin.settings.excludeInclude = Number(value);
                      await this.plugin.saveSettings();
                      this.update();
                    });
                  });
                },
              },

              {
                name: this.plugin.settings.excludeInclude
                  ? translate().Settings.Folders.FolderFiltering.Included.Label
                  : translate().Settings.Folders.FolderFiltering.Excluded.Label,
                desc: this.plugin.settings.excludeInclude
                  ? translate().Settings.Folders.FolderFiltering.Included
                      .Description
                  : translate().Settings.Folders.FolderFiltering.Excluded
                      .Description,
                render: (setting: Setting) => {
                  setting.addTextArea((text) => {
                    text
                      .setValue(this.plugin.settings.excludedFolders.join("\n"))
                      .onChange(async (value) => {
                        this.plugin.settings.excludedFolders = value
                          .split(/\n/)
                          .map((ext) => ext.trim())
                          .filter((ext) => ext !== "");
                        await this.plugin.saveSettings();
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
        ],
      },

      {
        heading: translate().Settings.Files.Header,
        type: "group",
        items: [
          {
            name: translate().Settings.Files.FileAgeThreshold.Label,
            desc: translate().Settings.Files.FileAgeThreshold.Description,
            render: (setting: Setting) => {
              setting.addText((text) => {
                text.setPlaceholder("0");
                text.inputEl.type = "number";
                text.inputEl.min = "0";

                text.inputEl.setCssStyles({
                  width: "6rem",
                });

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
            },
          },

          {
            name: translate().Settings.Files.Attachments.Label,
            type: "page",
            items: [
              {
                name: translate().Settings.Files.Attachments.Label,
                desc: translate().Settings.Files.Attachments.Description,
                render: (setting: Setting) => {
                  setting.addDropdown((component) => {
                    component.addOption("0", "Excluded");
                    component.addOption("1", "Included");

                    component.setValue(
                      String(this.plugin.settings.attachmentsExcludeInclude),
                    );

                    component.onChange(async (value: string) => {
                      this.plugin.settings.attachmentsExcludeInclude =
                        Number(value);
                      await this.plugin.saveSettings();
                      this.update();
                    });
                  });
                },
              },

              {
                name: this.plugin.settings.attachmentsExcludeInclude
                  ? translate().Settings.Files.Attachments.Included.Label
                  : translate().Settings.Files.Attachments.Excluded.Label,
                desc: this.plugin.settings.attachmentsExcludeInclude
                  ? translate().Settings.Files.Attachments.Included.Description
                  : translate().Settings.Files.Attachments.Excluded.Description,
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
                          .filter(
                            (ext) => ext.startsWith(".") && ext.length > 1,
                          )
                          .filter((ext) => ext !== "")
                          .map((ext) => ext.replace(/^\./, ""));

                        await this.plugin.saveSettings();
                      });
                    text.setPlaceholder(
                      this.plugin.settings.attachmentsExcludeInclude
                        ? translate().Settings.Files.Attachments.Included
                            .Placeholder
                        : translate().Settings.Files.Attachments.Excluded
                            .Placeholder,
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
            ],
          },
        ],
      },

      {
        heading: translate().Settings.MarkdownFiles.Header,
        type: "group",
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
            visible: () => this.plugin.settings.deleteEmptyMarkdownFiles,
            control: {
              type: "toggle",
              key: "deleteEmptyMarkdownFilesWithBacklinks",
            },
          },

          {
            name: translate().Settings.Other.DeleteEmptyFileOnClose.Label,
            desc: translate().Settings.Other.DeleteEmptyFileOnClose.Description,
            control: {
              type: "toggle",
              key: "deleteEmptyFileOnClose",
            },
            visible: () => this.plugin.settings.deleteEmptyMarkdownFiles,
          },

          {
            name: translate().Settings.MarkdownFiles.Frontmatter.Header,
            type: "page",
            items: [
              {
                name: translate().Settings.MarkdownFiles.Frontmatter
                  .IgnoredFrontmatter.Label,
                desc: translate().Settings.MarkdownFiles.Frontmatter
                  .IgnoredFrontmatter.Description,
                disabled: () => this.plugin.settings.ignoreAllFrontmatter,
                visible: () => this.plugin.settings.deleteEmptyMarkdownFiles,
                render: (setting: Setting) => {
                  setting.addTextArea((text) => {
                    text
                      .setValue(
                        this.plugin.settings.ignoredFrontmatter.join(", "),
                      )
                      .onChange(async (value) => {
                        this.plugin.settings.ignoredFrontmatter = value
                          .split(",")
                          .map((ext) => ext.trim())
                          .filter((ext) => ext.length > 1 && ext !== "");

                        await this.plugin.saveSettings();
                      });
                    text.setPlaceholder(
                      translate().Settings.MarkdownFiles.Frontmatter
                        .IgnoredFrontmatter.Placeholder,
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
                name: translate().Settings.MarkdownFiles.Frontmatter
                  .IgnoreAllFrontmatter.Label,
                desc: translate().Settings.MarkdownFiles.Frontmatter
                  .IgnoreAllFrontmatter.Description,
                visible: () => this.plugin.settings.deleteEmptyMarkdownFiles,
                control: {
                  type: "toggle",
                  key: "ignoreAllFrontmatter",
                },
              },
            ],
          },

          {
            name: translate().Settings.MarkdownFiles.CodeblockParsing.Label,
            type: "page",
            items: [
              {
                name: translate().Settings.MarkdownFiles.CodeblockParsing.Label,
                desc: translate().Settings.MarkdownFiles.CodeblockParsing
                  .Description,
                visible: () => this.plugin.settings.deleteEmptyMarkdownFiles,
                render: (setting: Setting) => {
                  setting.addTextArea((text) => {
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
                      translate().Settings.MarkdownFiles.CodeblockParsing
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
            ],
          },
        ],
      },

      {
        heading: translate().Settings.Other.Header,
        type: "group",
        items: [
          {
            name: translate().Settings.Other.CloseNewTabs.Label,
            desc: translate().Settings.Other.CloseNewTabs.Description,
            control: {
              type: "toggle",
              key: "closeNewTabs",
            },
          },

          {
            name: translate().Settings.Other.PreviewDeletedFiles.Label,
            desc: translate().Settings.Other.PreviewDeletedFiles.Description,
            control: {
              type: "toggle",
              key: "deletionConfirmation",
            },
          },

          {
            name: translate().Settings.Other.RunOnStartup.Label,
            desc: translate().Settings.Other.RunOnStartup.Description,
            control: {
              type: "toggle",
              key: "runOnStartup",
            },
          },

          {
            name: translate().Settings.Other.DebugLogging.Label,
            desc: translate().Settings.Other.DebugLogging.Description,
            control: {
              type: "toggle",
              key: "debugLogging",
            },
          },
        ],
      },

      {
        heading: translate().Settings.ExternalPluginSupport.Header,
        type: "group",
        items: [
          {
            name: translate().Settings.ExternalPluginSupport.NoPluginDetected
              .Header,
            desc: translate().Settings.ExternalPluginSupport.NoPluginDetected
              .Description,
            visible: () =>
              [...supportedPlugins].filter((plugin) =>
                userHasPlugin(plugin, this.app),
              ).length === 0,
          },

          {
            name: translate().Settings.ExternalPluginSupport.Excalidraw
              .TreatAsAttachments.Label,
            desc: translate().Settings.ExternalPluginSupport.Excalidraw
              .TreatAsAttachments.Description,
            visible: () =>
              !!userHasPlugin("obsidian-excalidraw-plugin", this.app),
            control: {
              type: "toggle",
              key: "ExternalPlugins.Excalidraw.TreatAsAttachments",
            },
          },
        ],
      },

      {
        heading: translate().Settings.DangerZone.Header,
        type: "group",

        items: [
          {
            name: translate().Settings.DangerZone.ResetSettings.Label,
            desc: translate().Settings.DangerZone.ResetSettings.Description,
            render: (setting: Setting) => {
              setting.addButton((button) => {
                button
                  .setDestructive()
                  .setButtonText(
                    translate().Settings.DangerZone.ResetSettings.Button,
                  )
                  .onClick(() => {
                    ResetSettingsModal({
                      app: this.app,
                      onConfirm: async () => {
                        this.plugin.settings = DEFAULT_SETTINGS;
                        await this.plugin.saveSettings();
                        this.update();
                        await this.plugin.loadSettings();

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

  getControlValue(key: string): unknown {
    return getPath(
      this.plugin.settings as unknown as Record<string, unknown>,
      key,
    );
  }

  async setControlValue(key: string, value: unknown): Promise<void> {
    setPath(
      this.plugin.settings as unknown as Record<string, unknown>,
      key,
      value,
    );
    await this.plugin.saveData(this.plugin.settings);
  }
}

function getPath(obj: Record<string, unknown>, path: string): unknown {
  let cursor: unknown = obj;
  for (let part of path.split(".")) {
    if (cursor === null || typeof cursor !== "object") return undefined;
    cursor = (cursor as Record<string, unknown>)[part];
  }
  return cursor;
}

function setPath(
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): void {
  let parts = path.split(".");
  let last = parts.pop();
  let cursor: Record<string, unknown> = obj;
  for (let part of parts) {
    let next = cursor[part];
    if (next === null || typeof next !== "object") {
      next = {};
      cursor[part] = next;
    }
    cursor = next as Record<string, unknown>;
  }
  cursor[last] = value;
}
