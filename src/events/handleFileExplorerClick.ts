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

  const { folderTitleEl } = getFolderTitleInfo(target);
  if (!folderTitleEl) return;
  if (shouldIgnoreClickByWhitespaceOrCollapse(target)) return;

  const folderPath = getValidFolderPath(folderTitleEl);
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

function getFolderTitleInfo(target: HTMLElement): {
  folderTitleEl: HTMLElement | null;
  onlyClickedOnFolderTitle: boolean;
} {
  const folderTitleEl = target.closest('.nav-folder-title') as HTMLElement | null;
  const onlyClickedOnFolderTitle = !!target.closest('.nav-folder-title-content');
  return { folderTitleEl, onlyClickedOnFolderTitle };
}

function shouldIgnoreClickByWhitespaceOrCollapse(target: HTMLElement): boolean {
  if (target.closest('.collapse-icon')) return true;
  return false;
}

function getValidFolderPath(folderTitleEl: HTMLElement): string | null {
  const folderPath = folderTitleEl.getAttribute('data-path');
  if (!folderPath) return null;
  return folderPath;
}

function shouldCreateNote(evt: MouseEvent): boolean {
  const isTabMod = Keymap.isModEvent(evt) === 'tab';
  if (!(evt.altKey || isTabMod)) return false;
  return evt.altKey;
}
