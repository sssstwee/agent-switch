import { create } from "zustand";
import {
  LANGUAGE_STORAGE_KEY,
  LEGACY_LANGUAGE_STORAGE_KEYS,
  LEGACY_SIDEBAR_WIDTH_STORAGE_KEYS,
  SIDEBAR_DEFAULT_WIDTH,
  SIDEBAR_LEGACY_DEFAULT_WIDTHS,
  SIDEBAR_WIDTH_STORAGE_KEY,
  type AppLanguage,
} from "../appConstants.ts";
import { normalizeLanguage } from "../i18n/uiTranslation.ts";
import { clampSidebarWidth } from "../sidebarUtils.ts";

type StateUpdater<T> = T | ((current: T) => T);

type SettingsPopoverAnchor = {
  left: number;
  bottom: number;
};

type StatusType = "success" | "error" | "";

type ShellUiStore = {
  status: string;
  statusType: StatusType;
  language: AppLanguage;
  settingsPopoverOpen: boolean;
  settingsPopoverAnchor: SettingsPopoverAnchor;
  sidebarWidth: number;
  showStatus: (message: string, type?: StatusType) => void;
  clearStatus: () => void;
  setLanguage: (value: AppLanguage) => void;
  setSettingsPopoverOpen: (value: StateUpdater<boolean>) => void;
  setSettingsPopoverAnchor: (value: SettingsPopoverAnchor) => void;
};

function readLocalStorage(key: string) {
  try {
    return typeof window === "undefined" ? null : window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLocalStorage(key: string, value: string) {
  try {
    if (typeof window !== "undefined") window.localStorage.setItem(key, value);
  } catch {
    // Local storage may be unavailable in restrictive previews.
  }
}

function readMigratedLocalStorage(key: string, legacyKeys: readonly string[] = []) {
  const current = readLocalStorage(key);
  if (current !== null) return current;
  for (const legacyKey of legacyKeys) {
    const legacy = readLocalStorage(legacyKey);
    if (legacy !== null) {
      writeLocalStorage(key, legacy);
      return legacy;
    }
  }
  return null;
}

function readInitialLanguage() {
  return normalizeLanguage(readMigratedLocalStorage(LANGUAGE_STORAGE_KEY, LEGACY_LANGUAGE_STORAGE_KEYS));
}

function readInitialSidebarWidth() {
  const storedWidth = Number(readMigratedLocalStorage(SIDEBAR_WIDTH_STORAGE_KEY, LEGACY_SIDEBAR_WIDTH_STORAGE_KEYS));
  if (SIDEBAR_LEGACY_DEFAULT_WIDTHS.includes(storedWidth)) {
    writeLocalStorage(SIDEBAR_WIDTH_STORAGE_KEY, String(SIDEBAR_DEFAULT_WIDTH));
    return SIDEBAR_DEFAULT_WIDTH;
  }
  return clampSidebarWidth(storedWidth || SIDEBAR_DEFAULT_WIDTH);
}

export const useShellUiStore = create<ShellUiStore>((set) => ({
  status: "",
  statusType: "",
  language: readInitialLanguage(),
  settingsPopoverOpen: false,
  settingsPopoverAnchor: { left: 24, bottom: 56 },
  sidebarWidth: readInitialSidebarWidth(),
  showStatus: (status, statusType = "") => set({ status, statusType }),
  clearStatus: () => set({ status: "", statusType: "" }),
  setLanguage: (language) => {
    writeLocalStorage(LANGUAGE_STORAGE_KEY, language);
    set({ language });
  },
  setSettingsPopoverOpen: (value) => set((state) => ({
    settingsPopoverOpen: typeof value === "function" ? value(state.settingsPopoverOpen) : value,
  })),
  setSettingsPopoverAnchor: (settingsPopoverAnchor) => set({ settingsPopoverAnchor }),
}));
