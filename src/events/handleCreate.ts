import { TFolder, TFile, type TAbstractFile } from 'obsidian';
import type FolderNotesPlugin from 'src/main';
import { getFolder, getFolderNote } from 'src/functions/folderNoteFunctions';
import {
  removeCSSClassFromFileExplorerEL,
  addCSSClassToFileExplorerEl,
} from 'src/functions/styleFunctions';

export async function handleCreate(file: TAbstractFile, plugin: FolderNotesPlugin): Promise<void> {
  if (!plugin.app.workspace.layoutReady) return;

  const folder = file.parent;

  if (folder instanceof TFolder) {
    if (plugin.isEmptyFolderNoteFolder(folder) && getFolderNote(plugin, folder.path)) {
      addCSSClassToFileExplorerEl(folder.path, 'only-has-folder-note', true, plugin);
    } else {
      removeCSSClassFromFileExplorerEL(folder.path, 'only-has-folder-note', true, plugin);
    }
  }

  if (file instanceof TFile) {
    const folder = getFolder(plugin, file);

    if (folder instanceof TFolder) {
      if (folder.children.length >= 1) {
        removeCSSClassFromFileExplorerEL(folder.path, 'fn-empty-folder', false, plugin);
      }

      const folderNote = getFolderNote(plugin, folder.path);

      if (folderNote && folderNote.path === file.path) {
        addCSSClassToFileExplorerEl(folder.path, 'has-folder-note', false, plugin);
        addCSSClassToFileExplorerEl(file.path, 'is-folder-note', false, plugin);
      }
    }
  }
}
