import { create } from "zustand";
import {
  DEFAULT_ENV_CARD_KEY,
  type EnvCheckResult,
  type EnvOperationProgress,
} from "../appConstants.ts";

type StateUpdater<T> = T | ((current: T) => T);

type EnvCheckStore = {
  envResults: EnvCheckResult | null;
  envChecking: boolean;
  envError: string;
  envCheckedAt: number | null;
  envCheckRun: number;
  envOperationProgress: EnvOperationProgress | null;
  pendingDeleteEnvConfigPath: string | null;
  deleteReadyEnvConfigPath: string | null;
  pendingDeleteEnvInstallPath: string | null;
  deleteReadyEnvInstallPath: string | null;
  selectedEnvCardKey: string;
  envInstallTargetKey: string | null;
  envClearConfigTargetKey: string | null;
  envDeleteInstallPath: string | null;
  envUpgradePath: string | null;
  envUninstallPath: string | null;
  envCancelingInstallTargetKey: string | null;
  envCancelingUninstallPath: string | null;
  envCancelingUpgradePath: string | null;
  pendingUninstallEnvPath: string | null;
  uninstallReadyEnvPath: string | null;
  setEnvResults: (value: StateUpdater<EnvCheckResult | null>) => void;
  setEnvChecking: (value: boolean) => void;
  setEnvError: (value: string) => void;
  setEnvCheckedAt: (value: number | null) => void;
  setEnvCheckRun: (value: StateUpdater<number>) => void;
  setEnvOperationProgress: (value: EnvOperationProgress | null) => void;
  setPendingDeleteEnvConfigPath: (value: string | null) => void;
  setDeleteReadyEnvConfigPath: (value: string | null) => void;
  setPendingDeleteEnvInstallPath: (value: string | null) => void;
  setDeleteReadyEnvInstallPath: (value: string | null) => void;
  setSelectedEnvCardKey: (value: string) => void;
  setEnvInstallTargetKey: (value: string | null) => void;
  setEnvClearConfigTargetKey: (value: string | null) => void;
  setEnvDeleteInstallPath: (value: string | null) => void;
  setEnvUpgradePath: (value: string | null) => void;
  setEnvUninstallPath: (value: string | null) => void;
  setEnvCancelingInstallTargetKey: (value: string | null) => void;
  setEnvCancelingUninstallPath: (value: string | null) => void;
  setEnvCancelingUpgradePath: (value: string | null) => void;
  setPendingUninstallEnvPath: (value: string | null) => void;
  setUninstallReadyEnvPath: (value: string | null) => void;
};

export const useEnvCheckStore = create<EnvCheckStore>((set) => ({
  envResults: null,
  envChecking: false,
  envError: "",
  envCheckedAt: null,
  envCheckRun: 0,
  envOperationProgress: null,
  pendingDeleteEnvConfigPath: null,
  deleteReadyEnvConfigPath: null,
  pendingDeleteEnvInstallPath: null,
  deleteReadyEnvInstallPath: null,
  selectedEnvCardKey: DEFAULT_ENV_CARD_KEY,
  envInstallTargetKey: null,
  envClearConfigTargetKey: null,
  envDeleteInstallPath: null,
  envUpgradePath: null,
  envUninstallPath: null,
  envCancelingInstallTargetKey: null,
  envCancelingUninstallPath: null,
  envCancelingUpgradePath: null,
  pendingUninstallEnvPath: null,
  uninstallReadyEnvPath: null,
  setEnvResults: (value) => set((state) => ({
    envResults: typeof value === "function" ? value(state.envResults) : value,
  })),
  setEnvChecking: (envChecking) => set({ envChecking }),
  setEnvError: (envError) => set({ envError }),
  setEnvCheckedAt: (envCheckedAt) => set({ envCheckedAt }),
  setEnvCheckRun: (value) => set((state) => ({
    envCheckRun: typeof value === "function" ? value(state.envCheckRun) : value,
  })),
  setEnvOperationProgress: (envOperationProgress) => set({ envOperationProgress }),
  setPendingDeleteEnvConfigPath: (pendingDeleteEnvConfigPath) => set({ pendingDeleteEnvConfigPath }),
  setDeleteReadyEnvConfigPath: (deleteReadyEnvConfigPath) => set({ deleteReadyEnvConfigPath }),
  setPendingDeleteEnvInstallPath: (pendingDeleteEnvInstallPath) => set({ pendingDeleteEnvInstallPath }),
  setDeleteReadyEnvInstallPath: (deleteReadyEnvInstallPath) => set({ deleteReadyEnvInstallPath }),
  setSelectedEnvCardKey: (selectedEnvCardKey) => set({ selectedEnvCardKey }),
  setEnvInstallTargetKey: (envInstallTargetKey) => set({ envInstallTargetKey }),
  setEnvClearConfigTargetKey: (envClearConfigTargetKey) => set({ envClearConfigTargetKey }),
  setEnvDeleteInstallPath: (envDeleteInstallPath) => set({ envDeleteInstallPath }),
  setEnvUpgradePath: (envUpgradePath) => set({ envUpgradePath }),
  setEnvUninstallPath: (envUninstallPath) => set({ envUninstallPath }),
  setEnvCancelingInstallTargetKey: (envCancelingInstallTargetKey) => set({ envCancelingInstallTargetKey }),
  setEnvCancelingUninstallPath: (envCancelingUninstallPath) => set({ envCancelingUninstallPath }),
  setEnvCancelingUpgradePath: (envCancelingUpgradePath) => set({ envCancelingUpgradePath }),
  setPendingUninstallEnvPath: (pendingUninstallEnvPath) => set({ pendingUninstallEnvPath }),
  setUninstallReadyEnvPath: (uninstallReadyEnvPath) => set({ uninstallReadyEnvPath }),
}));
