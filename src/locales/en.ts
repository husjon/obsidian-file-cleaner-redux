import { Locale } from "./locale";

// English
const enUS: Locale = {
  Settings: {
    RegularOptions: {
      CleanedFiles: {
        Label: "Deleted files",
        Description: "What happens to a file after it's deleted.",

        Options: {
          MoveToSystemTrash: "Move to system trash",
          MoveToObsidianTrash: "Move to Obsidian trash (.trash folder)",
          PermanentDelete: "Permanently delete",
        },
      },
      ObsidianTrashCleanupAge: {
        Label: "Trash directory age threshold",
        Description:
          "Amount of days files can be in the `.trash` folder before they are permanently removed (minimum 1 day).",
      },

      FolderFiltering: {
        Excluded: {
          Label: "Excluded folders",
          Description: `
          Folders that should be excluded during cleanup, all other folders will be scanned.
          Paths are case-sensitive.
          One folder per line.
          Supports regular expressions (wildcard matching can be done using \`.*\`)`,
        },
        Included: {
          Label: "Included folders",
          Description: `
          Folders that should be included during cleanup, only these folders will be scanned.
          Paths are case-sensitive.
          One folder per line.
          Supports regular expressions (wildcard matching can be done using \`.*\`)`,
        },
        Label: "Excluded / Included Folders",
        Placeholder: "Example:\nfolder/subfolder\nfolder2/subfolder2",
        Description:
          "The folders below should be excluded from or included in the cleanup process.",
      },

      Attachments: {
        Excluded: {
          Label: "Excluded Attachment extensions",
          Description:
            "List of extensions that should be ignored during cleanup, all other files are included, the `.*` wildcard can be used to select all extensions. Comma-separated.",
          Placeholder: "Example:.jpg, .png, .pdf, .*",
        },
        Included: {
          Label: "Included Attachment extensions",
          Description:
            "List of extensions that should be included during cleanup, all other files are ignored, the `.*` wildcard can be used to select all extensions. Comma-separated.",
          Placeholder: "Example:.jpg, .png, .pdf, .*",
        },
        Label: "Excluded / Included Extensions",
        Description:
          "The attachment extensions below should be excluded from or included in the cleanup process.",
      },

      IgnoredFrontmatter: {
        Label: "Ignored frontmatter",
        Description: `
          List of frontmatter properties that should be ignored during cleanup.
          If a file contains only frontmatter and contains only these properties, the file will be removed, comma-separated.
        `,
        Placeholder: "Example:\ncreated, updated",
      },

      IgnoreAllFrontmatter: {
        Label: "Ignore all frontmatter",
        Description: "Ignores all frontmatter, including the ones set above.",
      },

      PreviewDeletedFiles: {
        Label: "Preview deleted files",
        Description: "Show a confirmation box with list of files to be removed",
      },

      DeleteEmptyMarkdownFiles: {
          Label: "Delete empty Markdown files",
          Description: "Removes Markdown files if their size is 0",
      },

      RemoveFolders: {
        Label: "Remove folders",
        Description: "Include folders in cleanup",
      },

      RunOnStartup: {
        Label: "Run on startup",
        Description: "Runs the cleaner on startup",
      },
    },

    DangerZone: {
      Header: "Danger zone",

      ResetSettings: {
        Label: "Reset settings",
        Description: "Resets the configuration back to default values",
        Button: "Reset",
      },
    },
  },

  Modals: {
    ResetSettings: {
      Title: "Reset settings",
      Text: "Are you sure you want to reset the settings?",
    },
    DeletionConfirmation: {
      Title: "Deletion confirmation",
      Text: "The following will be deleted",

      Files: "Files",
      Folders: "Folders",
    },

    ButtonCancel: "Cancel",
    ButtonConfirm: "Confirm",
  },

  Buttons: {
    CleanFiles: "Clean files",
  },

  Notifications: {
    CleanSuccessful: "Clean successful",
    NoFileToClean: "No file to clean",
    SettingsReset: "File Cleaner Redux: Setting reset",
  },
};

export default enUS;
