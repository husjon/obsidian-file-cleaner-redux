export type ObsidianPreferenceTrashOption = "local" | "system" | "none";

export interface CanvasNode {
  id: string;
  type: string;
  file?: string;
  text?: string;
}

export interface CanvasContent {
  nodes?: Array<CanvasNode>;
  edges?: unknown[];
}

export interface Backlinks {
  // for use with `app.metadataCache.getBacklinksForFile(file)`
  data: Map<string, Array<unknown>>;
  keys: () => { length: number };
}

// Augment the obsidian module with some helper interfaces
declare module "obsidian" {
  interface MetadataCache {
    getBacklinksForFile: () => Backlinks;
  }
  interface App {
    plugins: { plugins: Record<string, { settings: unknown }> };
  }
  interface Vault {
    getConfig: (option: string) => unknown;
  }
}
