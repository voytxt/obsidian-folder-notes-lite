import { TFile } from 'obsidian';
import { getFolderNote } from 'src/folderNoteFunctions';
import FolderNotesPlugin from './main';

export function updateCSSClassesForFolder(folderPath: string, plugin: FolderNotesPlugin): void {
  const folder = plugin.app.vault.getAbstractFileByPath(folderPath);
  if (!folder || folder instanceof TFile) return;

  const folderNote = getFolderNote(plugin, folder.path);
  if (!folderNote) return;

  // mark file as folder note
  addCSSClassToFileExplorerEl(folderNote.path, 'is-folder-note', plugin);

  // mark folder with folder note classes
  addCSSClassToFileExplorerEl(folder.path, 'has-folder-note', plugin);
}

export async function addCSSClassToFileExplorerEl(
  path: string,
  cssClass: string,
  plugin: FolderNotesPlugin,
): Promise<void> {
  const fileExplorerItem = getFileExplorerElement(path, plugin);
  if (fileExplorerItem === null) throw new Error("FNL: coudln't find the file explorer element");

  fileExplorerItem.addClass(cssClass);
  document.querySelectorAll(`[data-path='${CSS.escape(path)}']`).forEach((item) => {
    item.addClass(cssClass);
  });
}

function getFileExplorerElement(path: string, plugin: FolderNotesPlugin): HTMLElement | null {
  const fileExplorer = plugin.app.workspace.getLeavesOfType('file-explorer')[0];
  // @ts-ignore internal
  if (!fileExplorer?.view?.fileItems) return null;

  // @ts-ignore internal
  const fileExplorerItem = fileExplorer.view.fileItems?.[path];
  return fileExplorerItem?.selfEl ?? fileExplorerItem?.titleEl ?? null;
}
