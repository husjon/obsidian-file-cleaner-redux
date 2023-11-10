export interface Locale {
  Settings: {
    RegularOptions: {
      Header: string;

      CleanedFiles: {
        Label: string;
        Description: string;

        Options: {
          MoveToSystemTrash: string;
          MoveToObsidianTrash: string;
          PermanentDelete: string;
        };
      };

      ExcludedFolders: {
        Label: string;
        Description: string;
        Placeholder: string;
      };

      Attachments: {
        Label: string;
        Description: string;
        Placeholder: string;
      };

      PreviewDeletedFiles: {
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
    DeletionConfirmation: string;

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
