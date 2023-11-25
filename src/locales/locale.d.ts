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
        Label: string;
        Description: string;
        Placeholder: string;
      };

      IgnoredFrontmatter: {
        Label: string;
        Description: string;
        Placeholder: string;
      };

      PreviewDeletedFiles: {
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
