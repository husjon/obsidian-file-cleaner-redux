export enum NotificationType {
  Info,
  Error,
}

export enum ObsidianPreferenceTrashOption {
  local = "local",
  system = "system",
  none = "none",
}

export const TrashOptionToLabel = {
  system: "Move to system trash",
  local: "Move to Obsidian trash (.trash folder)",
  none: "Permanently delete",
};
