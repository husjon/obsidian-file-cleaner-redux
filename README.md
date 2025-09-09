# File Cleaner Redux

File Cleaner Redux is a plugin for Obsidian (https://obsidian.md) which helps in removing unused / empty markdown files and attachments based on a few user controlled options.

Out of the box, this plugin only looks for completely empty markdown files which are not referenced to by other files.

When performing the cleanup, the user will be presented with a summary of which files was found and the user can then choose to delete all, none or some of these files (See [#Preview of deleted files](#preview-of-deleted-files)).

## Features

A short summary of features, more details can be found under [Options](#options)

- Removes Markdown files with a size of 0 bytes (Optional) (See: [#88](https://github.com/husjon/obsidian-file-cleaner-redux/issues/88))
- Removes user-defined attachment files (e.g: jpg, jpeg, png, gif, svg, pdf)
- Support for cleaning empty files containing only specific frontmatter (Optional) (See: https://github.com/husjon/obsidian-file-cleaner-redux/issues/16)
- Removes empty folders recursively (Optional)
- Folder exclusion / inclusion (Optional)
- Set deletion location
  - Move to system trash
  - Move to Obsidian trash (.trash folder)
  - Permanently delete
- Preview of list of files and folders that will be removed (Optional)
- Run on Startup (Optional)
- Supports the following external plugins:
  - Admonition (as of v1.0.0 - [#57](https://github.com/husjon/obsidian-file-cleaner-redux/pull/57))
  - Excalidraw (as of v1.3.0)
    Note: This does require JSON compression in Excalidraw to be turned off.
    This can be done in Excalidraw Setting > Saving > Compress Excalidraw JSON in Markdown

## Options

A [screenshot](#plugins-settings-showing-default-values) showing all the options can be found below.

### How to use the plugin

- Click the "File Cleaner" ribbon icon or add a Keybinding for the `Clean files` command.

### Screenshots

#### Plugins Settings (showing default values)

![Options](images/Options.png)

#### Preview of deleted files

![Preview deleted files confirmation](images/PreviewDeletedFiles.png)

#### Hotkeys

![Hotkeys](images/Hotkeys.png)

### Known issue

- ~~Attachments used in [Admonition](https://github.com/valentine195/obsidian-admonition) code blocks are not recognized~~

## Inspiration and credits

Originally based on https://github.com/Johnson0907/obsidian-file-cleaner
