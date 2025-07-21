<script lang="ts">
  import { ExternalLink, File, FolderOpen } from "lucide-svelte";
  import { TFolder, type App, type TAbstractFile, type TFile } from "obsidian";
  import { removeFiles } from "src/helpers/helpers";
  import translate from "src/i18n";
  import type { FileCleanerSettings } from "src/settings";

  interface Props {
    app: App;
    settings: FileCleanerSettings;
    filesAndFolders: TAbstractFile[];

    closeModal: () => void;
  }

  let { app, settings, filesAndFolders, closeModal }: Props = $props();

  let filesAndFoldersSorted = (filesAndFolders || []).sort((a, b) =>
    a.path.localeCompare(b.path),
  );

  const toBeDeleted: TAbstractFile[] = $state(filesAndFoldersSorted);

  function isFolder(file: TAbstractFile) {
    return Object.keys(file).includes("children");
  }

  function addEntry(file: TAbstractFile) {
    if (file.path === "/") return; // we do not want to touch the vault root folder
    if (toBeDeleted.includes(file)) return;

    if (isFolder(file)) {
      // add each file in the selected folder
      (file as TFolder).children.map((child) => addEntry(child));
    }

    toBeDeleted.push(file);
  }
  function removeEntry(file: TAbstractFile) {
    if (!toBeDeleted.includes(file)) return;

    removeEntry(file.parent);

    toBeDeleted.remove(file);
  }
</script>

<p>{translate().Modals.DeletionConfirmation.Text}</p>

<ul style="padding: 0 1rem; max-height: 50vh; overflow: scroll">
  {#each filesAndFoldersSorted as file}
    <li style="list-style: none; ">
      <input
        type="checkbox"
        checked={toBeDeleted.includes(file)}
        id={file.path}
        onclick={() =>
          !toBeDeleted.includes(file) ? addEntry(file) : removeEntry(file)}
      />
      <label
        for={file.path}
        style={!toBeDeleted.includes(file) && "opacity:0.6"}
      >
        <span style="vertical-align: middle;">
          {#if isFolder(file)}
            <FolderOpen size="1em" />
          {:else}
            <File size="1em" />
          {/if}
        </span>
        {file.path}
        <span
          class="clickable-icon"
          style="cursor:pointer; display: inline-block"
          onclick={(e) => {
            e.preventDefault();

            const leaf = app.workspace.getLeaf();
            leaf.openFile(file as TFile);
          }}
        >
          <ExternalLink size="1em" />
        </span>
      </label>
    </li>
  {/each}
</ul>

<div style="float: right; display: flex; gap:0.5em">
  <button
    class="mod-warning"
    onclick={() => {
      removeFiles(toBeDeleted.reverse(), app, settings);
      closeModal();
    }}>{translate().Modals.ButtonConfirm}</button
  >
  <button
    onclick={() => {
      closeModal();
    }}>{translate().Modals.ButtonCancel}</button
  >
</div>
