import { type TAbstractFile, Plugin, TFile, TFolder } from 'obsidian';
import { updateBreadcrumbs, updateFileTreeTitles } from './update';
import { getFolderNote, getFolderPathFromString } from './utils';

interface FolderNotesSettings {
  storageLocation: 'insideFolder' | 'parentFolder';
}

export default class FolderNotesPlugin extends Plugin {
  settings: FolderNotesSettings;

  async onload(): Promise<void> {
    console.log('loading folder notes plugin');

    // load & save settings
    this.settings = await this.loadData();
    await this.saveData(this.settings);

    document.body.classList.add('folder-notes-plugin');
    overrideRevealInFolder(this);

    setInterval(() => {
      updateFileTreeTitles(this);
      updateBreadcrumbs(this);
    }, 1000);

    this.registerDomEvent(
      document,
      'click',
      (event: MouseEvent) => handleFileExplorerClick(this, event),
      true,
    );
  }

  onunload(): void {
    document.body.classList.remove('folder-notes-plugin');
  }
}

function handleFileExplorerClick(plugin: FolderNotesPlugin, event: MouseEvent): void {
  if (!event.ctrlKey) return;

  const folderPath = (event.target as HTMLElement)
    .closest('.nav-folder-title')
    ?.getAttribute('data-path');
  const folderNote = getFolderNote(plugin, folderPath!);
  if (folderNote === null) return;

  // we don't want to open the folder note contents in the file explorer
  event.stopImmediatePropagation();

  plugin.app.workspace.getLeaf().openFile(folderNote);
}

function overrideRevealInFolder(plugin: FolderNotesPlugin) {
  // @ts-ignore internal, for revealing the file when pressing ctrl+zero
  const fileExplorerPlugin = plugin.app.internalPlugins.getEnabledPluginById('file-explorer') as {
    revealInFolder: (file: TAbstractFile) => void;
  };

  const originalRevealInFolder = fileExplorerPlugin.revealInFolder.bind(fileExplorerPlugin) as (
    file: TAbstractFile,
  ) => void;

  fileExplorerPlugin.revealInFolder = (file: TAbstractFile): void => {
    if (file instanceof TFile) {
      const folder = getFolder(plugin, file);
      if (folder !== null) {
        return originalRevealInFolder.call(fileExplorerPlugin, folder);
      }
    }

    return originalRevealInFolder.call(fileExplorerPlugin, file);
  };
}

function getFolder(plugin: FolderNotesPlugin, file: TFile): TFolder | null {
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

  return plugin.app.vault.getFolderByPath(folderPath);
}
