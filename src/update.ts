import { TFile, View } from 'obsidian';
import type FolderNotesPlugin from './main';
import { getFolderNote } from './utils';

export function updateFileTreeTitles(plugin: FolderNotesPlugin): void {
  document.querySelectorAll('.nav-folder-title-content').forEach((title) => {
    const folderTitle = title as HTMLElement;
    if (folderTitle.dataset.initialized === 'true') return;

    const folderPath = folderTitle.closest('.nav-folder-title')?.getAttribute('data-path');
    if (!folderPath) return;

    folderTitle.dataset.initialized = 'true';

    const folder = plugin.app.vault.getAbstractFileByPath(folderPath);
    if (!folder || folder instanceof TFile) return;

    const folderNote = getFolderNote(plugin, folder.path);
    if (!folderNote) return;

    // mark file as folder note
    addCSSClassToFileExplorerElement(folderNote.path, 'is-folder-note', plugin);

    // mark folder with folder note classes
    addCSSClassToFileExplorerElement(folder.path, 'has-folder-note', plugin);
  });
}

function addCSSClassToFileExplorerElement(
  path: string,
  cssClass: string,
  plugin: FolderNotesPlugin,
): void {
  // we don't use obsidian-typings, because it's incomplete
  type FileExplorerView = View & {
    fileItems: Record<string, { selfEl: HTMLElement }>;
    tree: { infinityScroll: { rootMargin: number } };
  };

  const fileExplorer = plugin.app.workspace.getLeavesOfType('file-explorer')[0]
    .view as FileExplorerView;

  // we need internal bs, so we can actually find stuff properly (with html, we would only be able to find stuff that is shown on the screen)
  const fileExplorerItem = fileExplorer.fileItems[path];
  const element: HTMLElement | null = fileExplorerItem?.selfEl ?? null;

  if (element === null) throw new Error("FNL: coudln't find the file explorer element");

  // fixes https://github.com/LostPaul/obsidian-folder-notes/issues/274
  fileExplorer.tree.infinityScroll.rootMargin = 100;

  element.addClass(cssClass);
  document.querySelectorAll(`[data-path='${CSS.escape(path)}']`).forEach((item) => {
    item.addClass(cssClass);
  });
}

export function updateBreadcrumbs(plugin: FolderNotesPlugin): void {
  // @ts-ignore internal
  const activeLeaf = plugin.app.workspace.getActiveFileView()?.containerEl as HTMLElement;
  if (!activeLeaf) return;

  const titleContainer = activeLeaf.querySelector('.view-header-title-container');
  if (!(titleContainer instanceof HTMLElement)) return;

  const breadcrumbs = titleContainer.querySelectorAll('span.view-header-breadcrumb');
  let path = '';

  breadcrumbs.forEach((breadcrumb: HTMLElement) => {
    path += breadcrumb.innerText;

    const folderNote = getFolderNote(plugin, path);
    if (!folderNote) return;

    breadcrumb.classList.add('has-folder-note');
    breadcrumb.setAttribute('data-path', path);

    if (!breadcrumb.onclick) {
      breadcrumb.addEventListener('click', (e) => handleBreadcrumbClick(e as MouseEvent, plugin), {
        capture: true,
      });
    }

    path += '/';
  });
}

export async function handleBreadcrumbClick(
  event: MouseEvent,
  plugin: FolderNotesPlugin,
): Promise<void> {
  const folderPath = (event.target as HTMLElement).getAttribute('data-path');
  const folderNote = getFolderNote(plugin, folderPath!);
  if (folderNote === null) return;

  plugin.app.workspace.getLeaf().openFile(folderNote);
}
