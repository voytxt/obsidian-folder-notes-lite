import { TFile } from 'obsidian';
import type FolderNotesPlugin from './main';

export function getFolderPathFromString(path: string): string {
  const subString = path.lastIndexOf('/') >= 0 ? path.lastIndexOf('/') : 0;

  const folderPath = path.substring(0, subString);
  if (folderPath === '') return '/';

  return folderPath;
}

export function getFolderNote(plugin: FolderNotesPlugin, folderPath: string): TFile | null {
  // -2 = parent folder index
  // -1 = last folder index
  const index = folderPath.endsWith('.md') ? -2 : -1;

  const folder = {
    path: folderPath,
    name: folderPath.split('/').slice(index)[0],
  };

  let fileName = folder.name;
  if (!fileName) return null;

  // adjust folder path for storage
  if (plugin.settings.storageLocation === 'parentFolder') {
    folder.path = getFolderPathFromString(folderPath);
  }

  const path = folder.path === '/' ? fileName : `${folder.path}/${fileName}`;

  return plugin.app.vault.getFileByPath(path + '.md');
}
