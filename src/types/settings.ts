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
