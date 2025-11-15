import { type TAbstractFile, Plugin, TFile, TFolder, Keymap } from 'obsidian';
import { type FolderNotesSettings, DEFAULT_SETTINGS } from './settings';
import type { FileExplorerWorkspaceLeaf } from './globals';
import {
  registerFileExplorerObserver,
  unregisterFileExplorerObserver,
} from './events/MutationObserver';
import { getFolderNote, getFolder } from './functions/folderNoteFunctions';
import { handleCreate } from './events/handleCreate';
import {
  addCSSClassToFileExplorerEl,
  refreshAllFolderStyles,
  setActiveFolder,
  removeActiveFolder,
} from './functions/styleFunctions';
import { handleFileExplorerClick } from './events/handleFileExplorerClick';

export default class FolderNotesPlugin extends Plugin {
  settings: FolderNotesSettings;
  activeFolderDom: HTMLElement | null;
  activeFileExplorer: FileExplorerWorkspaceLeaf;
  hoveredElement: HTMLElement | null = null;
  mouseEvent: MouseEvent | null = null;
  hoverLinkTriggered = false;

  async onload(): Promise<void> {
    console.log('loading folder notes plugin');

    // load settings
    {
      const data = await this.loadData();

      this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
      if (!this.settings.oldFolderNoteName) {
        this.settings.oldFolderNoteName = this.settings.folderNoteName;
      }

      this.saveSettings();
    }

    document.body.classList.add('folder-notes-plugin');

    this.app.workspace.onLayoutReady(this.onLayoutReady.bind(this));

    this.registerDomEvent(window, 'keydown', (event: KeyboardEvent) => {
      const { hoveredElement } = this;
      if (this.hoverLinkTriggered) return;
      if (!hoveredElement) return;
      if (!Keymap.isModEvent(event)) return;

      const folderPath = hoveredElement?.parentElement?.getAttribute('data-path') || '';
      const folderNote = getFolderNote(this, folderPath);
      if (!folderNote) return;

      this.app.workspace.trigger('hover-link', {
        event: this.mouseEvent,
        source: 'preview',
        hoverParent: {
          file: folderNote,
        },
        targetEl: hoveredElement,
        linktext: folderNote?.basename,
        sourcePath: folderNote?.path,
      });
      this.hoverLinkTriggered = true;
    });

    this.registerEvent(
      this.app.workspace.on('file-open', async (openFile: TFile | null) => {
        removeActiveFolder(this);

        if (!openFile || !openFile.basename) return;

        const folder = getFolder(this, openFile);
        if (!folder) return;

        const folderNote = getFolderNote(this, folder.path);
        if (!folderNote) return;

        if (folderNote.path !== openFile.path) return;

        setActiveFolder(folder.path, this);
      }),
    );

    this.registerEvent(
      this.app.vault.on('create', (file: TAbstractFile) => handleCreate(file, this)),
    );
  }

  onLayoutReady(): void {
    // @ts-ignore internal
    if (!this._loaded) return;

    registerFileExplorerObserver(this);

    this.registerDomEvent(
      document,
      'click',
      (evt: MouseEvent) => handleFileExplorerClick(this, evt),
      true,
    );

    // @ts-ignore internal, for revealing the file when pressing ctrl+zero
    const fileExplorerPlugin = this.app.internalPlugins.getEnabledPluginById('file-explorer');
    if (fileExplorerPlugin) {
      const originalRevealInFolder = fileExplorerPlugin.revealInFolder.bind(fileExplorerPlugin);

      fileExplorerPlugin.revealInFolder = (file: TAbstractFile): void => {
        if (file instanceof TFile) {
          const folder = getFolder(this, file);
          if (folder instanceof TFolder) {
            const folderNote = getFolderNote(this, folder.path);

            if (!folderNote || folderNote.path !== file.path) {
              return originalRevealInFolder.call(fileExplorerPlugin, file);
            }

            originalRevealInFolder.call(fileExplorerPlugin, folder);

            return;
          }
        }

        return originalRevealInFolder.call(fileExplorerPlugin, file);
      };
    }
  }

  isEmptyFolderNoteFolder(folder: TFolder): boolean {
    // @ts-ignore internal
    let attachmentFolderPath = this.app.vault.getConfig('attachmentFolderPath') as string;
    const cleanAttachmentFolderPath = attachmentFolderPath?.replace('./', '') || '';
    const attachmentsAreInRootFolder = attachmentFolderPath === './' || attachmentFolderPath === '';
    const threshold = this.settings.storageLocation === 'insideFolder' ? 1 : 0;
    if (folder.children.length === 0) {
      addCSSClassToFileExplorerEl(folder.path, 'fn-empty-folder', false, this);
    }
    attachmentFolderPath = `${folder.path}/${cleanAttachmentFolderPath}`;

    if (folder.children.length === threshold) {
      addCSSClassToFileExplorerEl(folder.path, 'fn-empty-folder', false, this);
      return true;
    } else if (folder.children.length > threshold) {
      if (attachmentsAreInRootFolder) {
        return false;
      } else if (this.app.vault.getAbstractFileByPath(attachmentFolderPath) instanceof TFolder) {
        const attachmentFolder = this.app.vault.getAbstractFileByPath(attachmentFolderPath);
        if (attachmentFolder instanceof TFolder && folder.children.length <= threshold + 1) {
          addCSSClassToFileExplorerEl(folder.path, 'fn-empty-folder', false, this);
          addCSSClassToFileExplorerEl(folder.path, 'fn-has-attachment-folder', false, this);
        }
        return folder.children.length <= threshold + 1;
      }
      return false;
    }
    return true;
  }

  onunload(): void {
    unregisterFileExplorerObserver();
    document.body.classList.remove('folder-notes-plugin');
    removeActiveFolder(this);
  }

  async saveSettings(reloadStyles?: boolean): Promise<void> {
    await this.saveData(this.settings);
    // cleanup any css if we need too
    if (reloadStyles !== false) {
      refreshAllFolderStyles(true, this);
    }
  }
}
