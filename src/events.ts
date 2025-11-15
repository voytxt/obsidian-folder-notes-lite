import { TFile } from 'obsidian';
import FolderNotesPlugin from 'src/main';
import { getFolderNote } from './folderNoteFunctions';

export function handleFileExplorerClick(plugin: FolderNotesPlugin, event: MouseEvent): void {
  const target = event.target as HTMLElement;

  const folderTitleEl = target.closest('.nav-folder-title') as HTMLElement | null;
  const folderPath = folderTitleEl?.getAttribute('data-path');
  if (!folderPath) return;

  const folderNote = getFolderNote(plugin, folderPath);

  if (!(folderNote instanceof TFile)) return;
  if (!event.ctrlKey) return;

  event.preventDefault();
  event.stopImmediatePropagation();

  // open folder note
  plugin.app.workspace.getLeaf().openFile(folderNote);
}

export async function handleBreadcrumbClick(
  event: MouseEvent,
  plugin: FolderNotesPlugin,
): Promise<void> {
  event.stopImmediatePropagation();
  event.preventDefault();
  event.stopPropagation();
  if (!(event.target instanceof HTMLElement)) return;

  const folderPath = event.target.getAttribute('data-path');
  if (!folderPath) return;

  const folderNote = getFolderNote(plugin, folderPath);

  if (folderNote) {
    // open folder note
    plugin.app.workspace.getLeaf().openFile(folderNote);

    // @ts-ignore internal
    plugin.app.internalPlugins.getEnabledPluginById('file-explorer').revealInFolder(folderNote);

    return;
  }

  event.target.onclick = null;
  event.target.click();
}
