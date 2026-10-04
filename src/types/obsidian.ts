export enum ObsidianPreferenceTrashOption {
  local = "local",
  system = "system",
  none = "none",
}

export interface Backlinks {
  // for use with `app.metadataCache.getBacklinksForFile(file)`
  data: Map<string, Array<unknown>>;
  keys: () => { length: number };
}
