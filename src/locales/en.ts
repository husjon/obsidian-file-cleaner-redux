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

      ExcludedFolders: {
        Label: "Excluded folders",
        Description: `
          Folders that should be excluded during cleanup.
          Paths are case-sensitive.
          One folder per line.`,
        Placeholder: "Example:\nfolder/subfolder\nfolder2/subfolder2",
      },

      Attachments: {
        Label: "Attachment extensions",
        Description:
          "Unused attachements which should be cleaned up, comma-separated.",
        Placeholder: "Example: .jpg, .png, .pdf",
      },

      PreviewDeletedFiles: {
        Label: "Preview deleted files",
        Description: "Show a confirmation box with list of files to be removed",
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
