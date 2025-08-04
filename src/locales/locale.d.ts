export interface Locale {
  Settings: {
    RegularOptions: {
      CleanedFiles: {
        Label: string;
        Description: string;

        Options: {
          MoveToSystemTrash: string;
          MoveToObsidianTrash: string;
          PermanentDelete: string;
        };
      };
      ObsidianTrashCleanupAge: {
        Label: string;
        Description: string;
      };

      FolderFiltering: {
        Excluded: {
          Label: string;
          Description: string;
        };

        Included: {
          Label: string;
          Description: string;
        };

        Label: string;
        Placeholder: string;
        Description: string;
      };

      Attachments: {
        Excluded: {
          Label: string;
          Description: string;
          Placeholder: string;
        };
        Included: {
          Label: string;
          Description: string;
          Placeholder: string;
        };

        Label: string;
        Description: string;
      };

      IgnoredFrontmatter: {
        Label: string;
        Description: string;
        Placeholder: string;
      };

      IgnoreAllFrontmatter: {
        Label: string;
        Description: string;
      };

      CodeblockParsing: {
        Label: string;
        Description: string;
        Placeholder: string;
      };

      CloseNewTabs: {
        Label: string;
        Description: string;
      };

      FileAgeThreshold: {
        Label: string;
        Description: string;
      };

      PreviewDeletedFiles: {
        Label: string;
        Description: string;
      };

      DeleteEmptyMarkdownFiles: {
        Label: string;
        Description: string;
      };

      DeleteEmptyMarkdownFilesWithBacklinks: {
        Label: string;
        Description: string;
      };

      RemoveFolders: {
        Label: string;
        Description: string;
      };

      RunOnStartup: {
        Label: string;
        Description: string;
      };
    };

    DangerZone: {
      Header: string;

      ResetSettings: {
        Label: string;
        Description: string;
        Button: string;
      };
    };
  };

  Modals: {
    ResetSettings: {
      Title: string;
      Text: string;
    };
    DeletionConfirmation: {
      Title: string;
      Text: string;

      Files: string;
      Folders: string;
    };

    ButtonConfirm: string;
    ButtonCancel: string;
  };

  Buttons: {
    CleanFiles: string;
  };

  Notifications: {
    CleanSuccessful: string;
    NoFileToClean: string;
    SettingsReset: string;
  };
}
