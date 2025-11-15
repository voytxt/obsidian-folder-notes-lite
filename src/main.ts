import { type TAbstractFile, Plugin, TFile, TFolder, Keymap } from 'obsidian';
import { getFolderNote, getFolder } from './folderNoteFunctions';
import { handleFileExplorerClick } from './events';
import { updateBreadcrumbs, updateFileTreeTitles } from './update';

interface FolderNotesSettings {
  storageLocation: 'insideFolder' | 'parentFolder';
}

export default class FolderNotesPlugin extends Plugin {
  settings: FolderNotesSettings;
  activeFolderDom: HTMLElement | null;
  hoveredElement: HTMLElement | null = null;
  mouseEvent: MouseEvent | null = null;
  hoverLinkTriggered = false;

  async onload(): Promise<void> {
    console.log('loading folder notes plugin');

    // load & save settings
    this.settings = await this.loadData();
    await this.saveData(this.settings);

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
  }

  onLayoutReady(): void {
    this.registerEvent(
      // TODO: something else than 'layout-change'
      this.app.workspace.on('layout-change', () => {
        updateFileTreeTitles(this);
        updateBreadcrumbs(this);
      }),
    );

    this.registerDomEvent(
      document,
      'click',
      (event: MouseEvent) => handleFileExplorerClick(this, event),
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

  onunload(): void {
    document.body.classList.remove('folder-notes-plugin');
  }
}
