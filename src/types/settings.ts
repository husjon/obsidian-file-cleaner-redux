export enum Deletion {
  SystemTrash = "system",
  ObsidianTrash = "obsidian",
  Permanent = "permanent",
  UseObsidianGlobalOption = "obsidian-option",
}

export enum Notifications {
  ShowAll = "showAll",
  ShowOnlyErrors = "showOnlyErrors",
  HideAll = "hideAll",
}

export enum NotificationType {
  Info,
  Error,
}

export enum ExcludeInclude {
  Exclude = Number(false),
  Include = Number(true),
}

export interface FileCleanerSettings {
  deletionDestination: Deletion;
  obsidianTrashCleanupAge: number;
  notifications: Notifications;
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
