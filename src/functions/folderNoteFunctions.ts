import type FolderNotesPlugin from '../main';
import { TFolder, TFile, Keymap, type TAbstractFile, type WorkspaceLeaf } from 'obsidian';
import {
  addCSSClassToFileExplorerEl,
  removeActiveFolder,
  setActiveFolder,
} from 'src/functions/styleFunctions';
import { getFolderNameFromPathString, getFolderPathFromString } from 'src/functions/utils';

export async function createFolderNote(
  plugin: FolderNotesPlugin,
  folderPath: string,
): Promise<void> {
  const leaf: WorkspaceLeaf = plugin.app.workspace.getLeaf(false);
  const folderName = getFolderNameFromPathString(folderPath);
  const fileName: string = plugin.settings.folderNoteName.replace('{{folder_name}}', folderName);

  let folderNote: TFile | null | undefined = getFolderNote(plugin, folderPath);
  let path = '';

  if (plugin.settings.storageLocation === 'parentFolder') {
    const parentFolderPath = getFolderPathFromString(folderPath);
    if (parentFolderPath.trim() === '') {
      path = `${fileName}.md`;
    } else {
      path = `${parentFolderPath}/${fileName}.md`;
    }
  } else if (plugin.settings.storageLocation === 'vaultFolder') {
    path = `${fileName}.md`;
  } else {
    path = `${folderPath}/${fileName}.md`;
  }

  if (!folderNote) {
    folderNote = await plugin.app.vault.create(path, '');
  } else {
    await plugin.app.fileManager.renameFile(folderNote, path);
  }

  // open file
  {
    if (plugin.app.workspace.getActiveFile()?.path === path) {
      removeActiveFolder(plugin);

      const folder = getFolder(plugin, folderNote);
      if (!folder) {
        return;
      }

      setActiveFolder(folder.path, plugin);
    }
    await leaf.openFile(folderNote);
  }

  const folder = plugin.app.vault.getAbstractFileByPath(folderPath);
  if (!(folder instanceof TFolder)) return;
  addCSSClassToFileExplorerEl(path, 'is-folder-note', false, plugin, true);
  addCSSClassToFileExplorerEl(folder.path, 'has-folder-note', false, plugin);
}

export async function openFolderNote(
  plugin: FolderNotesPlugin,
  file: TAbstractFile,
  evt?: MouseEvent,
): Promise<void> {
  const { path } = file;
  const activeFilePath = plugin.app.workspace.getActiveFile()?.path;

  // If already active and not opening in new tab, do nothing
  if (activeFilePath === path && !(Keymap.isModEvent(evt) === 'tab')) {
    return;
  }

  // Try to find an existing tab with this file open
  let foundLeaf = null;

  if (foundLeaf) {
    plugin.app.workspace.setActiveLeaf(foundLeaf, { focus: true });
  } else {
    const shouldOpenInNewTab = Keymap.isModEvent(evt);
    const leaf = plugin.app.workspace.getLeaf(shouldOpenInNewTab);
    if (file instanceof TFile) {
      await leaf.openFile(file);
    }
  }
}

export function extractFolderName(template: string, changedFileName: string): string | null {
  const [prefix, suffix] = template.split('{{folder_name}}');
  if (prefix.trim() === '' && suffix.trim() === '') {
    return changedFileName;
  }
  if (!changedFileName.startsWith(prefix) || !changedFileName.endsWith(suffix)) {
    return null;
  }
  if (changedFileName.startsWith(prefix) && prefix.trim() !== '') {
    return changedFileName.slice(prefix.length).replace(suffix, '');
  } else if (changedFileName.endsWith(suffix) && suffix.trim() !== '') {
    return changedFileName.slice(0, -suffix.length);
  }
  return null;
}

function findFolderNoteFile(plugin: FolderNotesPlugin, path: string): TFile | null {
  let folderNote = plugin.app.vault.getAbstractFileByPath(path + '.md');
  if (folderNote instanceof TFile) {
    return folderNote;
  }

  const supportedFileTypes = ['md'].filter((type) => type !== 'md');

  for (let type of supportedFileTypes) {
    if (!type.startsWith('.')) {
      type = '.' + type;
    }
    folderNote = plugin.app.vault.getAbstractFileByPath(path + type);
    if (folderNote instanceof TFile) {
      return folderNote;
    }
  }
  return null;
}

export function getFolderNote(
  plugin: FolderNotesPlugin,
  folderPath: string,
): TFile | null | undefined {
  if (!folderPath) return null;

  const folder = {
    path: folderPath,
    name: getFolderNameFromPathString(folderPath),
  };

  function resolveFileName(
    plugin: FolderNotesPlugin,
    folder: { path: string; name: string },
  ): string | null {
    const templateName = plugin.settings.folderNoteName;
    if (!templateName) return null;
    return templateName.replace('{{folder_name}}', folder.name);
  }

  let fileName = resolveFileName(plugin, folder);
  if (!fileName) return null;

  // adjust folder path for storage
  if (plugin.settings.storageLocation === 'parentFolder') {
    folder.path = getFolderPathFromString(folderPath);
  }

  const path = folder.path === '/' ? fileName : `${folder.path}/${fileName}`;

  return findFolderNoteFile(plugin, path);
}

export function getFolder(plugin: FolderNotesPlugin, file: TFile): TAbstractFile | null {
  if (!file) return null;

  let folderName = extractFolderName(plugin.settings.folderNoteName, file.basename);
  if (
    plugin.settings.folderNoteName === file.basename &&
    plugin.settings.storageLocation === 'insideFolder'
  ) {
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
