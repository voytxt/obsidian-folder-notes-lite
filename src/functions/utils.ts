import type { FileExplorerWorkspaceLeaf } from 'src/globals';
import type FolderNotesPlugin from 'src/main';

export function getFolderNameFromPathString(path: string): string {
  // -2 = parent folder index
  // -1 = last folder index
  const index = path.endsWith('.md') || path.endsWith('.canvas') ? -2 : -1;

  return path.split('/').slice(index)[0];
}

export function getFolderPathFromString(path: string): string {
  const subString = path.lastIndexOf('/') >= 0 ? path.lastIndexOf('/') : 0;

  const folderPath = path.substring(0, subString);
  if (folderPath === '') return '/';

  return folderPath;
}

export function getFileExplorer(plugin: FolderNotesPlugin): FileExplorerWorkspaceLeaf {
  return plugin.app.workspace.getLeavesOfType(
    'file-explorer',
  )[0] as unknown as FileExplorerWorkspaceLeaf;
}
