import { Locale } from "./locale";
import enUS from "./en";

// Norwegian Bokmål
const noNB: Locale = {
  Settings: {
    RegularOptions: {
      Header: "Vanlige instillinger",

      CleanedFiles: {
        Label: "Slettede filer",
        Description: "Hva skal skje med filene når de er slettet?",

        Options: {
          MoveToSystemTrash: "Flytt til system papirkurv",
          MoveToObsidianTrash: "Flytt til Obsidian papirkurv (.trash mappe)",
          PermanentDelete: "Slett Permanent",
        },
      },

      ExcludedFolders: {
        Label: "Ekskluderte mapper",
        Description: `
          Mapper som skal ekskluderes under opprydning.
          Stiene skiller mellom store og små bokstaver.
          En mappe per linje.`,
        Placeholder: "For eksempel:\nmappe/undermappe\nmappe2/undermappe2",
      },

      Attachments: {
        Label: "Vedleggs filetternavn",
        Description:
          "Ubrukte vedlegg som skal fjernes under opprydding, komma-separert.",
        Placeholder: "For eksempel: .jpg, .png, .pdf",
      },
    },

    DangerZone: {
      Header: "Faresone",

      ResetSettings: {
        Label: "Tilbakestill innstillinger",
        Description: "Tilbakestiller innstillingene til original innstillinger",
        Button: "Tilbakestill",
      },
    },
  },

  Modals: {
    ResetSettings: "Er du sikker på at du vil tilbakestille innstillingene?",
    DeletionConfirmation: "Følgende filer vil bli slettet",

    ButtonNo: "Nei",
    ButtonYes: "Ja",
  },

  Buttons: {
    CleanFiles: "Fjern ubrukte filer",
  },

  Notifications: {
    CleanSuccessful: "Opprydding fullført",
    NoFileToClean: "Ingen filer å fjerne",
    SettingsReset: "File Cleaner: Innstillinger tilbakestilt",
  },

  // The following is used as a fallback in case a translation is missing.
  ...enUS,
};

export default noNB;
