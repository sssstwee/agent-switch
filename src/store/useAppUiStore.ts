import { create } from "zustand";
import type { TargetKey } from "../appTypes.ts";

export type AppView = "list" | "add" | "env" | "overview" | "switch" | "mcp" | "gateway";

type StateUpdater<T> = T | ((current: T) => T);

type AppUiStore = {
  target: TargetKey;
  editingId: string | null;
  busy: boolean;
  view: AppView;
  selectedPreset: string | null;
  advancedOptionsOpen: boolean;
  showAddApiKey: boolean;
  codexConfigOpen: boolean;
  desktopEffectiveConfigOpen: boolean;
  setTarget: (value: TargetKey) => void;
  setEditingId: (value: string | null) => void;
  setBusy: (value: boolean) => void;
  setView: (value: AppView) => void;
  setSelectedPreset: (value: string | null) => void;
  setAdvancedOptionsOpen: (value: StateUpdater<boolean>) => void;
  setShowAddApiKey: (value: StateUpdater<boolean>) => void;
  setCodexConfigOpen: (value: StateUpdater<boolean>) => void;
  setDesktopEffectiveConfigOpen: (value: StateUpdater<boolean>) => void;
};

function resolveValue<T>(value: StateUpdater<T>, current: T) {
  return typeof value === "function" ? (value as (current: T) => T)(current) : value;
}

export const useAppUiStore = create<AppUiStore>((set) => ({
  target: "codex",
  editingId: null,
  busy: false,
  view: "list",
  selectedPreset: null,
  advancedOptionsOpen: false,
  showAddApiKey: false,
  codexConfigOpen: true,
  desktopEffectiveConfigOpen: false,
  setTarget: (target) => set({ target }),
  setEditingId: (editingId) => set({ editingId }),
  setBusy: (busy) => set({ busy }),
  setView: (view) => set({ view }),
  setSelectedPreset: (selectedPreset) => set({ selectedPreset }),
  setAdvancedOptionsOpen: (value) => set((state) => ({
    advancedOptionsOpen: resolveValue(value, state.advancedOptionsOpen),
  })),
  setShowAddApiKey: (value) => set((state) => ({
    showAddApiKey: resolveValue(value, state.showAddApiKey),
  })),
  setCodexConfigOpen: (value) => set((state) => ({
    codexConfigOpen: resolveValue(value, state.codexConfigOpen),
  })),
  setDesktopEffectiveConfigOpen: (value) => set((state) => ({
    desktopEffectiveConfigOpen: resolveValue(value, state.desktopEffectiveConfigOpen),
  })),
}));
