import type FolderNotesPlugin from './main';
import { TFile, type TAbstractFile } from 'obsidian';

function getFolderPathFromString(path: string): string {
  const subString = path.lastIndexOf('/') >= 0 ? path.lastIndexOf('/') : 0;

  const folderPath = path.substring(0, subString);
  if (folderPath === '') return '/';

  return folderPath;
}

export function getFolderNote(plugin: FolderNotesPlugin, folderPath: string): TFile | null {
  if (!folderPath) return null;

  function getFolderNameFromPathString(path: string): string {
    // -2 = parent folder index
    // -1 = last folder index
    const index = path.endsWith('.md') ? -2 : -1;

    return path.split('/').slice(index)[0];
  }

  const folder = {
    path: folderPath,
    name: getFolderNameFromPathString(folderPath),
  };

  let fileName = folder.name;
  if (!fileName) return null;

  // adjust folder path for storage
  if (plugin.settings.storageLocation === 'parentFolder') {
    folder.path = getFolderPathFromString(folderPath);
  }

  const path = folder.path === '/' ? fileName : `${folder.path}/${fileName}`;

  // find folder note
  let folderNote = plugin.app.vault.getAbstractFileByPath(path + '.md');
  if (!(folderNote instanceof TFile)) return null;

  return folderNote;
}

export function getFolder(plugin: FolderNotesPlugin, file: TFile): TAbstractFile | null {
  if (!file) return null;

  let folderName = file.basename;
  if ('{{folder_name}}' === file.basename && plugin.settings.storageLocation === 'insideFolder') {
    folderName = file.parent?.name ?? '';
  }
  if (!folderName) return null;
  let folderPath = getFolderPathFromString(file.path);

  if (plugin.settings.storageLocation === 'parentFolder') {
    if (folderPath.trim() === '' || folderPath === '/') {
      folderPath = folderName;
    } else {
      folderPath = `${folderPath}/${folderName}`;
    }
  }

  return plugin.app.vault.getAbstractFileByPath(folderPath);
}
