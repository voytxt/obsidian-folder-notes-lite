import { TFile, Keymap } from 'obsidian';
import FolderNotesPlugin from 'src/main';
import { getFolderNote, openFolderNote, createFolderNote } from '../functions/folderNoteFunctions';
import {
  addCSSClassToFileExplorerEl,
  removeCSSClassFromFileExplorerEL,
} from '../functions/styleFunctions';

export function handleFileExplorerClick(plugin: FolderNotesPlugin, evt: MouseEvent): void {
  const target = evt.target as HTMLElement;
  if (evt.shiftKey) return;

  const folderTitleEl = target.closest('.nav-folder-title') as HTMLElement | null;
  if (!folderTitleEl) return;

  // should ignore click by whitespace or collapse
  if (target.closest('.collapse-icon')) return;

  const folderPath = folderTitleEl.getAttribute('data-path');
  if (!folderPath) return;

  const usedCtrl = evt.ctrlKey;
  const folderNote = getFolderNote(plugin, folderPath);

  if (!folderNote && shouldCreateNote(evt)) {
    // create note and mark
    createFolderNote(this, folderPath);
    addCSSClassToFileExplorerEl(folderPath, 'has-folder-note', false, this);
    removeCSSClassFromFileExplorerEL(folderPath, 'has-not-folder-note', false, this);

    return;
  }
  if (!(folderNote instanceof TFile)) return;
  if (!usedCtrl) return;

  evt.preventDefault();
  evt.stopImmediatePropagation();

  openFolderNote(plugin, folderNote, evt);
}

function shouldCreateNote(evt: MouseEvent): boolean {
  const isTabMod = Keymap.isModEvent(evt) === 'tab';
  if (!(evt.altKey || isTabMod)) return false;
  return evt.altKey;
}
