export interface FolderNotesSettings {
  oldFolderNoteName: string | undefined;
  folderNoteName: string;
  storageLocation: 'insideFolder' | 'parentFolder' | 'vaultFolder';
}

export const DEFAULT_SETTINGS: FolderNotesSettings = {
  oldFolderNoteName: undefined,
  folderNoteName: '{{folder_name}}',
  storageLocation: 'insideFolder',
};
