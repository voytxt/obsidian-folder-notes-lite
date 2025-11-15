import type FolderNotesPlugin from 'src/main';
import { getFolderNote } from 'src/folderNoteFunctions';
import { handleBreadcrumbClick } from 'src/events';
import { updateCSSClassesForFolder } from './style';

export function updateFileTreeTitles(plugin: FolderNotesPlugin): void {
  document.querySelectorAll('.nav-folder-title-content').forEach((title) => {
    const folderTitle = title as HTMLElement;
    if (folderTitle.dataset.initialized === 'true') return;

    const folderPath = folderTitle.closest('.nav-folder-title')?.getAttribute('data-path');
    if (!folderPath) return;

    folderTitle.dataset.initialized = 'true';
    updateCSSClassesForFolder(folderPath, plugin);
  });
}

export function updateBreadcrumbs(plugin: FolderNotesPlugin): void {
  // @ts-ignore idk
  const activeLeaf = plugin.app.workspace.getActiveFileView()?.containerEl;
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
