import type { TAbstractFile, TFile, TFolder, View, WorkspaceLeaf } from 'obsidian';

interface FileExplorerWorkspaceLeaf extends WorkspaceLeaf {
  containerEl: HTMLElement;
  view: FileExplorerView;
}

interface FileExplorerViewFileItem extends TAbstractFile {
  titleEl: HTMLElement;
  selfEl: HTMLElement;
}

type FileOrFolderItem = FolderItem | FileItem;

interface FileItem {
  el: HTMLDivElement;
  file: TFile;
  fileExplorer: FileExplorerView;
  selfEl: HTMLDivElement;
  innerEl: HTMLDivElement;
}

interface FolderItem {
  el: HTMLDivElement;
  fileExplorer: FileExplorerView;
  selfEl: HTMLDivElement;
  innerEl: HTMLDivElement;
  file: TFolder;
  children: FileOrFolderItem[];
  childrenEl: HTMLDivElement;
  collapseIndicatorEl: HTMLDivElement;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  pusherEl: HTMLDivElement;
}

interface TreeItem {
  focusedItem: FileOrFolderItem;
  setFocusedItem: (item: FileOrFolderItem, moveViewport: boolean) => void;
  selectedDoms: Set<FileOrFolderItem>;
}
interface FileExplorerView extends View {
  fileItems: { [path: string]: FileExplorerViewFileItem };
  activeDom: FileOrFolderItem;
  tree: TreeItem;
}
