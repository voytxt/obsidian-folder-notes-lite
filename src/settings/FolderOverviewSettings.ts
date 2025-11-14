import { Setting } from 'obsidian';
import type { SettingsTab } from './SettingsTab';
import { createOverviewSettings } from 'src/obsidian-folder-overview/src/settings';

export async function renderFolderOverview(settingsTab: SettingsTab): Promise<void> {
  const { plugin } = settingsTab;
  const defaultOverviewSettings = plugin.settings.defaultOverview;
  const containerEl = settingsTab.settingsPage;

  createOverviewSettings(
    containerEl,
    defaultOverviewSettings,
    plugin,
    plugin.settings.defaultOverview,
    settingsTab.display,
    undefined,
    undefined,
    undefined,
    settingsTab,
  );
}
