import { Keymap } from 'obsidian';
import type FolderNotesPlugin from 'src/main';
import { openFolderNote, createFolderNote, getFolderNote } from 'src/functions/folderNoteFunctions';
import {
  addCSSClassToFileExplorerEl,
  removeCSSClassFromFileExplorerEL,
} from 'src/functions/styleFunctions';

export async function handleViewHeaderClick(
  event: MouseEvent,
  plugin: FolderNotesPlugin,
): Promise<void> {
  event.stopImmediatePropagation();
  event.preventDefault();
  event.stopPropagation();
  if (!(event.target instanceof HTMLElement)) return;

  const folderPath = event.target.getAttribute('data-path');
  if (!folderPath) return;

  const folderNote = getFolderNote(plugin, folderPath);

  if (folderNote) {
    await openFolderNote(plugin, folderNote, event).then(() => {
      // @ts-ignore internal
      plugin.app.internalPlugins.getEnabledPluginById('file-explorer').revealInFolder(folderNote);
    });

    return;
  } else if (event.ctrlKey && Keymap.isModEvent(event) === 'tab') {
    await createFolderNote(plugin, folderPath);
    addCSSClassToFileExplorerEl(folderPath, 'has-folder-note', false, plugin);
    removeCSSClassFromFileExplorerEL(folderPath, 'has-not-folder-note', false, plugin);
    return;
  }

  (event.target as HTMLElement).onclick = null;
  (event.target as HTMLElement).click();
}
