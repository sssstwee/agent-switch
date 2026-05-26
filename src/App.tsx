import { listen } from "@tauri-apps/api/event";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  ArrowsClockwise as RefreshCwIcon,
  ArrowsLeftRight as SwitchIcon,
  CaretDown as ChevronDownIcon,
  Check as CheckIcon,
  CheckCircle as AppliedStatusCheckIcon,
  Copy as CopyIcon,
  DownloadSimple as DownloadIcon,
  DotsThree as DotsThreeIcon,
  Eye as EyeIcon,
  EyeSlash as EyeOffIcon,
  PencilSimple as EditIcon,
  Plus as PlusIcon,
  ShieldCheck as ShieldCheckIcon,
  SquaresFour as LayoutDashboardIcon,
  Stack as LayersIcon,
  Trash as TrashIcon,
} from "@phosphor-icons/react";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useShallow } from "zustand/react/shallow";
import "./App.css";
import {
  getCodexThinkOutputAdvice,
} from "./configRecommendations.ts";
import {
  codexConfigOptionItems,
  defaultCodexConfigOptions,
  getCodexConfigOptionSupport,
  mergeCodexConfigOptionsIntoToml,
  normalizeCodexConfigOptions,
} from "./codexConfig.ts";
import {
  ENV_CHECK_ERROR_VISIBLE_MS,
  remainingEnvCheckVisibleDelay,
} from "./envCheckFeedback.ts";
import {
  browserEnvPlatform,
  dedupeEnvRecordsByPath,
  envPlatformLabel,
  isEnvVersionNewer,
  markDeletedEnvConfig,
} from "./envCheckUtils.ts";
import {
  envConfigStatusLabel,
  isEnvOperationStopped,
  readEnvCheckSessionSnapshot,
  writeEnvCheckSessionSnapshot,
} from "./envCheckSessionUtils.ts";
import type {
  AddForm,
  ApiFormat,
  AppState,
  AuthField,
  CodexCompatMode,
  CodexProfile,
  GatewayTargetKey,
  GatewayModel,
  GatewayProfile,
  ModelMap,
  TargetKey,
  VendorPreset,
} from "./appTypes.ts";
import { invokeNative, nativeCommand } from "./nativeIpc.ts";
import { nativeApi } from "./nativeApi.ts";
import {
  buildClaudeDesktopMetaConfigPreview,
  buildClaudeDesktopProfileConfigPreview,
  buildCodexAuthJsonTemplate,
  buildCodexConfigTomlTemplate,
  buildCodexModelCatalogPreview,
  buildGatewayModels,
  buildTargetConfigPreview,
  CODEX_LOCAL_PROXY_BASE_URL,
  sanitizeCodexConfigOptionsForForm,
  withCodexTemplates,
} from "./configPreviews.ts";
import { formFromConfigJson } from "./configJsonImport.ts";
import { AppSidebar } from "./features/app-shell/AppSidebar.tsx";
import { useAppShellChrome } from "./features/app-shell/useAppShellChrome.ts";
import { ClaudeDesktopEffectiveConfigPanel } from "./features/config-options/ClaudeDesktopEffectiveConfigPanel.tsx";
import { buildEnvCheckCards } from "./features/env-check/envCheckCards.ts";
import {
  configOptionItemsForTarget,
  defaultGatewayConfigOptions,
  recommendedCodexConfigOptionsForForm,
  sanitizeConfigOptionsForPreset,
  sanitizeConfigOptionsForTarget,
  withRecommendedGatewayTargetConfigOptions,
  withRecommendedGatewayConfigOptions,
} from "./gatewayConfigOptions.ts";
import {
  allVendorPresets,
  claudeOfficialModelMap,
  customPreset,
  vendorPresetApiFormatForTarget,
  vendorPresetAuthFieldForTarget,
  vendorPresetModelDiscoveryBaseUrlForTarget,
  vendorPresetSourceUrlForTarget,
} from "./vendorPresets.ts";
import {
  addressVariantPresetsFor,
  buildPresetFamilies,
  claudeCompatModeForPreset,
  codexCompatModeForPreset,
  codexPresetDisabledReason,
  firstSelectablePresetForTarget,
  pickPresetForMode,
  presetFamilyKey,
  presetForProfile,
  presetModeKey,
  presetModeLabel,
  presetModesForFamily,
  selectedPresetById,
} from "./profilePresetUtils.ts";
import {
  authFieldsForCustomTarget,
  cloneModelMap,
  createEmptyAddForm,
  customApiFormatsForTarget,
  defaultAuthFieldForApiFormat,
  formFromProfile,
  gatewayPresetUpstreamBaseUrl,
  normalizeGatewayProfileForApply,
  officialCodexProfileForLocalSync,
  providerModelMapFallback,
  providerModelPlaceholder,
} from "./profileFormUtils.ts";
import {
  apiFormatLabels,
  authFieldLabels,
  codexCompatModeLabel,
  formatCheckTime,
  profileModelName,
  profileCompatModeMeta,
} from "./profileDisplayUtils.ts";
import { Button, Card, Chip, Input, Switch, Tooltip } from "./nativeUi.tsx";
import { reorderProfilesById } from "./profileOrdering.ts";
import { isProxyTarget, type ProxyTargetKey } from "./proxyTargets.ts";
import { filterProviderModelCandidates } from "./modelDiscovery.ts";
import { targetOptions, visibleTargetOptions } from "./targetOptions.ts";
import { targetIconByKey } from "./targetIcons.tsx";
import {
  defaultModelMap,
  extractTomlAssignment,
  isAsciiHeaderValue,
  isOfficialAnthropicBaseUrl,
  validateProviderModelMap,
} from "./gatewayProfile.ts";
import {
  gatewayRequirementForProfile,
  type GatewayRequirement,
} from "./gatewayRequirement.ts";
import { useEnvCheckStore } from "./store/useEnvCheckStore.ts";
import { useGatewayStore } from "./store/useGatewayStore.ts";

import {
  SIDEBAR_TEXT_ONLY_WIDTH,
  ENV_OPERATION_PROGRESS_EVENT,
  ENV_CHECK_CARD_ORDER,
  DEFAULT_ENV_CARD_KEY,
} from "./appConstants.ts";
import type { EnvCheckCardKey, EnvOperationKind, EnvOperationProgress, EnvProgressOperationKind, EnvCheckResult } from "./appConstants.ts";
import { translateUiText, localizedDisplayValue, shouldTranslateTextNode, shouldTranslateElementAttributes, translatedAttributes } from "./i18n/uiTranslation.ts";
import {
  ProfileVendorLogo,
  SortableProfileCard,
  TargetLogo,
  VendorLogo,
} from "./components/AppUiPrimitives.tsx";
import { AddressVariantSwitch } from "./components/AddressVariantSwitch.tsx";
import { GatewayConfigOptionsPanel } from "./components/GatewayConfigOptionsPanel.tsx";
import { GatewayRequirementIcon } from "./components/GatewayRequirementIcon.tsx";
import { ModelDiscoveryField } from "./components/ModelDiscoveryField.tsx";
import { OfficialCodexModelField } from "./components/OfficialCodexModelField.tsx";
import { OneMillionContextField } from "./components/OneMillionContextField.tsx";
import {
  GatewayPage,
  getGatewaySnapshot as buildGatewaySnapshot,
  resolveGatewaySelectedTarget as resolveGatewaySelectedGatewayTarget,
} from "./components/GatewayPage.tsx";
import {
  isClaudeGatewayTarget,
  isCodexCliTarget,
  isCodexTarget,
  profilesForTarget,
  supportsNativeApply,
  targetDisplayName,
} from "./components/gatewayHelpers.ts";
import { useAppUiStore } from "./store/useAppUiStore.ts";
import { useShellUiStore } from "./store/useShellUiStore.ts";

const McpSkillsView = lazy(() => import("./McpSkillsView.tsx"));

function envCheckCardSortIndex(key: string) {
  const index = ENV_CHECK_CARD_ORDER.indexOf(key as EnvCheckCardKey);
  return index >= 0 ? index : ENV_CHECK_CARD_ORDER.length;
}

import { mergeCodexOfficialModelIntoToml } from "./tomlUtils.ts";

function App() {
  const [state, setState] = useState<AppState | null>(null);
  const [stateLoadError, setStateLoadError] = useState("");
  const {
    target,
    editingId,
    busy,
    view,
    selectedPreset,
    advancedOptionsOpen,
    showAddApiKey,
    codexConfigOpen,
    desktopEffectiveConfigOpen,
    setTarget,
    setEditingId,
    setBusy,
    setView,
    setSelectedPreset,
    setAdvancedOptionsOpen,
    setShowAddApiKey,
    setCodexConfigOpen,
    setDesktopEffectiveConfigOpen,
  } = useAppUiStore(useShallow((appUiState) => ({
    target: appUiState.target,
    editingId: appUiState.editingId,
    busy: appUiState.busy,
    view: appUiState.view,
    selectedPreset: appUiState.selectedPreset,
    advancedOptionsOpen: appUiState.advancedOptionsOpen,
    showAddApiKey: appUiState.showAddApiKey,
    codexConfigOpen: appUiState.codexConfigOpen,
    desktopEffectiveConfigOpen: appUiState.desktopEffectiveConfigOpen,
    setTarget: appUiState.setTarget,
    setEditingId: appUiState.setEditingId,
    setBusy: appUiState.setBusy,
    setView: appUiState.setView,
    setSelectedPreset: appUiState.setSelectedPreset,
    setAdvancedOptionsOpen: appUiState.setAdvancedOptionsOpen,
    setShowAddApiKey: appUiState.setShowAddApiKey,
    setCodexConfigOpen: appUiState.setCodexConfigOpen,
    setDesktopEffectiveConfigOpen: appUiState.setDesktopEffectiveConfigOpen,
  })));
  const {
    status,
    statusType,
    language,
    settingsPopoverOpen,
    settingsPopoverAnchor,
    sidebarCollapsed,
    sidebarWidth,
    showStatus,
    clearStatus,
    setLanguage,
    setSettingsPopoverOpen,
    setSettingsPopoverAnchor,
    setSidebarCollapsed,
    setSidebarWidth,
  } = useShellUiStore(useShallow((shellState) => ({
    status: shellState.status,
    statusType: shellState.statusType,
    language: shellState.language,
    settingsPopoverOpen: shellState.settingsPopoverOpen,
    settingsPopoverAnchor: shellState.settingsPopoverAnchor,
    sidebarCollapsed: shellState.sidebarCollapsed,
    sidebarWidth: shellState.sidebarWidth,
    showStatus: shellState.showStatus,
    clearStatus: shellState.clearStatus,
    setLanguage: shellState.setLanguage,
    setSettingsPopoverOpen: shellState.setSettingsPopoverOpen,
    setSettingsPopoverAnchor: shellState.setSettingsPopoverAnchor,
    setSidebarCollapsed: shellState.setSidebarCollapsed,
    setSidebarWidth: shellState.setSidebarWidth,
  })));
  const textNodeOriginalsRef = useRef<WeakMap<Text, string>>(new WeakMap());
  const elementAttributeOriginalsRef = useRef<WeakMap<Element, Partial<Record<typeof translatedAttributes[number], string>>>>(new WeakMap());

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    const root = document.body;
    if (!root) return;
    const textNodeOriginals = textNodeOriginalsRef.current;
    const elementAttributeOriginals = elementAttributeOriginalsRef.current;

    function translateTextNode(node: Text) {
      if (!shouldTranslateTextNode(node)) return;
      const current = node.nodeValue ?? "";
      const knownOriginal = textNodeOriginals.get(node);

      if (language === "zh") {
        if (knownOriginal !== undefined) {
          const zhTranslation = translateUiText(knownOriginal, "en");
          if (current === zhTranslation && current !== knownOriginal) {
            node.nodeValue = knownOriginal;
            return;
          }
        }
        textNodeOriginals.set(node, current);
        return;
      }

      const knownTranslation = knownOriginal === undefined ? "" : translateUiText(knownOriginal, language);
      const original = knownOriginal === undefined || current !== knownTranslation ? current : knownOriginal;
      textNodeOriginals.set(node, original);
      const next = translateUiText(original, language);
      if (current !== next) node.nodeValue = next;
    }

    function translateElementAttributes(element: Element) {
      if (!shouldTranslateElementAttributes(element)) return;
      const originals = elementAttributeOriginals.get(element) ?? {};
      let changed = false;

      for (const attribute of translatedAttributes) {
        const current = element.getAttribute(attribute);
        if (current === null) continue;

        if (language === "zh") {
          const original = originals[attribute];
          if (original !== undefined) {
            const zhAttributeTranslation = translateUiText(original, "en");
            if (current === zhAttributeTranslation && current !== original) {
              element.setAttribute(attribute, original);
              continue;
            }
          }
          originals[attribute] = current;
          changed = true;
          continue;
        }

        const knownOriginal = originals[attribute];
        const knownTranslation = knownOriginal === undefined ? "" : translateUiText(knownOriginal, language);
        const original = knownOriginal === undefined || current !== knownTranslation ? current : knownOriginal;
        originals[attribute] = original;
        changed = true;
        const next = translateUiText(original, language);
        if (current !== next) element.setAttribute(attribute, next);
      }

      if (changed) elementAttributeOriginals.set(element, originals);
    }

    function translateSubtree(node: Node) {
      if (node.nodeType === Node.TEXT_NODE) {
        translateTextNode(node as Text);
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return;
      if (node.nodeType === Node.ELEMENT_NODE) translateElementAttributes(node as Element);

      const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
      let current = walker.nextNode();
      while (current) {
        if (current.nodeType === Node.TEXT_NODE) {
          translateTextNode(current as Text);
        } else if (current.nodeType === Node.ELEMENT_NODE) {
          translateElementAttributes(current as Element);
        }
        current = walker.nextNode();
      }
    }

    translateSubtree(root);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          translateTextNode(mutation.target as Text);
        } else if (mutation.type === "attributes") {
          translateElementAttributes(mutation.target as Element);
        } else {
          mutation.addedNodes.forEach(translateSubtree);
        }
      }
    });
    observer.observe(root, {
      attributeFilter: [...translatedAttributes],
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, [language]);

  // Auto-dismiss status toast 3s after any status change
  useEffect(() => {
    if (!status) return;
    const timer = window.setTimeout(clearStatus, 3000);
    return () => window.clearTimeout(timer);
  }, [status, clearStatus]);

  const {
    appUpdate,
    handleSidebarResizePointerDown,
    openAppUpdateRelease,
    settingsButtonRef,
    startWindowDrag,
    toggleSettingsPopover,
    toggleSidebarCollapsed,
  } = useAppShellChrome({
    sidebarCollapsed,
    sidebarWidth,
    setSidebarCollapsed,
    setSidebarWidth,
    setSettingsPopoverAnchor,
    setSettingsPopoverOpen,
    showStatus,
  });

  const {
    codexProxyStatus,
    codexProxyCallsPage,
    codexProxyOverview,
    codexProxyOverviewRange,
    codexProxyOverviewBucket,
    codexProxyOverviewError,
    gatewayPageTarget,
    codexProxyDetailTab,
    codexProxyCallPage,
    codexProxyCallPageSize,
    codexProxyExpandedCallId,
    codexProxyCallDetails,
    codexProxyBusy,
    setCodexProxyStatus,
    setCodexProxyCallsPage,
    setCodexProxyOverview,
    setCodexProxyOverviewRange,
    setCodexProxyOverviewBucket,
    setCodexProxyOverviewError,
    setGatewayPageTarget,
    setCodexProxyDetailTab,
    setCodexProxyCallPage,
    setCodexProxyCallPageSize,
    setCodexProxyExpandedCallId,
    setCodexProxyCallDetails,
    setCodexProxyBusy,
    resetGatewayHistoryView,
  } = useGatewayStore(useShallow((gatewayState) => ({
    codexProxyStatus: gatewayState.codexProxyStatus,
    codexProxyCallsPage: gatewayState.codexProxyCallsPage,
    codexProxyOverview: gatewayState.codexProxyOverview,
    codexProxyOverviewRange: gatewayState.codexProxyOverviewRange,
    codexProxyOverviewBucket: gatewayState.codexProxyOverviewBucket,
    codexProxyOverviewError: gatewayState.codexProxyOverviewError,
    gatewayPageTarget: gatewayState.gatewayPageTarget,
    codexProxyDetailTab: gatewayState.codexProxyDetailTab,
    codexProxyCallPage: gatewayState.codexProxyCallPage,
    codexProxyCallPageSize: gatewayState.codexProxyCallPageSize,
    codexProxyExpandedCallId: gatewayState.codexProxyExpandedCallId,
    codexProxyCallDetails: gatewayState.codexProxyCallDetails,
    codexProxyBusy: gatewayState.codexProxyBusy,
    setCodexProxyStatus: gatewayState.setCodexProxyStatus,
    setCodexProxyCallsPage: gatewayState.setCodexProxyCallsPage,
    setCodexProxyOverview: gatewayState.setCodexProxyOverview,
    setCodexProxyOverviewRange: gatewayState.setCodexProxyOverviewRange,
    setCodexProxyOverviewBucket: gatewayState.setCodexProxyOverviewBucket,
    setCodexProxyOverviewError: gatewayState.setCodexProxyOverviewError,
    setGatewayPageTarget: gatewayState.setGatewayPageTarget,
    setCodexProxyDetailTab: gatewayState.setCodexProxyDetailTab,
    setCodexProxyCallPage: gatewayState.setCodexProxyCallPage,
    setCodexProxyCallPageSize: gatewayState.setCodexProxyCallPageSize,
    setCodexProxyExpandedCallId: gatewayState.setCodexProxyExpandedCallId,
    setCodexProxyCallDetails: gatewayState.setCodexProxyCallDetails,
    setCodexProxyBusy: gatewayState.setCodexProxyBusy,
    resetGatewayHistoryView: gatewayState.resetGatewayHistoryView,
  })));
  const [modelDiscoveryBusy, setModelDiscoveryBusy] = useState(false);
  const [discoveredProviderModels, setDiscoveredProviderModels] = useState<string[]>([]);
  const [modelDiscoveryEndpoint, setModelDiscoveryEndpoint] = useState("");
  const [visibleApiKeys, setVisibleApiKeys] = useState<Record<string, boolean>>({});
  const [pendingDeleteModel, setPendingDeleteModel] = useState<{ profileId: string; index: number } | null>(null);
  const [deleteReadyModel, setDeleteReadyModel] = useState<{ profileId: string; index: number } | null>(null);
  const [addForm, setAddForm] = useState<AddForm>(() => createEmptyAddForm());
  const [dirtyConfigJsonText, setDirtyConfigJsonText] = useState(() => buildTargetConfigPreview(createEmptyAddForm(), "claude_cli"));
  const [configJsonDirty, setConfigJsonDirty] = useState(false);
  const [configJsonError, setConfigJsonError] = useState("");
  const [dirtyDesktopProfileJsonText, setDirtyDesktopProfileJsonText] = useState(() => buildClaudeDesktopProfileConfigPreview(createEmptyAddForm()));
  const [dirtyDesktopMetaJsonText, setDirtyDesktopMetaJsonText] = useState(() => buildClaudeDesktopMetaConfigPreview(null, null, createEmptyAddForm()));
  const [desktopConfigDirty, setDesktopConfigDirty] = useState(false);
  const deleteModelTimerRef = useRef<number | null>(null);

  useEffect(() => {
    void loadState();
  }, []);

  useEffect(() => {
    return () => clearDeleteConfirmTimers();
  }, []);

  useEffect(() => {
    void loadCodexProxyStatus();
  }, [target]);

  useEffect(() => {
    resetGatewayHistoryView();
  }, [target, gatewayPageTarget, codexProxyDetailTab, resetGatewayHistoryView]);

  useEffect(() => {
    if (view !== "gateway") return;
    let disposed = false;
    let removeProxyEventListener: (() => void) | null = null;
    let visibilityHandler: (() => void) | null = null;
    let timer: number | null = null;

    const refreshProxyStatus = () => {
      if (document.visibilityState === "hidden") return;
      void nativeApi.codexProxyStatus().then(setCodexProxyStatus).catch(() => undefined);
      if (codexProxyDetailTab === "overview" || codexProxyDetailTab === "detail") {
        const selectedTarget = resolveGatewaySelectedTarget();
        if (codexProxyDetailTab === "overview" || codexProxyDetailTab === "detail") {
          void loadCodexProxyOverview(selectedTarget);
        }
        if (codexProxyDetailTab === "detail") {
          void nativeApi
            .codexProxyCallsPage(selectedTarget, codexProxyCallPage, codexProxyCallPageSize, codexProxyOverviewRange, codexProxyOverviewBucket)
            .then(setCodexProxyCallsPage)
            .catch(() => undefined);
        }
      }
    };

    const startPolling = () => {
      if (timer !== null) window.clearInterval(timer);
      timer = window.setInterval(refreshProxyStatus, 15000);
    };

    const stopPolling = () => {
      if (timer !== null) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    refreshProxyStatus();
    startPolling();

    visibilityHandler = () => {
      if (document.visibilityState === "visible") {
        refreshProxyStatus();
        startPolling();
      } else {
        stopPolling();
      }
    };
    document.addEventListener("visibilitychange", visibilityHandler);

    void listen("codex-proxy-call-recorded", () => {
      if (!disposed && document.visibilityState === "visible") refreshProxyStatus();
    })
      .then((unlisten) => {
        if (disposed) {
          unlisten();
        } else {
          removeProxyEventListener = unlisten;
        }
      })
      .catch(() => undefined);

    return () => {
      disposed = true;
      stopPolling();
      if (visibilityHandler) document.removeEventListener("visibilitychange", visibilityHandler);
      removeProxyEventListener?.();
    };
  }, [
    view,
    codexProxyDetailTab,
    target,
    gatewayPageTarget,
    codexProxyCallPage,
    codexProxyCallPageSize,
    codexProxyOverviewRange,
    codexProxyOverviewBucket,
  ]);

  const currentTargetMeta = useMemo(
    () => targetOptions.find((option) => option.key === target)!,
    [target],
  );

  const currentProfiles = useMemo(() => {
    return profilesForTarget(state, target);
  }, [state, target]);
  const presetFamilies = useMemo(() => buildPresetFamilies(target), [target]);
  const currentSelectedPreset = useMemo(() => selectedPresetById(selectedPreset), [selectedPreset]);
  const currentPresetFamily = currentSelectedPreset
    ? (presetFamilies.find((family) => family.key === presetFamilyKey(currentSelectedPreset)) ?? null)
    : null;
  const currentPresetModes = currentPresetFamily ? presetModesForFamily(currentPresetFamily) : [];
  const currentAddressVariantPresets = addressVariantPresetsFor(currentPresetFamily, currentSelectedPreset);
  const currentCodexLocalProfile = useMemo(
    () => officialCodexProfileForLocalSync(state?.codex),
    [state],
  );

  const targetConfigPreview = useMemo(() => buildTargetConfigPreview(addForm, target), [addForm, target]);
  const desktopProfileConfigPreview = useMemo(
    () => buildClaudeDesktopProfileConfigPreview(addForm),
    [addForm],
  );
  const desktopMetaConfigPreview = useMemo(
    () => buildClaudeDesktopMetaConfigPreview(state, editingId, addForm),
    [addForm, editingId, state],
  );

  const displayConfigJsonText = useMemo(
    () => configJsonDirty ? dirtyConfigJsonText : targetConfigPreview,
    [configJsonDirty, dirtyConfigJsonText, targetConfigPreview],
  );

  const displayDesktopProfileJsonText = useMemo(
    () => desktopConfigDirty ? dirtyDesktopProfileJsonText : desktopProfileConfigPreview,
    [desktopConfigDirty, dirtyDesktopProfileJsonText, desktopProfileConfigPreview],
  );

  const displayDesktopMetaJsonText = useMemo(
    () => desktopConfigDirty ? dirtyDesktopMetaJsonText : desktopMetaConfigPreview,
    [desktopConfigDirty, dirtyDesktopMetaJsonText, desktopMetaConfigPreview],
  );
  const providerModelCandidates = useMemo(() => {
    const names = [
      ...discoveredProviderModels,
      ...(currentSelectedPreset?.models ?? []),
      currentSelectedPreset?.model_map.main ?? "",
    ]
      .map((model) => model.trim())
      .filter(Boolean);
    return filterProviderModelCandidates(names, currentSelectedPreset);
  }, [currentSelectedPreset, discoveredProviderModels]);

  // Stable callbacks for GatewayPage to avoid unnecessary re-renders
  const handleGatewayBack = useCallback(() => { setView("list"); setEditingId(null); }, []);
  const handleGatewayLoadOverview = useCallback((key: ProxyTargetKey) => { void loadCodexProxyOverview(key); }, []);
  const handleGatewayStartProxy = useCallback((key?: ProxyTargetKey) => { void startCodexProxy(key); }, []);
  const handleGatewayStopProxy = useCallback((key?: ProxyTargetKey) => { void stopCodexProxy(key); }, []);
  const handleGatewayToggleCallDetail = useCallback((targetKey: ProxyTargetKey, callId: number) => { void toggleCodexProxyCallDetail(targetKey, callId); }, [toggleCodexProxyCallDetail]);

  const {
    envResults,
    envChecking,
    envError,
    envCheckedAt,
    envCheckRun,
    envOperationProgress,
    pendingDeleteEnvConfigPath,
    deleteReadyEnvConfigPath,
    pendingDeleteEnvInstallPath,
    deleteReadyEnvInstallPath,
    selectedEnvCardKey,
    envInstallTargetKey,
    envClearConfigTargetKey,
    envDeleteInstallPath,
    envUpgradePath,
    envUninstallPath,
    envCancelingInstallTargetKey,
    envCancelingUninstallPath,
    envCancelingUpgradePath,
    pendingUninstallEnvPath,
    uninstallReadyEnvPath,
    setEnvResults,
    setEnvChecking,
    setEnvError,
    setEnvCheckedAt,
    setEnvCheckRun,
    setEnvOperationProgress,
    setPendingDeleteEnvConfigPath,
    setDeleteReadyEnvConfigPath,
    setPendingDeleteEnvInstallPath,
    setDeleteReadyEnvInstallPath,
    setSelectedEnvCardKey,
    setEnvInstallTargetKey,
    setEnvClearConfigTargetKey,
    setEnvDeleteInstallPath,
    setEnvUpgradePath,
    setEnvUninstallPath,
    setEnvCancelingInstallTargetKey,
    setEnvCancelingUninstallPath,
    setEnvCancelingUpgradePath,
    setPendingUninstallEnvPath,
    setUninstallReadyEnvPath,
  } = useEnvCheckStore(useShallow((envState) => ({
    envResults: envState.envResults,
    envChecking: envState.envChecking,
    envError: envState.envError,
    envCheckedAt: envState.envCheckedAt,
    envCheckRun: envState.envCheckRun,
    envOperationProgress: envState.envOperationProgress,
    pendingDeleteEnvConfigPath: envState.pendingDeleteEnvConfigPath,
    deleteReadyEnvConfigPath: envState.deleteReadyEnvConfigPath,
    pendingDeleteEnvInstallPath: envState.pendingDeleteEnvInstallPath,
    deleteReadyEnvInstallPath: envState.deleteReadyEnvInstallPath,
    selectedEnvCardKey: envState.selectedEnvCardKey,
    envInstallTargetKey: envState.envInstallTargetKey,
    envClearConfigTargetKey: envState.envClearConfigTargetKey,
    envDeleteInstallPath: envState.envDeleteInstallPath,
    envUpgradePath: envState.envUpgradePath,
    envUninstallPath: envState.envUninstallPath,
    envCancelingInstallTargetKey: envState.envCancelingInstallTargetKey,
    envCancelingUninstallPath: envState.envCancelingUninstallPath,
    envCancelingUpgradePath: envState.envCancelingUpgradePath,
    pendingUninstallEnvPath: envState.pendingUninstallEnvPath,
    uninstallReadyEnvPath: envState.uninstallReadyEnvPath,
    setEnvResults: envState.setEnvResults,
    setEnvChecking: envState.setEnvChecking,
    setEnvError: envState.setEnvError,
    setEnvCheckedAt: envState.setEnvCheckedAt,
    setEnvCheckRun: envState.setEnvCheckRun,
    setEnvOperationProgress: envState.setEnvOperationProgress,
    setPendingDeleteEnvConfigPath: envState.setPendingDeleteEnvConfigPath,
    setDeleteReadyEnvConfigPath: envState.setDeleteReadyEnvConfigPath,
    setPendingDeleteEnvInstallPath: envState.setPendingDeleteEnvInstallPath,
    setDeleteReadyEnvInstallPath: envState.setDeleteReadyEnvInstallPath,
    setSelectedEnvCardKey: envState.setSelectedEnvCardKey,
    setEnvInstallTargetKey: envState.setEnvInstallTargetKey,
    setEnvClearConfigTargetKey: envState.setEnvClearConfigTargetKey,
    setEnvDeleteInstallPath: envState.setEnvDeleteInstallPath,
    setEnvUpgradePath: envState.setEnvUpgradePath,
    setEnvUninstallPath: envState.setEnvUninstallPath,
    setEnvCancelingInstallTargetKey: envState.setEnvCancelingInstallTargetKey,
    setEnvCancelingUninstallPath: envState.setEnvCancelingUninstallPath,
    setEnvCancelingUpgradePath: envState.setEnvCancelingUpgradePath,
    setPendingUninstallEnvPath: envState.setPendingUninstallEnvPath,
    setUninstallReadyEnvPath: envState.setUninstallReadyEnvPath,
  })));
  const envOperationBusy = Boolean(envInstallTargetKey) || Boolean(envClearConfigTargetKey) || Boolean(envDeleteInstallPath) || Boolean(envUpgradePath) || Boolean(envUninstallPath);
  const deleteEnvConfigTimerRef = useRef<number | null>(null);
  const deleteEnvInstallTimerRef = useRef<number | null>(null);
  const uninstallEnvTimerRef = useRef<number | null>(null);
  const activeEnvOperationRef = useRef<{
    operation: EnvProgressOperationKind;
    target?: string;
    path?: string;
  } | null>(null);
  const profileDragSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );


  const currentEnvPlatform = envResults?.platform ?? browserEnvPlatform();
  const currentEnvPlatformLabel = envResults?.platform_label ?? envPlatformLabel(currentEnvPlatform);

  useEffect(() => {
    let disposed = false;
    void readEnvCheckSessionSnapshot().then((snapshot) => {
      if (disposed || !snapshot) return;
      setEnvResults(snapshot.results);
      setEnvCheckedAt(snapshot.checkedAt);
      setSelectedEnvCardKey(DEFAULT_ENV_CARD_KEY);
      setEnvCheckRun((run) => run + 1);
    });
    return () => {
      disposed = true;
    };
  }, [setEnvCheckRun, setEnvCheckedAt, setEnvResults, setSelectedEnvCardKey]);

  // Auto-trigger env check when entering the env view — disabled; user clicks button manually.
  const envCheckTriggered = useRef(false);
  useEffect(() => {
    if (view !== "env") {
      envCheckTriggered.current = false;
    }
  }, [view]);

  useEffect(() => {
    if (!envError) return undefined;
    const timer = window.setTimeout(() => {
      setEnvError("");
    }, ENV_CHECK_ERROR_VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [envError, setEnvError]);

  useEffect(() => {
    let disposed = false;
    let removeListener: (() => void) | null = null;

    void listen<EnvOperationProgress>(ENV_OPERATION_PROGRESS_EVENT, (event) => {
      if (disposed) return;
      const active = activeEnvOperationRef.current;
      const progress = event.payload;
      if (!active || progress.operation !== active.operation) return;
      if (active.target && progress.target && progress.target !== active.target) return;
      if (active.path && progress.path && progress.path !== active.path) return;
      setEnvOperationProgress(progress);
    })
      .then((unlisten) => {
        if (disposed) {
          unlisten();
        } else {
          removeListener = unlisten;
        }
      })
      .catch(() => undefined);

    return () => {
      disposed = true;
      removeListener?.();
    };
  }, []);

  async function runEnvCheck() {
    if (envChecking) return;
    clearDeleteConfirmState();
    const startedAt = Date.now();
    activeEnvOperationRef.current = { operation: "check" };
    setEnvOperationProgress({
      operation: "check",
      target: "",
      path: "",
      phase: "识别当前系统",
      command: currentEnvPlatformLabel,
    });
    setEnvChecking(true);
    setEnvError("");
    setSelectedEnvCardKey(DEFAULT_ENV_CARD_KEY);
    setEnvCheckRun((run) => run + 1);
    try {
      const result = await invokeNative<EnvCheckResult>(nativeCommand.checkEnvironment);
      const checkedAt = Date.now();
      setEnvResults(result);
      setEnvCheckedAt(checkedAt);
      writeEnvCheckSessionSnapshot(result, checkedAt, DEFAULT_ENV_CARD_KEY);
      setEnvCheckRun((run) => run + 1);
    } catch (error) {
      const message = `环境检查失败：${String(error)}`;
      setEnvError(message);
      showStatus(message);
    } finally {
      const delay = remainingEnvCheckVisibleDelay(startedAt, Date.now());
      if (delay > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, delay));
      }
      activeEnvOperationRef.current = null;
      setEnvOperationProgress(null);
      setEnvChecking(false);
    }
  }

  function requestDeleteEnvConfig(path: string) {
    clearDeleteConfirmTimers();
    setPendingDeleteModel(null);
    setDeleteReadyModel(null);
    setPendingDeleteEnvInstallPath(null);
    setDeleteReadyEnvInstallPath(null);
    setDeleteReadyEnvConfigPath(null);
    setPendingDeleteEnvConfigPath(path);
    deleteEnvConfigTimerRef.current = window.setTimeout(() => {
      setDeleteReadyEnvConfigPath(path);
      deleteEnvConfigTimerRef.current = null;
    }, 300);
    showStatus("请再次确认删除该多余配置。");
  }

  async function deleteEnvConfig(path: string) {
    if (envChecking) return;
    setEnvError("");
    clearDeleteConfirmState();
    try {
      await invokeNative<void>(nativeCommand.deleteEnvConfig, { path });
      setEnvResults((result) => {
        if (!result) return result;
        const next = markDeletedEnvConfig(result, path);
        writeEnvCheckSessionSnapshot(next, envCheckedAt ?? Date.now(), selectedEnvCardKey);
        return next;
      });
      showStatus("已删除多余配置。");
    } catch (error) {
      const message = `删除多余配置失败：${String(error)}`;
      setEnvError(message);
      showStatus(message);
    }
  }

  function handleDeleteEnvConfigPress(path: string) {
    if (pendingDeleteEnvConfigPath === path && deleteReadyEnvConfigPath === path) {
      void deleteEnvConfig(path);
      return;
    }
    requestDeleteEnvConfig(path);
  }

  function requestDeleteEnvInstallation(path: string) {
    clearDeleteConfirmTimers();
    setPendingDeleteModel(null);
    setDeleteReadyModel(null);
    setPendingDeleteEnvConfigPath(null);
    setDeleteReadyEnvConfigPath(null);
    setPendingUninstallEnvPath(null);
    setUninstallReadyEnvPath(null);
    setDeleteReadyEnvInstallPath(null);
    setPendingDeleteEnvInstallPath(path);
    deleteEnvInstallTimerRef.current = window.setTimeout(() => {
      setDeleteReadyEnvInstallPath(path);
      deleteEnvInstallTimerRef.current = null;
    }, 300);
    showStatus("请再次确认删除该多余安装位置。");
  }

  async function deleteEnvInstallation(path: string) {
    if (envChecking || envOperationBusy) return;
    const activeEnvCardKey = selectedEnvCardKey;
    const startedAt = Date.now();
    activeEnvOperationRef.current = { operation: "delete_install", path };
    setEnvOperationProgress({
      operation: "delete_install",
      target: "",
      path,
      phase: "删除多余安装位置",
      command: path,
    });
    setEnvDeleteInstallPath(path);
    setEnvError("");
    clearDeleteConfirmState();
    try {
      const result = await invokeNative<EnvCheckResult>(nativeCommand.deleteEnvInstallation, { path });
      const checkedAt = Date.now();
      setEnvResults(result);
      setEnvCheckedAt(checkedAt);
      setSelectedEnvCardKey(activeEnvCardKey);
      writeEnvCheckSessionSnapshot(result, checkedAt, activeEnvCardKey);
      setEnvCheckRun((run) => run + 1);
      showStatus("已删除多余安装位置。");
    } catch (error) {
      const message = `删除多余安装位置失败：${String(error)}`;
      setEnvError(message);
      showStatus(message);
    } finally {
      const elapsed = Date.now() - startedAt;
      if (elapsed < 500) {
        await new Promise((resolve) => window.setTimeout(resolve, 500 - elapsed));
      }
      activeEnvOperationRef.current = null;
      setEnvOperationProgress(null);
      setEnvDeleteInstallPath(null);
    }
  }

  function handleDeleteEnvInstallationPress(path: string) {
    if (pendingDeleteEnvInstallPath === path && deleteReadyEnvInstallPath === path) {
      void deleteEnvInstallation(path);
      return;
    }
    requestDeleteEnvInstallation(path);
  }

  function requestUninstallEnvInstallation(path: string) {
    clearDeleteConfirmTimers();
    setPendingDeleteModel(null);
    setDeleteReadyModel(null);
    setPendingDeleteEnvConfigPath(null);
    setDeleteReadyEnvConfigPath(null);
    setPendingDeleteEnvInstallPath(null);
    setDeleteReadyEnvInstallPath(null);
    setUninstallReadyEnvPath(null);
    setPendingUninstallEnvPath(path);
    uninstallEnvTimerRef.current = window.setTimeout(() => {
      setUninstallReadyEnvPath(path);
      uninstallEnvTimerRef.current = null;
    }, 300);
    showStatus("请再次确认卸载该应用。");
  }

  async function uninstallEnvInstallation(path: string) {
    if (envChecking || envOperationBusy) return;
    activeEnvOperationRef.current = { operation: "uninstall", path };
    setEnvOperationProgress({ operation: "uninstall", target: "", path, phase: "准备卸载环境", command: "" });
    setEnvUninstallPath(path);
    setEnvError("");
    clearDeleteConfirmState();
    showStatus("正在卸载应用…");
    try {
      const result = await invokeNative<EnvCheckResult>(nativeCommand.uninstallEnvInstallation, { path });
      const checkedAt = Date.now();
      setEnvResults(result);
      setEnvCheckedAt(checkedAt);
      writeEnvCheckSessionSnapshot(result, checkedAt, selectedEnvCardKey);
      showStatus("已卸载应用。", "success");
    } catch (error) {
      if (isEnvOperationStopped(error)) {
        showStatus("停止卸载", "success");
        return;
      }
      const message = `卸载失败：${String(error)}`;
      setEnvError(message);
      showStatus(message);
    } finally {
      activeEnvOperationRef.current = null;
      setEnvOperationProgress(null);
      setEnvUninstallPath(null);
      setEnvCancelingUninstallPath(null);
    }
  }

  function handleUninstallEnvInstallationPress(path: string) {
    const activeUninstallPath = envOperationPathForCancel("uninstall", envUninstallPath);
    if (activeUninstallPath) {
      void cancelEnvOperation("uninstall", "", activeUninstallPath || path);
      return;
    }
    if (pendingUninstallEnvPath === path && uninstallReadyEnvPath === path) {
      void uninstallEnvInstallation(path);
      return;
    }
    requestUninstallEnvInstallation(path);
  }

  async function upgradeEnvInstallation(path: string) {
    if (envChecking || envOperationBusy) return;
    const activeEnvCardKey = selectedEnvCardKey;
    setSelectedEnvCardKey(activeEnvCardKey);
    activeEnvOperationRef.current = { operation: "upgrade", path };
    setEnvOperationProgress({ operation: "upgrade", target: "", path, phase: "准备升级环境", command: "" });
    setEnvUpgradePath(path);
    setEnvError("");
    clearDeleteConfirmState();
    showStatus("正在升级到最新版本…");
    try {
      const result = await invokeNative<EnvCheckResult>(nativeCommand.upgradeEnvInstallation, { path });
      const checkedAt = Date.now();
      setEnvResults(result);
      setEnvCheckedAt(checkedAt);
      setSelectedEnvCardKey(activeEnvCardKey);
      writeEnvCheckSessionSnapshot(result, checkedAt, activeEnvCardKey);
      showStatus("已升级到最新版本。", "success");
    } catch (error) {
      if (isEnvOperationStopped(error)) {
        showStatus("停止升级", "success");
        return;
      }
      const message = `升级失败：${String(error)}`;
      setEnvError(message);
      showStatus(message);
    } finally {
      activeEnvOperationRef.current = null;
      setEnvOperationProgress(null);
      setEnvUpgradePath(null);
      setEnvCancelingUpgradePath(null);
    }
  }

  async function installEnvApplication(targetKey: string, cardKey = targetKey) {
    if (envChecking || envOperationBusy) return;
    const activeEnvCardKey = cardKey;
    setSelectedEnvCardKey(activeEnvCardKey);
    activeEnvOperationRef.current = { operation: "install", target: targetKey };
    setEnvOperationProgress({ operation: "install", target: targetKey, path: "", phase: "准备安装环境", command: "" });
    setEnvInstallTargetKey(cardKey);
    setEnvError("");
    clearDeleteConfirmState();
    showStatus("正在安装应用…");
    try {
      const result = await invokeNative<EnvCheckResult>(nativeCommand.installEnvApplication, { target: targetKey, language });
      const checkedAt = Date.now();
      setEnvResults(result);
      setEnvCheckedAt(checkedAt);
      setSelectedEnvCardKey(activeEnvCardKey);
      writeEnvCheckSessionSnapshot(result, checkedAt, activeEnvCardKey);
      showStatus("已安装应用。", "success");
    } catch (error) {
      if (isEnvOperationStopped(error)) {
        showStatus("停止安装", "success");
        return;
      }
      const message = `安装失败：${String(error)}`;
      setEnvError(message);
      showStatus(message);
    } finally {
      activeEnvOperationRef.current = null;
      setEnvOperationProgress(null);
      setEnvInstallTargetKey(null);
      setEnvCancelingInstallTargetKey(null);
    }
  }

  async function cancelEnvOperation(operation: EnvOperationKind, target = "", path = "") {
    if (operation === "install") {
      setEnvCancelingInstallTargetKey(target);
    } else if (operation === "uninstall") {
      setEnvCancelingUninstallPath(path);
    } else if (operation === "upgrade") {
      setEnvCancelingUpgradePath(path);
    }
    try {
      await invokeNative<void>(nativeCommand.cancelEnvOperation, { operation, target, path });
    } catch (error) {
      if (operation === "install") {
        setEnvCancelingInstallTargetKey(null);
      } else if (operation === "uninstall") {
        setEnvCancelingUninstallPath(null);
      } else if (operation === "upgrade") {
        setEnvCancelingUpgradePath(null);
      }
      const message = `停止操作失败：${String(error)}`;
      setEnvError(message);
      showStatus(message);
    }
  }

  function envOperationPathForCancel(operation: EnvOperationKind, fallback: string | null) {
    if (envOperationProgress?.operation === operation && envOperationProgress.path) {
      return envOperationProgress.path;
    }
    return fallback ?? "";
  }

  async function clearEnvOrphanConfigs(targetKey: string, paths: string[]) {
    if (envChecking || envOperationBusy) return;
    if (paths.length === 0) {
      setEnvError("清除无用配置失败：未发现可清除的无用配置文件。");
      return;
    }
    const activeEnvCardKey = selectedEnvCardKey;
    setSelectedEnvCardKey(activeEnvCardKey);
    setEnvClearConfigTargetKey(targetKey);
    setEnvError("");
    clearDeleteConfirmState();
    showStatus("正在清除无用配置…");
    try {
      await invokeNative<void>(nativeCommand.clearEnvOrphanConfigs, { target: targetKey, paths });
      const checkedAt = Date.now();
      setEnvCheckedAt(checkedAt);
      setSelectedEnvCardKey(activeEnvCardKey);
      setEnvResults((result) => {
        if (!result) return result;
        const next = paths.reduce((current, path) => markDeletedEnvConfig(current, path), result);
        writeEnvCheckSessionSnapshot(next, checkedAt, activeEnvCardKey);
        return next;
      });
      showStatus("已清除无用配置。", "success");
    } catch (error) {
      const rawMessage = String(error);
      const detail = rawMessage.includes("clear_env_orphan_configs")
        ? "当前应用后端尚未加载清理命令，请重启 Switch++ 后重试。"
        : rawMessage;
      const message = `清除无用配置失败：${detail}`;
      setEnvError(message);
      showStatus(message);
    } finally {
      setEnvClearConfigTargetKey(null);
    }
  }

  function selectEnvCard(cardKey: string) {
    if (envOperationBusy) return;
    setSelectedEnvCardKey(cardKey);
    if (envResults) {
      writeEnvCheckSessionSnapshot(envResults, envCheckedAt ?? Date.now(), cardKey);
    }
  }

  async function loadState() {
    setBusy(true);
    try {
      const next = await nativeApi.loadAppState();
      setState(next);
      setStateLoadError("");
      void loadCodexProxyStatus();
    } catch (error) {
      setState(null);
      const message = String(error);
      setStateLoadError(message);
      showStatus(`无法读取本地配置：${message}`, "error");
    } finally {
      setBusy(false);
    }
  }

  async function loadCodexProxyStatus() {
    try {
      const next = await nativeApi.codexProxyStatus();
      setCodexProxyStatus(next);
    } catch (error) {
      setCodexProxyStatus(null);
      showStatus(`读取兼容网关状态失败：${String(error)}`, "error");
    }
  }

  async function loadCodexProxyOverview(selectedTarget = resolveGatewaySelectedTarget()) {
    setCodexProxyOverviewError("");
    try {
      const next = await nativeApi.codexProxyOverview(
        selectedTarget,
        codexProxyOverviewRange,
        codexProxyOverviewBucket,
      );
      setCodexProxyOverview(next);
    } catch (error) {
      setCodexProxyOverview(null);
      setCodexProxyOverviewError(`统计图表加载失败：${String(error)}`);
    }
  }

  async function startCodexProxy(targetKey?: ProxyTargetKey) {
    setCodexProxyBusy(true);
    try {
      const proxyTarget = targetKey ?? (isProxyTarget(target) ? target : resolveGatewaySelectedTarget());
      const next = await nativeApi.startCodexProxy(proxyTarget);
      setCodexProxyStatus(next);
      if (proxyTarget === "codex" || proxyTarget === "claude_cli") {
        const refreshed = await nativeApi.loadAppState();
        setState(refreshed);
        if (proxyTarget === "claude_cli") refreshClaudeCliEditFormFromState(refreshed);
        showStatus(`${targetDisplayName(proxyTarget)} 已切换为本地兼容网关。`, "success");
      } else {
        showStatus(`${targetDisplayName(proxyTarget)} 兼容网关已开启。`, "success");
      }
    } catch (error) {
      showStatus(`开启兼容网关失败：${String(error)}`, "error");
    } finally {
      setCodexProxyBusy(false);
    }
  }

  async function stopCodexProxy(targetKey?: ProxyTargetKey) {
    setCodexProxyBusy(true);
    try {
      const proxyTarget = targetKey ?? (isProxyTarget(target) ? target : resolveGatewaySelectedTarget());
      const next = await nativeApi.stopCodexProxy(proxyTarget);
      setCodexProxyStatus(next);
      if (proxyTarget === "codex" || proxyTarget === "claude_cli") {
        const refreshed = await nativeApi.loadAppState();
        setState(refreshed);
        if (proxyTarget === "claude_cli") refreshClaudeCliEditFormFromState(refreshed);
        showStatus(`${targetDisplayName(proxyTarget)} 已切换为厂商连接，兼容网关已关闭。`, "success");
      } else {
        showStatus(`${targetDisplayName(proxyTarget)} 兼容网关已关闭。`, "success");
      }
    } catch (error) {
      showStatus(`关闭兼容网关失败：${String(error)}`, "error");
    } finally {
      setCodexProxyBusy(false);
    }
  }

  async function toggleProfileGateway(profileId: string, enabled: boolean) {
    if (!state || !isProxyTarget(target)) return;
    if (state.applied[target] !== profileId) {
      showStatus("请先应用此配置，再开启兼容网关。", "error");
      return;
    }
    if (enabled) {
      await startCodexProxy(target);
    } else {
      await stopCodexProxy(target);
    }
  }

  function codexProxyCallDetailKey(targetKey: ProxyTargetKey, id: number) {
    return `${targetKey}:${id}`;
  }

  async function toggleCodexProxyCallDetail(targetKey: ProxyTargetKey, id: number) {
    const expanded = codexProxyExpandedCallId === id;
    setCodexProxyExpandedCallId(expanded ? null : id);
    if (expanded) return;

    const detailKey = codexProxyCallDetailKey(targetKey, id);
    if (codexProxyCallDetails[detailKey]) return;

    try {
      const detail = await nativeApi.codexProxyCallDetail(targetKey, id);
      setCodexProxyCallDetails((details) => ({
        ...details,
        [detailKey]: detail,
      }));
    } catch (error) {
      showStatus(`读取兼容网关调用详情失败：${String(error)}`, "error");
    }
  }

  async function applyProfile(profileId: string, applyTarget: TargetKey = target) {
    if (!state || currentTargetMeta.disabled) return;
    if (!supportsNativeApply(applyTarget)) {
      showStatus(`${targetDisplayName(applyTarget)} 当前暂未支持写入客户端配置。`, "error");
      return;
    }
    setBusy(true);
    try {
      const stateForApply = isCodexTarget(applyTarget)
        ? state
        : {
            ...state,
            [applyTarget]: (state[applyTarget] as GatewayProfile[]).map((profile) =>
              profile.id === profileId
                ? normalizeGatewayProfileForApply(profile, applyTarget as GatewayTargetKey)
                : profile,
            ),
          };
      const applied = await nativeApi.applyTargetProfile(applyTarget, profileId, stateForApply);
      setState(applied);
      void loadCodexProxyStatus();
      showStatus(`${targetDisplayName(applyTarget)} 配置已写入磁盘，重启 ${targetDisplayName(applyTarget)} 后生效。`, "success");
    } catch (error) {
      showStatus(`应用失败：${String(error)}`, "error");
    } finally {
      setBusy(false);
    }
  }

  async function applyProfileToClientWithoutExit(
    applyTarget: TargetKey,
    profileId: string,
    stateForApply: AppState,
    successMessage: string,
  ) {
    const applied = await nativeApi.applyTargetProfile(applyTarget, profileId, stateForApply);
    setState(applied);
    void loadCodexProxyStatus();
    showStatus(successMessage, "success");
  }

  function clearDeleteConfirmTimers() {
    if (deleteModelTimerRef.current !== null) {
      window.clearTimeout(deleteModelTimerRef.current);
      deleteModelTimerRef.current = null;
    }
    if (deleteEnvConfigTimerRef.current !== null) {
      window.clearTimeout(deleteEnvConfigTimerRef.current);
      deleteEnvConfigTimerRef.current = null;
    }
    if (deleteEnvInstallTimerRef.current !== null) {
      window.clearTimeout(deleteEnvInstallTimerRef.current);
      deleteEnvInstallTimerRef.current = null;
    }
    if (uninstallEnvTimerRef.current !== null) {
      window.clearTimeout(uninstallEnvTimerRef.current);
      uninstallEnvTimerRef.current = null;
    }
  }

  function clearDeleteConfirmState() {
    clearDeleteConfirmTimers();
    setPendingDeleteModel(null);
    setDeleteReadyModel(null);
    setPendingDeleteEnvConfigPath(null);
    setDeleteReadyEnvConfigPath(null);
    setPendingDeleteEnvInstallPath(null);
    setDeleteReadyEnvInstallPath(null);
    setPendingUninstallEnvPath(null);
    setUninstallReadyEnvPath(null);
  }

  async function persistAppState(nextState: AppState, successMessage?: string) {
    setState(nextState);
    setBusy(true);
    try {
      const saved = await nativeApi.saveAppState(nextState);
      setState(saved);
      if (successMessage) showStatus(successMessage, "success");
    } catch (error) {
      showStatus(`保存失败：${String(error)}`, "error");
    } finally {
      setBusy(false);
    }
  }

  async function reorderProfileList(sourceProfileId: string, targetProfileId: string) {
    if (!state) return;
    const currentTargetProfiles: Array<GatewayProfile | CodexProfile> = state[target];
    const nextProfiles = reorderProfilesById(currentTargetProfiles, sourceProfileId, targetProfileId);
    if (nextProfiles === currentTargetProfiles) return;
    clearDeleteConfirmState();
    await persistAppState({ ...state, [target]: nextProfiles });
  }

  const handleProfileDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (busy || !over || active.id === over.id) return;
    await reorderProfileList(String(active.id), String(over.id));
  }, [busy, reorderProfileList]);

  function updateGatewayProfile(profileId: string, patch: Partial<GatewayProfile>) {
    if (!state) return;
    const key = target as GatewayTargetKey;
    const nextProfiles = state[key].map((p) =>
      p.id === profileId ? { ...p, ...patch, updated_at: Date.now() } : p,
    );
    setState({ ...state, [key]: nextProfiles });
  }

  function updateCodexProfile(profileId: string, patch: Partial<CodexProfile>) {
    if (!state) return;
    if (!isCodexTarget(target)) return;
    const key = target;
    setState({
      ...state,
      [key]: state[key].map((p) =>
        p.id === profileId ? { ...p, ...patch, updated_at: Date.now() } : p,
      ),
    });
  }

  function buildEmptyAddFormForTarget(nextTarget: TargetKey) {
    const customFormBase = formFromPreset(customPreset, nextTarget);
    return isCodexTarget(nextTarget)
      ? withCodexTemplates(customFormBase, customPreset)
      : customFormBase;
  }

  function resetAddViewForTarget(nextTarget: TargetKey) {
    const emptyForm = buildEmptyAddFormForTarget(nextTarget);
    setEditingId(null);
    clearDeleteConfirmState();
    setSelectedPreset(customPreset.id);
    setDiscoveredProviderModels([]);
    setModelDiscoveryEndpoint("");
    setAddForm(emptyForm);
    setDirtyConfigJsonText(buildTargetConfigPreview(emptyForm, nextTarget));
    setConfigJsonDirty(false);
    setConfigJsonError("");
    setDesktopConfigDirty(false);
    setAdvancedOptionsOpen(false);
    setDesktopEffectiveConfigOpen(false);
    setShowAddApiKey(false);
    setView("add");
  }

  function openAddView() {
    if (!state || currentTargetMeta.disabled) return;
    resetAddViewForTarget(target);
  }

  function formFromPreset(preset: VendorPreset, targetKey: TargetKey = target): AddForm {
    const model = preset.model_map.main || preset.models[0] || "";
    const compatMode = isCodexTarget(targetKey) ? codexCompatModeForPreset(preset) : claudeCompatModeForPreset(preset);
    const form: AddForm = {
      display_name: preset.id === "custom" ? "" : preset.name,
      website_url: preset.website_url,
      note: preset.note,
      connection_mode: "gateway",
      compat_mode: compatMode,
      base_url: gatewayPresetUpstreamBaseUrl(preset, targetKey),
      api_key: "",
      api_format: vendorPresetApiFormatForTarget(preset, targetKey),
      auth_field: isCodexTarget(targetKey) ? "OPENAI_API_KEY" : vendorPresetAuthFieldForTarget(preset, targetKey),
      use_full_url: preset.use_full_url,
      model,
      auth_json: "",
      config_toml: "",
      hide_think_blocks: true,
      supports_1m_context: true,
      codex_config_options: { ...defaultCodexConfigOptions },
      model_map: targetKey === "claude_desktop" ? claudeOfficialModelMap : preset.model_map,
      provider_model_map: preset.model_map,
      config_options: isCodexTarget(targetKey)
        ? sanitizeConfigOptionsForPreset({ ...defaultGatewayConfigOptions }, preset)
        : withRecommendedGatewayTargetConfigOptions(
            { ...defaultGatewayConfigOptions },
            targetKey,
            preset,
            isClaudeGatewayTarget(targetKey) && preset.id === "anthropic",
          ),
    };
    return isCodexTarget(targetKey)
      ? { ...form, codex_config_options: recommendedCodexConfigOptionsForForm(form, preset) }
      : form;
  }

  function closeAddView() {
    setView("list");
    setEditingId(null);
    setSelectedPreset(null);
    setConfigJsonDirty(false);
    setConfigJsonError("");
    setDesktopConfigDirty(false);
    setDesktopEffectiveConfigOpen(false);
  }

  function switchTargetFromSidebar(nextTarget: TargetKey) {
    setTarget(nextTarget);
    clearDeleteConfirmState();
    setEditingId(null);
    setSelectedPreset(null);
    setConfigJsonDirty(false);
    setConfigJsonError("");
    setDesktopConfigDirty(false);
    setAdvancedOptionsOpen(false);
    setDesktopEffectiveConfigOpen(false);
    setShowAddApiKey(false);
    setView("list");
  }

  function openEditView(profile: GatewayProfile | CodexProfile) {
    if (!state || currentTargetMeta.disabled) return;
    const preset = presetForProfile(profile);
    const nextForm = formFromProfile(profile, preset, target);
    const normalizedForm = target === "claude_desktop"
      ? {
          ...nextForm,
          model_map: claudeOfficialModelMap,
        }
      : nextForm;
    clearDeleteConfirmState();
    setEditingId(profile.id);
    setSelectedPreset(preset?.id ?? null);
    setDiscoveredProviderModels([]);
    setModelDiscoveryEndpoint("");
    setAddForm(normalizedForm);
    setDirtyConfigJsonText(buildTargetConfigPreview(normalizedForm, target));
    setConfigJsonDirty(false);
    setConfigJsonError("");
    setDesktopConfigDirty(false);
    setAdvancedOptionsOpen(false);
    setDesktopEffectiveConfigOpen(false);
    setShowAddApiKey(false);
    setView("add");
  }

  function refreshClaudeCliEditFormFromState(nextState: AppState) {
    if (target !== "claude_cli" || view !== "add" || !editingId) return;
    const profile = nextState.claude_cli.find((item) => item.id === editingId);
    if (!profile) return;

    const preset = presetForProfile(profile);
    const nextForm = formFromProfile(profile, preset, "claude_cli");
    setSelectedPreset(preset?.id ?? null);
    setAddForm(nextForm);
    setDirtyConfigJsonText(buildTargetConfigPreview(nextForm, "claude_cli"));
    setConfigJsonDirty(false);
    setConfigJsonError("");
  }

  function selectPreset(preset: VendorPreset) {
    setSelectedPreset(preset.id);
    setDiscoveredProviderModels([]);
    setModelDiscoveryEndpoint("");

    // In edit mode, only update selected preset, don't reset the form
    if (editingId) return;

    if (isCodexCliTarget(target) && preset.id === "openai-package") {
      const localModel = currentCodexLocalProfile?.model || preset.model_map.main || "";
      const nextForm: AddForm = currentCodexLocalProfile
        ? officialCodexFormFromProfile(currentCodexLocalProfile)
        : {
            display_name: preset.name,
            website_url: preset.website_url,
            note: preset.note,
            connection_mode: "official",
            compat_mode: "direct",
            base_url: "",
            api_key: "",
            api_format: "openai_responses",
            auth_field: "OPENAI_API_KEY",
            use_full_url: false,
            model: localModel,
            auth_json: "",
            config_toml: mergeCodexOfficialModelIntoToml("", localModel),
            hide_think_blocks: false,
            supports_1m_context: false,
            codex_config_options: normalizeCodexConfigOptions({}),
            model_map: defaultModelMap(localModel),
            provider_model_map: defaultModelMap(localModel),
            config_options: { ...defaultGatewayConfigOptions },
          };
      setAddForm(nextForm);
      setDirtyConfigJsonText(buildTargetConfigPreview(nextForm, target));
      setConfigJsonDirty(false);
      setConfigJsonError("");
      setAdvancedOptionsOpen(false);
      setDesktopEffectiveConfigOpen(false);
      return;
    }

    if ((target === "claude_cli" || target === "claude_desktop") && preset.id === "anthropic-package") {
      const model = preset.model_map.main || preset.models[0] || "";
      const nextForm: AddForm = {
        display_name: preset.name,
        website_url: preset.website_url,
        note: preset.note,
        connection_mode: "gateway",
        compat_mode: "direct",
        base_url: "",
        api_key: "",
        api_format: "anthropic",
        auth_field: "ANTHROPIC_AUTH_TOKEN",
        use_full_url: false,
        model,
        auth_json: "",
        config_toml: "",
        hide_think_blocks: true,
        supports_1m_context: true,
        codex_config_options: { ...defaultCodexConfigOptions },
        model_map: target === "claude_desktop" ? claudeOfficialModelMap : preset.model_map,
        provider_model_map: preset.model_map,
        config_options: withRecommendedGatewayConfigOptions({ ...defaultGatewayConfigOptions }, preset),
      };
      setAddForm(nextForm);
      setDirtyConfigJsonText(buildTargetConfigPreview(nextForm, target));
      setConfigJsonDirty(false);
      setConfigJsonError("");
      setAdvancedOptionsOpen(false);
      setDesktopEffectiveConfigOpen(false);
      return;
    }

    const nextFormBase = formFromPreset(preset);
    const nextForm = isCodexTarget(target)
      ? withCodexTemplates({ ...nextFormBase, compat_mode: codexCompatModeForPreset(preset) }, preset)
      : nextFormBase;
    setAddForm(nextForm);
    setDirtyConfigJsonText(buildTargetConfigPreview(nextForm, target));
    setConfigJsonDirty(false);
    setConfigJsonError("");
    setDesktopEffectiveConfigOpen(false);
    if (preset.id === "anthropic") {
      setAdvancedOptionsOpen(false);
    }
  }

  function officialCodexFormFromProfile(profile: CodexProfile): AddForm {
    const model = profile.model || extractTomlAssignment(profile.config_toml, "model") || "gpt-5.5";
    return {
      display_name: profile.display_name,
      website_url: profile.website_url,
      note: profile.note,
      connection_mode: "official",
      compat_mode: (profile.compat_mode as CodexCompatMode) || "direct",
      base_url: "",
      api_key: "",
      api_format: "openai_responses",
      auth_field: "OPENAI_API_KEY",
      use_full_url: false,
      model,
      auth_json: profile.auth_json,
      config_toml: mergeCodexOfficialModelIntoToml(profile.config_toml, model),
      hide_think_blocks: false,
      supports_1m_context: false,
      codex_config_options: normalizeCodexConfigOptions(profile.codex_config_options),
      model_map: defaultModelMap(model),
      provider_model_map: defaultModelMap(model),
      config_options: { ...defaultGatewayConfigOptions },
    };
  }

  async function handleImportOfficialCodexProfileToForm() {
    if (busy) return;
    setBusy(true);
    try {
      const imported = await invokeNative<CodexProfile>(nativeCommand.importOfficialCodexProfile);
      const freshForm = officialCodexFormFromProfile(imported);
      setAddForm(freshForm);
      setDirtyConfigJsonText(buildTargetConfigPreview(freshForm, target));
      setConfigJsonDirty(false);
      setConfigJsonError("");
      showStatus("已同步本机 Codex 官方登录配置。", "success");
    } catch (error) {
      showStatus(`同步官方配置失败：${String(error)}。没有官方账号不影响三方配置使用。`, "error");
    } finally {
      setBusy(false);
    }
  }

  function validateForm(form: AddForm): string | null {
    if ((target === "claude_cli" || target === "claude_desktop") && selectedPreset === "anthropic-package") {
      return null;
    }
    if (!isCodexTarget(target) && !form.base_url.trim() && !form.use_full_url) {
      return "请填写 Base URL。";
    }
    if (isCodexTarget(target) && form.connection_mode !== "official" && !form.base_url.trim()) {
      return "请填写 Base URL。";
    }
    if (isCodexTarget(target) && form.connection_mode !== "official" && !form.api_key.trim()) {
      return "请填写 API Key。";
    }
    if (!form.api_key.trim() && !isCodexTarget(target)) {
      return "请填写 API Key。";
    }
    if (form.api_key.trim() && !isAsciiHeaderValue(form.api_key.trim())) {
      return "API Key 只能包含 ASCII 字符；请填写厂商控制台生成的真实 Key，不要填中文备注。";
    }
    if (target === "claude_desktop" && form.compat_mode === "proxy") {
      const modelMapError = validateProviderModelMap(
        providerModelMapFallback(form, currentSelectedPreset, target),
        form.base_url,
      );
      if (modelMapError) return modelMapError;
    }
    return null;
  }

  async function handleAddConfirm() {
    if (!state) return;
    let formForSubmit = addForm;
    const editingProfile = editingId ? currentProfiles.find((profile) => profile.id === editingId) : undefined;
    const isEditMode = Boolean(editingProfile);
    let nextState = state;
    let submittedProfileId: string | null = null;

    // Validate form
    const validationError = validateForm(addForm);
    if (validationError) {
      showStatus(`配置不完整：${validationError}`, "error");
      return;
    }

    if (!isCodexTarget(target) && configJsonDirty) {
      if (!isClaudeGatewayTarget(target)) {
        showStatus("该目标的配置预览由上方字段生成，请直接修改表单字段。", "error");
        return;
      }
      try {
        const parsedForm = formFromConfigJson(addForm, displayConfigJsonText);
        formForSubmit = {
          ...parsedForm,
          config_options: sanitizeConfigOptionsForPreset(parsedForm.config_options, currentSelectedPreset),
        };
        setConfigJsonError("");
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setConfigJsonError(message);
        showStatus(`配置 JSON 格式错误：${message}`, "error");
        return;
      }
    }
    const parsedValidationError = formForSubmit === addForm ? null : validateForm(formForSubmit);
    if (parsedValidationError) {
      showStatus(`配置不完整：${parsedValidationError}`, "error");
      return;
    }

    const name = formForSubmit.display_name.trim() || `${targetDisplayName(target)} ${Date.now().toString().slice(-4)}`;
    const resolvedDesktopModelMap = target === "claude_desktop" ? claudeOfficialModelMap : formForSubmit.model_map;
    const resolvedProviderModelMap = providerModelMapFallback(formForSubmit, currentSelectedPreset, target);
    const resolvedGatewayUpstreamModel =
      target === "claude_desktop"
        ? (resolvedProviderModelMap.main || formForSubmit.model || formForSubmit.model_map.main)
        : formForSubmit.model_map.main;

    if (isCodexTarget(target)) {
      const key = target;
      const resolvedToml = formForSubmit.connection_mode === "official"
        ? mergeCodexConfigOptionsIntoToml(
            mergeCodexOfficialModelIntoToml(formForSubmit.config_toml, formForSubmit.model),
            normalizeCodexConfigOptions(formForSubmit.codex_config_options),
          )
        : buildCodexConfigTomlTemplate(formForSubmit, currentSelectedPreset);
      const resolvedAuthJson = formForSubmit.connection_mode === "official"
        ? formForSubmit.auth_json
        : buildCodexAuthJsonTemplate(
            formForSubmit.api_key,
            formForSubmit.compat_mode === "proxy",
          );
      const resolvedModel = formForSubmit.connection_mode === "official"
        ? (formForSubmit.model || extractTomlAssignment(resolvedToml, "model") || formForSubmit.model_map.main || "gpt-5.5")
        : (extractTomlAssignment(resolvedToml, "model") || formForSubmit.model || formForSubmit.model_map.main || "gpt-5.5");
      const profileId = isEditMode
        ? editingProfile!.id
        : crypto.randomUUID();
      submittedProfileId = profileId;
      const catalogJson = formForSubmit.connection_mode === "official"
        ? undefined
        : buildCodexModelCatalogPreview(formForSubmit, providerModelCandidates.length > 0 ? providerModelCandidates : undefined);
      const profile: CodexProfile = {
        id: profileId,
        display_name: name,
        website_url: formForSubmit.website_url,
        note: formForSubmit.note,
        connection_mode: formForSubmit.connection_mode,
        compat_mode: formForSubmit.compat_mode,
        api_format: formForSubmit.api_format,
        base_url: formForSubmit.connection_mode === "official" ? "" : (formForSubmit.base_url || "https://api.openai.com/v1"),
        api_key: formForSubmit.connection_mode === "official" ? "" : formForSubmit.api_key,
        model: resolvedModel,
        models: providerModelCandidates.length > 0 ? providerModelCandidates : [resolvedModel],
        auth_json: resolvedAuthJson,
        config_toml: resolvedToml,
        model_catalog_json: catalogJson,
        hide_think_blocks: formForSubmit.connection_mode === "official" ? false : formForSubmit.hide_think_blocks,
        supports_1m_context: formForSubmit.connection_mode === "official" ? false : Boolean(formForSubmit.supports_1m_context),
        codex_config_options: formForSubmit.connection_mode === "official"
          ? normalizeCodexConfigOptions(formForSubmit.codex_config_options)
          : sanitizeCodexConfigOptionsForForm(formForSubmit, currentSelectedPreset),
        updated_at: Date.now(),
      };
      nextState = {
        ...state,
        [key]: isEditMode
          ? state[key].map((item) => (item.id === profile.id ? profile : item))
          : [...state[key], profile],
      };
    } else {
      const key = target as GatewayTargetKey;
      const profileId = isEditMode
        ? editingProfile!.id
        : crypto.randomUUID();
      submittedProfileId = profileId;
      const resolvedConfigOptions = supportsNativeApply(target)
        ? formForSubmit.config_options
        : { ...formForSubmit.config_options, write_general_config: false };
      const profile: GatewayProfile = {
        id: profileId,
        display_name: name,
        website_url: formForSubmit.website_url,
        note: formForSubmit.note,
        base_url: formForSubmit.base_url,
        api_key: formForSubmit.api_key,
        api_format: formForSubmit.api_format,
        auth_field: formForSubmit.auth_field,
        use_full_url: formForSubmit.use_full_url,
        compat_mode: formForSubmit.compat_mode,
        upstream_model: resolvedGatewayUpstreamModel,
        model_map: resolvedDesktopModelMap,
        provider_model_map: resolvedProviderModelMap,
        config_options: resolvedConfigOptions,
        models: buildGatewayModels(
          resolvedDesktopModelMap,
          target === "claude_desktop"
            ? ["claude-opus-4-7", "claude-sonnet-4-6", "claude-haiku-4-5"]
            : selectedPreset
              ? (allVendorPresets.find((p) => p.id === selectedPreset)?.models ?? [])
              : ["claude-opus-4-7", "claude-sonnet-4-6"],
          formForSubmit.supports_1m_context,
        ),
        updated_at: Date.now(),
      };
      nextState = {
        ...state,
        [key]: isEditMode
          ? state[key].map((item) => (item.id === profile.id ? profile : item))
          : [...state[key], profile],
      };
    }

    setView("list");
    setSelectedPreset(null);
    setEditingId(null);
    setConfigJsonDirty(false);
    setConfigJsonError("");

    const shouldReapplyEditedProfile =
      isEditMode
      && state.applied[target] === editingProfile!.id
      && !currentTargetMeta.disabled
      && supportsNativeApply(target);
    if (shouldReapplyEditedProfile) {
      setState(nextState);
      setBusy(true);
      try {
        await applyProfileToClientWithoutExit(
          target,
          editingProfile!.id,
          nextState,
          `${targetDisplayName(target)} 配置已更新，重启 ${targetDisplayName(target)} 后生效。`,
        );
      } catch (error) {
        showStatus(`重新应用失败：${String(error)}`, "error");
      } finally {
        setBusy(false);
      }
      return;
    }

    const shouldApplyNewClientProfile =
      !isEditMode
      && submittedProfileId
      && supportsNativeApply(target)
      && !isClaudeGatewayTarget(target)
      && !isCodexTarget(target)
      && formForSubmit.config_options.write_general_config;
    if (shouldApplyNewClientProfile) {
      setState(nextState);
      setBusy(true);
      try {
        await applyProfileToClientWithoutExit(
          target,
          submittedProfileId,
          nextState,
          `${targetDisplayName(target)} 配置已保存，重启 ${targetDisplayName(target)} 后生效。`,
        );
      } catch (error) {
        await persistAppState(nextState);
        showStatus(`写入失败：${String(error)}`, "error");
      } finally {
        setBusy(false);
      }
      return;
    }

    await persistAppState(nextState, "配置已保存。未应用到客户端。");
  }

  async function duplicateProfile(profileId: string) {
    if (!state) return;
    clearDeleteConfirmState();

    if (isCodexTarget(target)) {
      const key = target;
      const source = state[key].find((profile) => profile.id === profileId);
      if (!source) return;
      const profile: CodexProfile = {
        ...source,
        id: crypto.randomUUID(),
        display_name: `${source.display_name || "未命名厂商"} 副本`,
        updated_at: Date.now(),
      };
      await persistAppState({ ...state, [key]: [...state[key], profile] }, "已复制厂商配置。");
      return;
    }

    const key = target as GatewayTargetKey;
    const source = state[key].find((profile) => profile.id === profileId);
    if (!source) return;
    const profile: GatewayProfile = {
      ...source,
      id: crypto.randomUUID(),
      display_name: `${source.display_name || "未命名厂商"} 副本`,
      model_map: { ...source.model_map },
      provider_model_map: cloneModelMap(source.provider_model_map),
      config_options: { ...source.config_options },
      models: source.models.map((model) => ({ ...model })),
      updated_at: Date.now(),
    };
    await persistAppState({ ...state, [key]: [...state[key], profile] }, "已复制厂商配置。");
  }

  async function handleSyncClaudeCodeSettings() {
    if (busy) return;
    setBusy(true);
    try {
      const raw = await nativeApi.readClaudeCodeSettings();
      const parsedForm = formFromConfigJson(addForm, raw);
      const nextForm = {
        ...parsedForm,
        config_options: sanitizeConfigOptionsForPreset(parsedForm.config_options, currentSelectedPreset),
      };
      setAddForm(nextForm);
      setDirtyConfigJsonText(raw);
      setConfigJsonDirty(true);
      setConfigJsonError("");
      showStatus("已同步本地 Claude Code 配置。", "success");
    } catch (error) {
      showStatus(`同步 Claude Code 配置失败：${String(error)}`, "error");
    } finally {
      setBusy(false);
    }
  }

  async function handleSyncClaudeDesktopConfigFiles() {
    if (busy || !editingId) {
      showStatus("请先保存 Claude Desktop 配置后再同步真实文件。", "error");
      return;
    }
    setBusy(true);
    try {
      const files = await nativeApi.readClaudeDesktopConfigFiles(editingId);
      setDirtyDesktopProfileJsonText(files.profile_json);
      setDirtyDesktopMetaJsonText(files.meta_json);
      setDesktopConfigDirty(true);
      showStatus("已同步本地 Claude Desktop 配置。", "success");
    } catch (error) {
      showStatus(`同步 Claude Desktop 配置失败：${String(error)}`, "error");
    } finally {
      setBusy(false);
    }
  }

  function formWithSelectedProviderModel(form: AddForm, model: string): AddForm {
    const trimmed = model.trim();
    if (!trimmed) return form;
    if (isCodexTarget(target)) {
      return { ...form, model: trimmed };
    }
    if (target === "claude_desktop") {
      const nextProviderMap = {
        ...providerModelMapFallback(form, currentSelectedPreset, target),
        main: trimmed,
      };
      return {
        ...form,
        model: trimmed,
        provider_model_map: nextProviderMap,
      };
    }
    return {
      ...form,
      model: trimmed,
      model_map: {
        ...form.model_map,
        main: trimmed,
      },
    };
  }

  function currentProviderModelValue() {
    if (isCodexTarget(target)) return addForm.model;
    if (target === "claude_desktop") {
      return providerModelMapFallback(addForm, currentSelectedPreset, target).main;
    }
    return addForm.model || addForm.model_map.main;
  }

  function normalizedUrlForCompare(url: string) {
    return url.trim().replace(/\/+$/, "").toLowerCase();
  }

  function currentModelDiscoveryBaseUrl() {
    if (!currentSelectedPreset || currentSelectedPreset.id === "custom") return addForm.base_url;
    const currentBaseUrl = normalizedUrlForCompare(addForm.base_url);
    const presetRuntimeBaseUrl = normalizedUrlForCompare(gatewayPresetUpstreamBaseUrl(currentSelectedPreset, target));
    if (currentBaseUrl && currentBaseUrl !== presetRuntimeBaseUrl) return addForm.base_url;
    return vendorPresetModelDiscoveryBaseUrlForTarget(currentSelectedPreset, target);
  }

  async function handleDiscoverProviderModels() {
    if (modelDiscoveryBusy) return;
    const discoveryBaseUrl = currentModelDiscoveryBaseUrl();
    if (!discoveryBaseUrl.trim()) {
      showStatus("模型发现失败：请先填写请求地址。", "error");
      return;
    }
    if (!addForm.api_key.trim()) {
      showStatus("模型发现失败：请先填写 API Key。", "error");
      return;
    }

    setModelDiscoveryBusy(true);
    setModelDiscoveryEndpoint("");
    try {
      const result = await nativeApi.discoverProviderModels(
        discoveryBaseUrl,
        addForm.api_key,
        addForm.auth_field,
      );
      setDiscoveredProviderModels(result.models);
      setModelDiscoveryEndpoint(result.endpoint);
      const latestModels = filterProviderModelCandidates(result.models, currentSelectedPreset);
      const currentModel = currentProviderModelValue().trim().toLowerCase();
      const shouldUpdateModel =
        Boolean(latestModels[0]) &&
        (!currentModel || !latestModels.some((model) => model.toLowerCase() === currentModel));
      if (shouldUpdateModel) {
        setAddForm((form) => formWithSelectedProviderModel(form, latestModels[0]));
      }
      showStatus(`已发现 ${result.models.length} 个模型。`, "success");
    } catch (error) {
      setDiscoveredProviderModels([]);
      showStatus(`模型发现失败：${String(error)}`, "error");
    } finally {
      setModelDiscoveryBusy(false);
    }
  }

  async function deleteProfile(profileId: string) {
    if (!state) return;
    clearDeleteConfirmState();
    if (isCodexTarget(target)) {
      const key = target;
      const next = state[key].filter((p) => p.id !== profileId);
      if (editingId === profileId) setEditingId(null);
      await persistAppState({ ...state, [key]: next }, "已删除厂商配置。");
    } else {
      const key = target as GatewayTargetKey;
      const next = state[key].filter((p) => p.id !== profileId);
      if (editingId === profileId) setEditingId(null);
      await persistAppState({ ...state, [key]: next }, "已删除厂商配置。");
    }
  }

  function addModel(profileId: string) {
    const profile = currentProfiles.find((p) => p.id === profileId) as GatewayProfile | undefined;
    if (!profile) return;
    updateGatewayProfile(profileId, {
      models: [...profile.models, { name: "", supports_1m: false }],
    });
  }

  function updateModel(profileId: string, index: number, patch: Partial<GatewayModel>) {
    const profile = currentProfiles.find((p) => p.id === profileId) as GatewayProfile | undefined;
    if (!profile) return;
    updateGatewayProfile(profileId, {
      models: profile.models.map((m, i) => (i === index ? { ...m, ...patch } : m)),
    });
  }

  function removeModel(profileId: string, index: number) {
    const profile = currentProfiles.find((p) => p.id === profileId) as GatewayProfile | undefined;
    if (!profile) return;
    setPendingDeleteModel(null);
    setDeleteReadyModel(null);
    updateGatewayProfile(profileId, {
      models: profile.models.filter((_, i) => i !== index),
    });
    showStatus("已删除模型映射。");
  }

  function requestDeleteModel(profileId: string, index: number) {
    clearDeleteConfirmTimers();
    setDeleteReadyModel(null);
    setPendingDeleteModel({ profileId, index });
    deleteModelTimerRef.current = window.setTimeout(() => {
      setDeleteReadyModel({ profileId, index });
      deleteModelTimerRef.current = null;
    }, 300);
    showStatus("请再次确认删除该模型映射。");
  }

  function handleDeleteModelPress(profileId: string, index: number) {
    const isReady =
      pendingDeleteModel?.profileId === profileId &&
      pendingDeleteModel.index === index &&
      deleteReadyModel?.profileId === profileId &&
      deleteReadyModel.index === index;

    if (isReady) {
      removeModel(profileId, index);
      return;
    }
    requestDeleteModel(profileId, index);
  }

  const isGatewayTarget = !isCodexTarget(target);
  const isDesktopTarget = target === "claude_desktop";
  const isGeneratedClientConfigTarget = isGatewayTarget && !isClaudeGatewayTarget(target);
  const canWriteTargetConfig = supportsNativeApply(target);
  const isOfficialAnthropicDirect = isGatewayTarget && currentSelectedPreset?.id === "anthropic";
  const isAnthropicPackageDirect = (target === "claude_cli" || target === "claude_desktop") && currentSelectedPreset?.id === "anthropic-package";
  const isOfficialCodexDirect = isCodexTarget(target) && addForm.connection_mode === "official";
  const desktopFormUsesLocalGateway = isDesktopTarget
    && (
      addForm.compat_mode === "proxy"
      || addForm.api_format === "openai_chat"
      || addForm.api_format === "openai_responses"
      || !isOfficialAnthropicBaseUrl(addForm.base_url)
    );
  const canEditGatewayProtocolFields = selectedPreset === "custom";
  const codexThinkAdvice = getCodexThinkOutputAdvice({
    presetId: currentSelectedPreset?.id,
    presetName: currentSelectedPreset?.name,
    compatMode: addForm.compat_mode,
    apiFormat: addForm.api_format,
    model: addForm.model,
  });
  const visibleConfigOptionItems = configOptionItemsForTarget(target, isOfficialAnthropicDirect);
  const isEditingProfile = view === "add" && Boolean(editingId && currentProfiles.some((profile) => profile.id === editingId));
  const envCheckedAtLabel = formatCheckTime(envCheckedAt);
  const currentEnvCheckPhase =
    envOperationProgress?.operation === "check" ? envOperationProgress.phase : "识别当前系统";
  const currentEnvCheckDetail =
    envOperationProgress?.operation === "check" ? envOperationProgress.command : currentEnvPlatformLabel;
  const codexAuthJsonValue = isOfficialCodexDirect
    ? addForm.auth_json
    : buildCodexAuthJsonTemplate(
        addForm.api_key,
        addForm.compat_mode === "proxy",
      );
  const codexConfigTomlValue = isOfficialCodexDirect
    ? mergeCodexConfigOptionsIntoToml(addForm.config_toml, normalizeCodexConfigOptions(addForm.codex_config_options))
    : buildCodexConfigTomlTemplate(addForm, currentSelectedPreset);
  const targetConfigEditorLabel =
    target === "hermes" || target === "oh_my_pi"
      ? "配置 YAML"
      : target === "openclaw"
        ? "配置 JSON5"
        : "配置 JSON";
  const targetConfigOptionsLabel = isClaudeGatewayTarget(target)
    ? (isOfficialAnthropicDirect ? "Claude Code 选项" : targetConfigEditorLabel)
    : `${targetDisplayName(target)} 官方选项`;
  const targetBaseUrlPlaceholder = isCodexTarget(target)
    ? "https://api.example.com/v1"
    : isClaudeGatewayTarget(target)
      ? "https://api.example.com/anthropic"
      : "https://api.example.com/v1";
  const targetBaseUrlLabel = isCodexTarget(target)
    ? addForm.compat_mode === "proxy"
      ? addForm.api_format === "openai_responses"
        ? "Responses 上游地址"
        : "Chat Completions 上游地址"
      : "Responses 地址"
    : isDesktopTarget
      ? "Claude Desktop 上游地址"
      : addForm.api_format === "anthropic"
        ? "Anthropic 上游地址"
        : addForm.api_format === "openai_responses"
          ? "OpenAI Responses 上游地址"
          : addForm.api_format === "openai_chat"
            ? "OpenAI Chat 上游地址"
            : "请求地址";
  const targetBaseUrlHelp = isCodexTarget(target)
    ? addForm.compat_mode === "proxy"
      ? `该地址只保存为 Switch++ 上游地址；Codex 只读取本地网关 ${CODEX_LOCAL_PROXY_BASE_URL} 和专用 provider。`
      : "该地址会写入 Codex 专用 agent-switch provider，不影响官方 openai provider。"
    : isDesktopTarget
      ? desktopFormUsesLocalGateway
        ? "该地址保存为厂商上游地址；Claude Desktop 实际读取本地桌面网关，并由 Switch++ 按下方模型映射转发。"
        : "Anthropic 官方地址可由 Claude Desktop 直接使用；下方 profile 文件仍会记录当前读取字段。"
      : target === "opencode"
        ? "该地址会写入 OpenCode provider；如果已经配置 Oh My OpenAgent，也会同步刷新它的 agents/categories 路由。"
      : target === "oh_my_opencode"
        ? "该地址会同步写入 OpenCode provider；Oh My OpenAgent 自身只保存 agents/categories 路由。"
      : addForm.api_format === "anthropic"
        ? "Claude Code 可直接使用 Anthropic 兼容地址；开启本地网关后可获得记录、预检和统一启停。"
        : "该地址只作为 Switch++ 上游地址保存；Claude Code 会请求本地网关。";
  const targetProtocolSourceUrl =
    currentSelectedPreset && currentSelectedPreset.id !== "custom"
      ? vendorPresetSourceUrlForTarget(currentSelectedPreset, target)
      : "";
  const targetAdvancedProtocolNote = canEditGatewayProtocolFields
    ? "自定义配置不会假定协议兼容性；请按模型厂商与目标 agent 官方文档选择 API 格式、认证字段和 Base URL。"
    : target === "opencode"
      ? "OpenCode 会写入 opencode.json 的 provider/model/small_model；如果已有 Oh My OpenAgent 配置上下文，应用 OpenCode 时会同步刷新 Oh My OpenAgent 路由，避免两个入口各自指向不同模型。"
      : target === "oh_my_opencode"
        ? "Oh My OpenAgent 是 OpenCode 插件增强配置；会写入 oh-my-openagent.json 的 agents/categories 模型路由，并同步 OpenCode provider 配置。两个页面都使用 opencode 启动入口，后应用的配置会成为共同生效配置。"
        : target === "openclaw"
          ? "OpenClaw 会写入 openclaw.json 的 models.providers 与 agents.defaults；预设厂商已内置协议与认证方式，通常只需要填写厂商 API Key 和模型。"
          : target === "hermes"
            ? addForm.api_format === "gemini"
              ? "Hermes 会按官方 Gemini 适配写入 native provider：config.yaml 使用 provider=gemini/base_url=原生 Gemini API，API Key 写入 ~/.hermes/.env；不会写入 custom_providers。"
              : "Hermes 会写入 config.yaml 的 model 与 custom_providers；新会话读取配置文件，当前会话可用 /model 热切。"
            : target === "pi"
              ? "Pi 会写入 models.json 的 custom provider，并更新 settings.json 的默认 provider 与模型。"
              : target === "oh_my_pi"
                ? "Oh My Pi 是独立增强版 CLI，启动入口是 omp；它不是 Pi 的插件包，不需要先安装 Pi。配置会写入 models.yml 的 provider 与 routing。"
                : target === "antigravity"
                  ? "Antigravity 官方暂未公开稳定的第三方模型 Base URL/API Key 写入字段；这里只保存 Switch++ 配置列表。"
                  : isCodexTarget(target)
                    ? addForm.compat_mode === "proxy"
                      ? addForm.api_format === "openai_responses"
                        ? "Codex 三方模式使用专用 provider；本地网关负责记录、认证和统一启停。"
                        : "Codex 三方模式使用专用 provider；本地网关负责适配上游 Chat Completions。"
                      : "Codex 三方厂商连接使用专用 agent-switch provider；官方 openai provider 与 auth.json 保持隔离。"
                    : "Claude Code 仍按 Anthropic Messages 请求本地网关。预设厂商已内置协议与认证方式，通常只需要填写厂商 API Key 和模型。";
  const targetDependencyNotice = target === "oh_my_opencode"
    ? "Oh My OpenAgent 是 OpenCode 插件增强配置；需要先安装 OpenCode CLI，启动入口仍是 opencode。这里单独维护 agents/categories 路由，并会同步写入 OpenCode provider；如果之后在 OpenCode 页面应用另一条配置，会同步刷新 Oh My OpenAgent 路由，以最后一次应用为准。"
    : target === "oh_my_pi"
      ? "Oh My Pi 是独立增强版 CLI，启动入口是 omp；它不是 Pi 的插件包，不需要先安装 Pi。"
      : "";
  const targetAddActionLabel = target === "oh_my_opencode" ? "添加增强配置" : "添加配置";
  const targetEmptyAddText = target === "oh_my_opencode"
    ? "为 Oh My OpenAgent 添加一条增强配置；需要先安装 OpenCode CLI。"
    : `为 ${currentTargetMeta.title} 添加一条厂商配置开始使用。`;
  const targetWriteConfigLabel = target === "oh_my_opencode"
    ? "写入 Oh My OpenAgent 路由并同步 OpenCode provider"
    : canWriteTargetConfig
      ? `写入 ${currentTargetMeta.configFileLabel}`
      : "暂不支持写入该客户端配置";
  function renderAddressVariantSwitch() {
    return (
      <AddressVariantSwitch
        presets={currentAddressVariantPresets}
        selectedPresetId={selectedPreset}
        onSelect={selectPreset}
        disabled={!currentSelectedPreset || isEditingProfile}
      />
    );
  }

  function renderGatewayRequirementIcon(requirement: GatewayRequirement) {
    return <GatewayRequirementIcon requirement={requirement} language={language} />;
  }

  function renderModelDiscoveryField(label = "上游模型") {
    if (isOfficialCodexDirect || isAnthropicPackageDirect || isOfficialAnthropicDirect) return null;
    return (
      <ModelDiscoveryField
        label={label}
        value={currentProviderModelValue()}
        apiKeyValue={addForm.api_key}
        modelDiscoveryBusy={modelDiscoveryBusy}
        modelDiscoveryEndpoint={modelDiscoveryEndpoint}
        providerModelCandidates={providerModelCandidates}
        placeholder={currentSelectedPreset?.model_map.main || currentSelectedPreset?.models[0] || "gpt-5.5"}
        onDiscover={() => void handleDiscoverProviderModels()}
        onChange={(nextModel) => setAddForm((form) => formWithSelectedProviderModel(form, nextModel))}
        onSelectCandidate={(model) => setAddForm((form) => formWithSelectedProviderModel(form, model))}
      />
    );
  }

  function renderOfficialCodexModelField() {
    if (!isOfficialCodexDirect) return null;
    const value = addForm.model || addForm.model_map.main || "gpt-5.5";
    const handleModelChange = (nextModel: string) => {
      setAddForm((form) => ({
        ...form,
        model: nextModel,
        config_toml: mergeCodexOfficialModelIntoToml(form.config_toml, nextModel),
        model_map: defaultModelMap(nextModel),
        provider_model_map: defaultModelMap(nextModel),
      }));
    };
    return (
      <OfficialCodexModelField
        value={value}
        placeholder={currentSelectedPreset?.model_map.main || "gpt-5.5"}
        providerModelCandidates={providerModelCandidates}
        onChange={handleModelChange}
        onSelectCandidate={handleModelChange}
      />
    );
  }

  function renderOneMillionContextField() {
    if (isOfficialCodexDirect || isAnthropicPackageDirect || isOfficialAnthropicDirect) return null;
    return (
      <OneMillionContextField
        checked={Boolean(addForm.supports_1m_context)}
        onChange={(nextSupports1m) => {
          setAddForm((form) => ({
            ...form,
            supports_1m_context: nextSupports1m,
          }));
        }}
      />
    );
  }

  function applyRecommendedGatewayTargetOptions() {
    setAddForm((form) => ({
      ...form,
      config_options: {
        ...withRecommendedGatewayTargetConfigOptions(
          form.config_options,
          target,
          currentSelectedPreset,
          isOfficialAnthropicDirect,
        ),
        write_general_config: form.config_options.write_general_config,
      },
    }));
  }

  function resetClaudeOptionsToDefault() {
    setAddForm((form) => ({
      ...form,
      config_options: {
        ...sanitizeConfigOptionsForPreset({ ...defaultGatewayConfigOptions }, currentSelectedPreset),
        write_general_config: form.config_options.write_general_config,
      },
    }));
  }

  function resetGatewayTargetOptionsToDefault() {
    if (isClaudeGatewayTarget(target)) {
      resetClaudeOptionsToDefault();
      return;
    }
    setAddForm((form) => ({
      ...form,
      config_options: {
        ...sanitizeConfigOptionsForTarget(
          { ...defaultGatewayConfigOptions },
          target,
          currentSelectedPreset,
          isOfficialAnthropicDirect,
        ),
        write_general_config: form.config_options.write_general_config,
      },
    }));
  }

  function applyRecommendedCodexOptions() {
    setAddForm((form) => ({
      ...form,
      codex_config_options: recommendedCodexConfigOptionsForForm(form, currentSelectedPreset),
    }));
  }

  function resetCodexOptionsToDefault() {
    setAddForm((form) => ({
      ...form,
      codex_config_options: sanitizeCodexConfigOptionsForForm(
        {
          ...form,
          codex_config_options: normalizeCodexConfigOptions({}),
        },
        currentSelectedPreset,
      ),
    }));
  }

  function renderClaudeConfigOptions(title: string) {
    return (
      <GatewayConfigOptionsPanel
        title={title}
        target={target}
        isOfficialAnthropicDirect={isOfficialAnthropicDirect}
        visibleConfigOptionItems={visibleConfigOptionItems}
        currentSelectedPreset={currentSelectedPreset}
        configOptions={addForm.config_options}
        onConfigOptionChange={(key, checked) =>
          setAddForm({
            ...addForm,
            config_options: {
              ...addForm.config_options,
              [key]: checked,
            },
          })
        }
        onApplyRecommended={applyRecommendedGatewayTargetOptions}
        onResetToDefault={resetGatewayTargetOptionsToDefault}
      />
    );
  }

  function resolveGatewaySelectedTarget() {
    return resolveGatewaySelectedGatewayTarget(gatewayPageTarget, target, getGatewaySnapshotForApp);
  }

  const getGatewaySnapshotForApp = useCallback((targetKey: ProxyTargetKey = isProxyTarget(target) ? target : "codex") => (
    buildGatewaySnapshot(
      targetKey,
      state,
      codexProxyStatus,
      codexProxyOverview,
      codexProxyOverviewRange,
      codexProxyOverviewBucket,
      codexProxyCallsPage,
      codexProxyCallPageSize,
      codexProxyCallPage,
    )
  ), [state, codexProxyStatus, codexProxyOverview, codexProxyOverviewRange, codexProxyOverviewBucket, codexProxyCallsPage, codexProxyCallPageSize, codexProxyCallPage, target]);

  function renderCodexConfigPanel() {
    if (!isCodexTarget(target)) return null;
    const codexPanelTitle = isOfficialCodexDirect ? "官方登录配置" : "Codex 生效预览";
    return (
      <div className="ccr-advanced-panel">
        <button
          type="button"
          className="ccr-advanced-trigger"
          aria-expanded={codexConfigOpen}
          onClick={() => setCodexConfigOpen((open) => !open)}
        >
          <span className="ccr-advanced-trigger-main">
            <ChevronDownIcon className={codexConfigOpen ? "ccr-advanced-chevron open" : "ccr-advanced-chevron"} />
            <span className="ccr-advanced-title">{codexPanelTitle}</span>
          </span>
          <span className="ccr-advanced-summary">
            {isOfficialCodexDirect ? "可同步本机官方登录态" : "专用 provider"}
          </span>
        </button>
        {codexConfigOpen ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {isOfficialCodexDirect ? (
              <div className="ccr-edit-field">
                <label>auth.json (JSON)</label>
                <div className="ccr-config-json-shell">
                  {isOfficialCodexDirect ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleImportOfficialCodexProfileToForm()}
                      className="ccr-inline-sync-action ccr-config-json-sync"
                    >
                      <RefreshCwIcon className="h-3 w-3" />
                      同步
                    </button>
                  ) : null}
                  <textarea
                    className="ccr-config-json ccr-config-json-editor"
                    spellCheck={false}
                    aria-label="Codex auth.json"
                    value={codexAuthJsonValue}
                    onChange={(e) => {
                      setAddForm({ ...addForm, auth_json: e.currentTarget.value });
                    }}
                  />
                </div>
                <span className="ccr-field-help">
                  官方账号模式会写入 `~/.codex/auth.json`；同步只读取本机 Codex 官方登录产生的认证内容。
                </span>
              </div>
            ) : null}
            <div className="ccr-edit-field">
              <label>{isOfficialCodexDirect ? "config.toml (TOML)" : "生成的三方 provider (TOML)"}</label>
              {!isOfficialCodexDirect ? (
                <div className="ccr-note-box">
                  三方配置的当前模型由 Switch++ 写入的 config.toml 控制；Codex Desktop 的“自定义”模型子菜单可能为空，不作为三方模型切换入口。已安装且已授权的官方插件仍可在 connector 可访问时由三方模型调用。
                </div>
              ) : null}
              <div className="ccr-option-actions">
                <div>
                  <span className="ccr-option-actions-title">Codex 运行选项</span>
                  <span className="ccr-option-actions-note">
                    {isOfficialCodexDirect
                      ? "这些选项会合并进官方 config.toml，并在新 Codex 会话中生效。"
                      : "这些选项会写入三方专用 provider 配置；认证与官方登录态隔离。"}
                  </span>
                </div>
                <div className="ccr-option-actions-buttons">
                  <button type="button" className="ccr-option-action" onClick={applyRecommendedCodexOptions}>
                    应用推荐配置
                  </button>
                  <button type="button" className="ccr-option-action secondary" onClick={resetCodexOptionsToDefault}>
                    恢复默认
                  </button>
                </div>
              </div>
              <div className="ccr-config-options">
                {codexConfigOptionItems.map((option) => {
                  const support = getCodexConfigOptionSupport(option, {
                    model: addForm.model,
                    compatMode: addForm.compat_mode,
                    connectionMode: addForm.connection_mode,
                    presetId: currentSelectedPreset?.id,
                    presetName: currentSelectedPreset?.name,
                  });
                  return (
                    <Tooltip.Root key={option.key} delay={350}>
                      <Tooltip.Trigger className="ccr-option-tooltip-trigger">
                        <label className={support.supported ? "ccr-check" : "ccr-check disabled"}>
                          <input
                            type="checkbox"
                            checked={support.supported && addForm.codex_config_options[option.key]}
                            disabled={!support.supported}
                            onChange={(e) =>
                              setAddForm({
                                ...addForm,
                                codex_config_options: {
                                  ...addForm.codex_config_options,
                                  [option.key]: e.currentTarget.checked,
                                },
                              })
                            }
                          />
                          <span>{option.label}</span>
                        </label>
                      </Tooltip.Trigger>
                      <Tooltip.Content showArrow className="ccr-option-tooltip">
                        <div className="ccr-tooltip-section">
                          <div className="ccr-tooltip-label">说明</div>
                          <div>{option.description}</div>
                        </div>
                        <div className="ccr-tooltip-section">
                          <div className="ccr-tooltip-label">建议</div>
                          <span className={`ccr-tooltip-status ${support.tone}`}>
                            {support.statusText}
                          </span>
                          <div>{support.recommendation}</div>
                        </div>
                        <div className="ccr-tooltip-section">
                          <div className="ccr-tooltip-label">状态</div>
                          <span className={support.supported ? "ccr-tooltip-status ok" : "ccr-tooltip-status muted"}>
                            {support.supported ? "Codex 支持" : "当前配置不建议"}
                          </span>
                        </div>
                        <div className="ccr-tooltip-section">
                          <div className="ccr-tooltip-label">依据</div>
                          <div>{support.detail}</div>
                        </div>
                        <div className="ccr-tooltip-section">
                          <div className="ccr-tooltip-label">来源</div>
                          {support.source.url ? (
                            <a
                              className="ccr-tooltip-source"
                              href={support.source.url}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(event) => event.stopPropagation()}
                              onPointerDown={(event) => event.stopPropagation()}
                            >
                              {support.source.label}
                            </a>
                          ) : (
                            <span>{support.source.label}</span>
                          )}
                        </div>
                      </Tooltip.Content>
                    </Tooltip.Root>
                  );
                })}
              </div>
              <div className="ccr-config-json-shell">
                {isOfficialCodexDirect ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void handleImportOfficialCodexProfileToForm()}
                    className="ccr-inline-sync-action ccr-config-json-sync"
                  >
                    <RefreshCwIcon className="h-3 w-3" />
                    同步
                  </button>
                ) : null}
                <textarea
                  className="ccr-config-json ccr-config-json-editor"
                  spellCheck={false}
                  aria-label="Codex config.toml"
                  value={codexConfigTomlValue}
                  readOnly={!isOfficialCodexDirect}
                  onChange={(e) => {
                    if (!isOfficialCodexDirect) return;
                    const nextToml = e.currentTarget.value;
                    setAddForm({
                      ...addForm,
                      config_toml: nextToml,
                      model: extractTomlAssignment(nextToml, "model") || addForm.model,
                    });
                  }}
                />
              </div>
              <span className="ccr-field-help">
                {isOfficialCodexDirect
                  ? "官方模式会写入 `~/.codex/config.toml` 并按上方选项合并 TOML；切回三方配置时不会修改官方 auth.json。"
                  : addForm.compat_mode === "direct"
                    ? "三方厂商连接会写入 agent-switch provider 和 provider bearer token，不写入官方 auth.json。"
                    : addForm.api_format === "openai_responses"
                      ? `三方网关模式会写入本地网关 ${CODEX_LOCAL_PROXY_BASE_URL}；上游 token 只保存在 Switch++ profile 和网关配置中。`
                      : `三方网关模式会写入本地网关 ${CODEX_LOCAL_PROXY_BASE_URL}；Codex 仍走 Responses，本地网关负责适配到 Chat Completions。`}
              </span>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  const envCheckCards = buildEnvCheckCards(envResults, currentEnvPlatform)
    .sort((left, right) => envCheckCardSortIndex(left.key) - envCheckCardSortIndex(right.key));

  const selectedEnvCard = envCheckCards.find((item) => item.key === selectedEnvCardKey) ?? envCheckCards[0] ?? null;
  const envCardUpgradeInstall = (item: (typeof envCheckCards)[number]) =>
    item.installations.find(
      (record) =>
        record.primary &&
        (record.upgrade_available ||
          (Boolean(record.version) && isEnvVersionNewer(record.latest_version || item.latest, record.version))),
    ) ?? null;
  const envCardHasUpgrade = (item: (typeof envCheckCards)[number]) => Boolean(envCardUpgradeInstall(item));
  const envCardInstallTarget = (item: (typeof envCheckCards)[number]) => {
    if (item.installed !== false) return "";
    switch (item.key) {
      case "claude_cli":
        return "claude_cli";
      case "codex_cli":
        return "codex_cli";
      case "hermes":
      case "opencode":
      case "oh_my_opencode":
      case "openclaw":
      case "pi":
      case "oh_my_pi":
        return item.key;
      default:
        return "";
    }
  };
  const envCardNodeInstallCommand = (packageName: string) =>
    language === "zh"
      ? `npm install -g ${packageName} --registry=https://registry.npmmirror.com`
      : `npm install -g ${packageName} --registry=https://registry.npmjs.org`;
  const envCardBunxInstallCommand = (packageName: string) =>
    `bunx ${packageName} install`;
  const envCardBunInstallCommand = (packageName: string) =>
    `bun install -g ${packageName}`;
  const envCardPipxInstallCommand = (packageName: string) =>
    language === "zh"
      ? `pipx install ${packageName} --index-url https://pypi.tuna.tsinghua.edu.cn/simple`
      : `pipx install ${packageName} --index-url https://pypi.org/simple`;
  const envCardInstallCommand = (item: (typeof envCheckCards)[number]) => {
    switch (envCardInstallTarget(item)) {
      case "claude_cli":
        return envCardNodeInstallCommand("@anthropic-ai/claude-code@latest");
      case "codex_cli":
        return envCardNodeInstallCommand("@openai/codex@latest");
      case "hermes":
        return envCardPipxInstallCommand("hermes-agent");
      case "opencode":
        return envCardNodeInstallCommand("opencode-ai@latest");
      case "oh_my_opencode":
        return envCardBunxInstallCommand("oh-my-openagent");
      case "openclaw":
        return envCardNodeInstallCommand("openclaw@latest");
      case "pi":
        return envCardNodeInstallCommand("@earendil-works/pi-coding-agent@latest");
      case "oh_my_pi":
        return envCardBunInstallCommand("@oh-my-pi/pi-coding-agent@latest");
      default:
        return "";
    }
  };
  const launchArgDisplay = (arg: string) =>
    /\s/.test(arg) ? `"${arg.replace(/"/g, '\\"')}"` : arg;
  const launchCommandDisplay = (item: (typeof envCheckCards)[number]) =>
    item.launchCommand
      ? [item.launchCommand, ...item.launchArgs].map(launchArgDisplay).join(" ")
      : "";
  const launchArgsDisplay = (item: (typeof envCheckCards)[number]) =>
    item.launchCommand && !item.badge.includes("桌面端") && item.launchArgs.length > 0
      ? item.launchArgs.map(launchArgDisplay).join(" ")
      : "";
	  const envCardStatus = (item: (typeof envCheckCards)[number]) => {
	    const hasUpgrade = envCardHasUpgrade(item);
	    if (envChecking && !envResults) return { label: "检查中", chip: "default", dot: "" } as const;
	    if (envChecking && envResults) return { label: "刷新中", chip: "default", dot: "" } as const;
	    if (hasUpgrade) return { label: "可升级", chip: "warning", dot: "upgrade" } as const;
	    if (item.installed) return { label: "已安装", chip: "success", dot: "running" } as const;
	    return { label: "未安装", chip: "warning", dot: "disabled" } as const;
	  };
	  function envOperationToneClass(operation: EnvProgressOperationKind | null) {
	    switch (operation) {
	      case "install":
	        return "ccr-env-operation-install";
	      case "upgrade":
	        return "ccr-env-operation-upgrade";
	      case "uninstall":
	      case "delete_install":
	        return "ccr-env-operation-danger";
	      default:
	        return "ccr-env-operation-install";
	    }
	  }
	  const envCardUninstallPath = (item: (typeof envCheckCards)[number]) =>
    item.installations.find((record) => record.primary)?.path ||
    item.locations.find((record) => record.is_primary && record.exists)?.path ||
    item.installations.find((record) => Boolean(record.path))?.path ||
    item.locations.find((record) => record.exists)?.path ||
    (item.installed ? item.path : "");

  const appStyle = {
    "--sidebar-width": `${sidebarWidth}px`,
  } as CSSProperties & { "--sidebar-width": string };
  const settingsPopoverStyle = {
    "--settings-popover-left": `${settingsPopoverAnchor.left}px`,
    "--settings-popover-bottom": `${settingsPopoverAnchor.bottom}px`,
  } as CSSProperties & { "--settings-popover-left": string; "--settings-popover-bottom": string };
  const appClassName = [
    "ccr-app",
    sidebarCollapsed ? "sidebar-collapsed" : "",
    !sidebarCollapsed && sidebarWidth <= SIDEBAR_TEXT_ONLY_WIDTH ? "sidebar-text-only" : "",
  ].filter(Boolean).join(" ");

  return (
    <main
      className={appClassName}
      data-language={language}
      lang={language}
      style={appStyle}
    >
      <AppSidebar
        appUpdate={appUpdate}
        language={language}
        onEnvView={() => { setView("env"); setEditingId(null); }}
        onGatewayView={() => { setGatewayPageTarget(null); setView("gateway"); setEditingId(null); }}
        onLanguageChange={setLanguage}
        onSettingsBackdropClick={() => setSettingsPopoverOpen(false)}
        onSettingsToggle={toggleSettingsPopover}
        onSidebarResizePointerDown={handleSidebarResizePointerDown}
        onSidebarToggle={toggleSidebarCollapsed}
        onTargetSelect={switchTargetFromSidebar}
        onUpdateClick={openAppUpdateRelease}
        onWindowDrag={startWindowDrag}
        settingsButtonRef={settingsButtonRef}
        settingsPopoverOpen={settingsPopoverOpen}
        settingsPopoverStyle={settingsPopoverStyle}
        sidebarCollapsed={sidebarCollapsed}
        sidebarWidth={sidebarWidth}
        target={target}
        view={view}
      />

      <section
        className={
          view === "gateway"
            ? "ccr-main ccr-main-gateway"
            : view === "env"
              ? "ccr-main ccr-main-env"
              : "ccr-main"
        }
      >
        <div className="ccr-main-window-strip" data-tauri-drag-region onMouseDown={startWindowDrag} />
        {status ? (
          <div
            className={"ccr-status-bar" + (statusType ? " " + statusType : "")}
            onClick={() => clearStatus()}
          >
            {translateUiText(status, language)}
          </div>
        ) : null}

        {view === "add" ? (
          /* ═══ Add vendor view ═══ */
          <div className="ccr-add-view">
            <header className="ccr-add-header">
              <button className="ccr-add-back" onClick={closeAddView} type="button">
                <ArrowLeftIcon className="h-4 w-4" />
                <span>返回</span>
              </button>
              <div className="ccr-add-heading">
                <h2>{isEditingProfile ? "编辑" : "新增"} {currentTargetMeta.title} 配置</h2>
              </div>
            </header>

            {isEditingProfile && currentSelectedPreset ? (
              <section className="ccr-presets-section">
                <div className="ccr-presets-label">当前厂商</div>
                <div className="ccr-presets-grid">
                  <div className="ccr-preset-card active" style={{ cursor: "default" }}>
                    <VendorLogo presetId={currentSelectedPreset.id} className="ccr-preset-logo" />
                    <span className="ccr-preset-name">{currentSelectedPreset.name}</span>
                  </div>
                </div>
              </section>
            ) : (
            <section className="ccr-presets-section">
              <div className="ccr-presets-label">快速选择厂商预设</div>

              <div className="ccr-presets-grid">
                {presetFamilies.map((family) => {
                  const fallbackPreset = firstSelectablePresetForTarget(family.presets, target);
                  if (!fallbackPreset) return null;
                  const activePreset = currentSelectedPreset && presetFamilyKey(currentSelectedPreset) === family.key
                    ? currentSelectedPreset
                    : fallbackPreset;
                  const isActive = currentSelectedPreset ? presetFamilyKey(currentSelectedPreset) === family.key : false;
                  const disabledReason = codexPresetDisabledReason(activePreset, target);
                  const isDisabled = Boolean(disabledReason);
                  const presetCard = (
                    <button
                      key={family.key}
                      aria-disabled={isDisabled}
                      className={`ccr-preset-card${isActive ? " active" : ""}${isDisabled ? " disabled" : ""}`}
                      onClick={(event) => {
                        if (isDisabled) {
                          event.preventDefault();
                          return;
                        }
                        selectPreset(activePreset);
                      }}
                      title={isDisabled ? disabledReason : activePreset.description}
                      type="button"
                    >
                      <VendorLogo presetId={activePreset.id} className="ccr-preset-logo" />
                      <span className="ccr-preset-name">{family.name}</span>
                    </button>
                  );
                  if (!isDisabled) return presetCard;
                  return (
                    <Tooltip.Root key={family.key} delay={350}>
                      <Tooltip.Trigger>{presetCard}</Tooltip.Trigger>
                      <Tooltip.Content showArrow className="ccr-option-tooltip">
                        <div className="ccr-tooltip-label">未确认 Codex 兼容</div>
                        <div>{disabledReason}</div>
                      </Tooltip.Content>
                    </Tooltip.Root>
                  );
                })}
              </div>
            </section>
            )}

            <section className="ccr-add-form">
              {currentPresetFamily && currentPresetModes.length > 1 && !isEditingProfile ? (
                <div className="ccr-scheme-switch-row" aria-label="调用方案">
                  <div className="ccr-address-switch ccr-scheme-switch">
                    {currentPresetModes.map((mode) => {
                      const nextPreset = pickPresetForMode(currentPresetFamily.presets, mode, currentSelectedPreset);
                      if (!nextPreset) return null;
                      const disabledReason = codexPresetDisabledReason(nextPreset, target);
                      const isDisabled = Boolean(disabledReason);

                      const modeButton = (
                        <button
                          key={mode}
                          type="button"
                          aria-disabled={isDisabled}
                          className={`ccr-address-switch-btn ccr-scheme-switch-btn${currentSelectedPreset && presetModeKey(currentSelectedPreset) === mode ? " active" : ""}${isDisabled ? " disabled" : ""}`}
                          onClick={(event) => {
                            if (isDisabled) {
                              event.preventDefault();
                              return;
                            }
                            selectPreset(nextPreset);
                          }}
                          title={isDisabled ? disabledReason : undefined}
                        >
                          {presetModeLabel(mode)}
                        </button>
                      );
                      if (!isDisabled) return modeButton;
                      return (
                        <Tooltip.Root key={mode} delay={350}>
                          <Tooltip.Trigger>{modeButton}</Tooltip.Trigger>
                          <Tooltip.Content showArrow className="ccr-option-tooltip">
                            <div className="ccr-tooltip-label">未确认 Codex 兼容</div>
                            <div>{disabledReason}</div>
                          </Tooltip.Content>
                        </Tooltip.Root>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div className="ccr-edit-field">
                <label>备注</label>
                <Input
                  placeholder="例如：DeepSeek"
                  value={localizedDisplayValue(addForm.display_name, language)}
                  onChange={(e) => setAddForm({ ...addForm, display_name: e.currentTarget.value })}
                />
              </div>

              {!isOfficialCodexDirect ? (
              <div className="ccr-edit-field">
                <label>API Key</label>
                <div className="ccr-secret-field">
                  <Input
                    type={isAnthropicPackageDirect ? "text" : showAddApiKey ? "text" : "password"}
                    placeholder={
                      isAnthropicPackageDirect
                        ? "套餐模式无需填写 API Key，直接保存即可"
                        : selectedPreset
                          ? (allVendorPresets.find(p => p.id === selectedPreset)?.api_key_hint) ?? "输入 API Key"
                          : "输入 API Key"
                    }
                    value={isAnthropicPackageDirect ? "" : addForm.api_key}
                    disabled={isAnthropicPackageDirect}
                    onChange={(e) => setAddForm({ ...addForm, api_key: e.currentTarget.value })}
                  />
                  {!isAnthropicPackageDirect ? (
                    <button
                      className="ccr-secret-toggle"
                      type="button"
                      aria-label={showAddApiKey ? "隐藏 API Key" : "显示 API Key"}
                      onClick={() => setShowAddApiKey((visible) => !visible)}
                    >
                      {showAddApiKey ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </button>
                  ) : null}
                </div>
              </div>
              ) : null}

              {isOfficialCodexDirect ? (
                <>
                  <div className="ccr-note-box">
                    OpenAI 套餐模式使用本机 Codex 官方登录态；这里不填写 API Key 或 Base URL。
                    官方登录配置是可选增强；没有官方账号时仍可只保存和应用三方配置。
                    Free 账号可用 GPT-5.5 但有较低限额；如果最新模型不可用或额度耗尽，可把默认模型切到 gpt-5.4-mini、gpt-5.4、gpt-5.3-codex 或 gpt-5.2 兜底。
                    官方返回的账号、额度或模型不可用错误会透传到 Codex 对话界面，便于区分账号限制和本地网关问题。
                    如需刷新官方登录产生的 auth.json/config.toml，请在下方“官方登录配置”里同步。
                  </div>
                  {renderOfficialCodexModelField()}
                </>
              ) : isAnthropicPackageDirect ? (
                <div className="ccr-note-box">
                  Anthropic 套餐模式会移除 `ANTHROPIC_BASE_URL`、`ANTHROPIC_AUTH_TOKEN` 与桌面端网关字段；Claude Code 写回 `~/.claude/settings.json`，Claude Desktop 写回独立的 `Claude-3p/configLibrary` 官方配置文件。
                </div>
              ) : isDesktopTarget ? (
                <>
                  <div className="ccr-edit-field">
                    <div className="ccr-field-label-row ccr-field-label-row-left">
                      <label>{targetBaseUrlLabel}</label>
                      {renderAddressVariantSwitch()}
                    </div>
                    <Input
                      placeholder="https://api.example.com/anthropic"
                      value={addForm.base_url}
                      onChange={(e) => setAddForm({ ...addForm, base_url: e.currentTarget.value })}
                    />
                    <span className="ccr-field-help">{targetBaseUrlHelp}</span>
                  </div>
                <div className="ccr-note-box">
                  {targetBaseUrlHelp}
                </div>
                </>
              ) : isOfficialAnthropicDirect ? (
                <div className="ccr-note-box">
                  Anthropic API 模式使用默认 API 地址和官方模型能力，不需要配置调用地址、模型映射或网关高级选项。
                </div>
              ) : (
                <>
                  <div className="ccr-edit-field">
                    <div className="ccr-field-label-row ccr-field-label-row-left">
                      <label>{targetBaseUrlLabel}</label>
                      {renderAddressVariantSwitch()}
                    </div>
                    <Input
                      placeholder={targetBaseUrlPlaceholder}
                      value={addForm.base_url}
                      onChange={(e) => setAddForm({ ...addForm, base_url: e.currentTarget.value })}
                    />
                    {targetBaseUrlHelp ? (
                      <span className="ccr-field-help">
                        {targetBaseUrlHelp}
                      </span>
                    ) : null}
                  </div>

                  <div className="ccr-advanced-panel">
                    <button
                      type="button"
                      className={"ccr-advanced-trigger" + (isEditingProfile ? " disabled" : "")}
                      aria-expanded={advancedOptionsOpen}
                      onClick={() => setAdvancedOptionsOpen((open) => !open)}
                    >
                      <span className="ccr-advanced-trigger-main">
                        <ChevronDownIcon className={advancedOptionsOpen ? "ccr-advanced-chevron open" : "ccr-advanced-chevron"} />
                        <span className="ccr-advanced-title">高级选项</span>
                      </span>
                      <span className="ccr-advanced-summary">{canEditGatewayProtocolFields ? "自定义厂商可手动调整" : "厂商预设已内置协议与认证方式"}</span>
                    </button>
                    {advancedOptionsOpen ? (
                      <>
                        <div className="ccr-note-box">
                          <span>{targetAdvancedProtocolNote}</span>
                          {targetProtocolSourceUrl ? (
                            <a
                              className="ccr-helper-link"
                              href={targetProtocolSourceUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              官网依据
                            </a>
                          ) : null}
                        </div>
                        {canEditGatewayProtocolFields ? (
                          <div className="ccr-form-grid two">
                            <div className="ccr-edit-field">
                              <label>上游 API 格式</label>
                              <select
                                className="ccr-select"
                                value={addForm.api_format}
                                onChange={(e) => {
                                  const nextApiFormat = e.currentTarget.value as ApiFormat;
                                  const allowedAuthFields = authFieldsForCustomTarget(target, nextApiFormat);
                                  setAddForm({
                                    ...addForm,
                                    api_format: nextApiFormat,
                                    auth_field: allowedAuthFields.includes(addForm.auth_field)
                                      ? addForm.auth_field
                                      : defaultAuthFieldForApiFormat(nextApiFormat),
                                  });
                                }}
                              >
                                {Object.entries(apiFormatLabels).filter(([value]) => {
                                  if (isCodexTarget(target) && selectedPreset !== "custom") return value === addForm.api_format;
                                  if (canEditGatewayProtocolFields) {
                                    return customApiFormatsForTarget(target).includes(value as ApiFormat);
                                  }
                                  if (isClaudeGatewayTarget(target)) {
                                    return value === addForm.api_format;
                                  }
                                  return true;
                                }).map(([value, label]) => (
                                  <option key={value} value={value}>{label}</option>
                                ))}
                              </select>
                              <span className="ccr-field-help">按模型厂商与目标 agent 官方文档选择</span>
                            </div>
                            <div className="ccr-edit-field">
                              <label>上游认证方式</label>
                              <select
                                className="ccr-select"
                                value={addForm.auth_field}
                                onChange={(e) => setAddForm({ ...addForm, auth_field: e.currentTarget.value as AuthField })}
                              >
                                {Object.entries(authFieldLabels).filter(([value]) => {
                                  if (isCodexTarget(target) && selectedPreset !== "custom") return value === "OPENAI_API_KEY";
                                  if (canEditGatewayProtocolFields) {
                                    return authFieldsForCustomTarget(target, addForm.api_format).includes(value as AuthField);
                                  }
                                  if (isClaudeGatewayTarget(target)) {
                                    return value === "ANTHROPIC_AUTH_TOKEN" || value === "ANTHROPIC_API_KEY";
                                  }
                                  return true;
                                }).map(([value, label]) => (
                                  <option key={value} value={value}>{label}</option>
                                ))}
                              </select>
                              <span className="ccr-field-help">用于 Switch++ 连接上游和模型发现；目标 agent 的配置文件会按自身格式写入。</span>
                            </div>
                          </div>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                </>
              )}

              {isCodexTarget(target) ? (
                isOfficialCodexDirect ? null : (
                  <>
                    {currentSelectedPreset?.codex_support_note ? (
                      <div className="ccr-note-box">
                        <span>{currentSelectedPreset.codex_support_note}</span>
                        {currentSelectedPreset.codex_support_url ? (
                          <a
                            className="ccr-helper-link"
                            href={currentSelectedPreset.codex_support_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            官网依据
                          </a>
                        ) : null}
                      </div>
                    ) : null}
	                    <div className="ccr-note-box">
	                      {addForm.compat_mode === "direct"
	                        ? "应用后会写入 Codex 专用 agent-switch provider；不会改写官方 auth.json，已运行的 Codex 会话需要重启后读取。"
	                        : addForm.api_format === "openai_responses"
	                          ? `Codex 只读取专用 provider 和本地网关 ${CODEX_LOCAL_PROXY_BASE_URL}；上游 Responses token 保存在 Switch++ profile 中，官方登录态保持隔离。`
	                          : `Codex 只读取专用 provider 和本地网关 ${CODEX_LOCAL_PROXY_BASE_URL}；本地网关负责把 Responses 请求适配到上游 Chat Completions。`}
	                    </div>
                    {renderModelDiscoveryField("上游模型")}
                    {renderOneMillionContextField()}
                    {addForm.compat_mode === "proxy" ? (
                      <div className="ccr-config-options">
                        <Tooltip.Root delay={350}>
                          <Tooltip.Trigger className="ccr-option-tooltip-trigger">
                            <label className="ccr-check">
                              <input
                                type="checkbox"
                                checked={addForm.hide_think_blocks}
                                onChange={(e) =>
                                  setAddForm({ ...addForm, hide_think_blocks: e.currentTarget.checked })
                                }
                              />
                              <span>隐藏 think 输出</span>
                            </label>
                          </Tooltip.Trigger>
                          <Tooltip.Content showArrow className="ccr-option-tooltip">
                            <div className="ccr-tooltip-section">
                              <div className="ccr-tooltip-label">建议</div>
                              <span className={`ccr-tooltip-status ${codexThinkAdvice.tone}`}>
                                {codexThinkAdvice.statusText}
                              </span>
                              <div>{codexThinkAdvice.recommendation}</div>
                            </div>
                            <div className="ccr-tooltip-section">
                              <div className="ccr-tooltip-label">说明</div>
                              <div>勾选后，兼容网关会剥离响应里的 &lt;think&gt;...&lt;/think&gt; 内容；不勾选则原样返回。</div>
                            </div>
                            <div className="ccr-tooltip-section">
                              <div className="ccr-tooltip-label">状态</div>
                              <span className={`ccr-tooltip-status ${codexThinkAdvice.tone}`}>
                                {codexThinkAdvice.statusText}
                              </span>
                            </div>
                            <div className="ccr-tooltip-section">
                              <div className="ccr-tooltip-label">依据</div>
                              <div>{codexThinkAdvice.detail}</div>
                            </div>
                            <div className="ccr-tooltip-section">
                              <div className="ccr-tooltip-label">来源</div>
                              {codexThinkAdvice.source.url ? (
                                <a
                                  className="ccr-tooltip-source"
                                  href={codexThinkAdvice.source.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(event) => event.stopPropagation()}
                                  onPointerDown={(event) => event.stopPropagation()}
                                >
                                  {codexThinkAdvice.source.label}
                                </a>
                              ) : (
                                <span>{codexThinkAdvice.source.label}</span>
                              )}
                            </div>
                          </Tooltip.Content>
                        </Tooltip.Root>
                      </div>
                    ) : (
                      <div className="ccr-note-box">
                        厂商连接模式不经过本地网关，隐藏 think 输出不可用。
                      </div>
                    )}
                  </>
                )
              ) : isDesktopTarget ? (
                <div className="ccr-model-map-panel">
                  <div className="ccr-model-map-head">
                    <div>
                      <div className="ccr-advanced-title">模型映射</div>
                      <p>{addForm.compat_mode === "proxy" ? "桌面端发 Claude 官方模型名，本地兼容网关会转到厂商真实模型。" : "桌面端固定使用 Claude 官方模型名称。"}</p>
                    </div>
                  </div>
                  {addForm.compat_mode === "proxy" ? (
                    <div className="ccr-note-box">
                      左侧是 Claude Desktop 实际发送的官方模型名；右侧填写这类请求要转发到的厂商真实模型。
                    </div>
                  ) : null}
                  {addForm.compat_mode === "proxy" ? renderModelDiscoveryField("主上游模型") : null}
                  {addForm.compat_mode === "proxy" ? renderOneMillionContextField() : null}
                  <div className="ccr-model-map-rows">
                    {([
                      ["main", "主模型"],
                      ["opus", "Opus 默认模型"],
                      ["sonnet", "Sonnet 默认模型"],
                      ["haiku", "Haiku 默认模型"],
                    ] as Array<[keyof ModelMap, string]>).map(([key, label]) => {
                      const providerMap = providerModelMapFallback(addForm, currentSelectedPreset, target);
                      return (
                        <div className="ccr-model-map-row" key={key}>
                          <div className="ccr-edit-field">
                            <label>{label}（Claude）</label>
                            <Input
                              value={addForm.model_map[key]}
                              disabled
                              onChange={() => {}}
                            />
                          </div>
                          <span className="ccr-model-map-arrow" aria-hidden="true">
                            <ArrowRightIcon className="ccr-model-map-arrow-icon" weight="bold" />
                          </span>
                          <div className="ccr-edit-field">
                            <label>对应上游模型</label>
                            <Input
                              placeholder={providerModelPlaceholder(key, addForm, currentSelectedPreset)}
                              value={providerMap[key]}
                              onChange={(e) => {
                                const nextProviderMap = {
                                  ...providerModelMapFallback(addForm, currentSelectedPreset, target),
                                  [key]: e.currentTarget.value,
                                };
                                setAddForm({
                                  ...addForm,
                                  provider_model_map: nextProviderMap,
                                  model: key === "main" ? e.currentTarget.value : addForm.model,
                                });
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <ClaudeDesktopEffectiveConfigPanel
                    open={desktopEffectiveConfigOpen}
                    onToggle={() => setDesktopEffectiveConfigOpen((open) => !open)}
                  />
                  <div className="ccr-config-preview-head">
                    <span>Claude Desktop 实际写入文件</span>
                  </div>
                  <div className="ccr-edit-field">
                    <label>{editingId ? `${editingId}.json（当前厂商 profile）` : "profile-id.json（保存后生成）"}</label>
                    <div className="ccr-config-json-shell">
                      <button
                        type="button"
                        disabled={busy || !editingId}
                        onClick={() => void handleSyncClaudeDesktopConfigFiles()}
                        className="ccr-inline-sync-action ccr-config-json-sync"
                      >
                        <RefreshCwIcon className="h-3 w-3" />
                        同步
                      </button>
                      <textarea
                        className="ccr-config-json ccr-config-json-editor"
                        spellCheck={false}
                        aria-label="Claude Desktop profile JSON"
                        value={localizedDisplayValue(displayDesktopProfileJsonText, language)}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="ccr-edit-field">
                    <label>_meta.json（当前应用索引）</label>
                    <textarea
                      className="ccr-config-json ccr-config-json-editor"
                      spellCheck={false}
                      aria-label="Claude Desktop meta JSON"
                      value={localizedDisplayValue(displayDesktopMetaJsonText, language)}
                      readOnly
                    />
                  </div>
                </div>
              ) : (
                <div className="ccr-model-map-panel">
                  {!isOfficialAnthropicDirect && (
                    <>
                      <div className="ccr-model-map-head">
                        <div>
                          <div className="ccr-advanced-title">模型映射</div>
                          <p>如果供应商原生提供 Claude 系列模型，通常无需配置；需要映射到不同模型名时填写。</p>
                        </div>
                      </div>
                      {renderModelDiscoveryField("主模型")}
                      {renderOneMillionContextField()}
                      <div className="ccr-form-grid two">
                        {[
                          ["main", "主模型"],
                          ["opus", "Opus 默认模型"],
                          ["sonnet", "Sonnet 默认模型"],
                          ["haiku", "Haiku 默认模型"],
                        ].map(([key, label]) => (
                          <div className="ccr-edit-field" key={key}>
                            <label>{label}</label>
                            <Input
                              value={addForm.model_map[key as keyof ModelMap]}
                              onChange={(e) =>
	                                setAddForm({
	                                  ...addForm,
	                                  model: key === "main" ? e.currentTarget.value : addForm.model,
	                                  model_map: {
	                                    ...addForm.model_map,
	                                    [key]: e.currentTarget.value,
                                  },
                                })
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  {renderClaudeConfigOptions(targetConfigOptionsLabel)}
                  <div className="ccr-config-json-shell">
                    {target === "claude_cli" ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleSyncClaudeCodeSettings()}
                        className="ccr-inline-sync-action ccr-config-json-sync"
                      >
                        <RefreshCwIcon className="h-3 w-3" />
                        同步
                      </button>
                    ) : null}
                    <textarea
                      className={configJsonError ? "ccr-config-json ccr-config-json-editor invalid" : "ccr-config-json ccr-config-json-editor"}
                      spellCheck={false}
                      aria-label={targetConfigEditorLabel}
                      value={displayConfigJsonText}
                      readOnly={isGeneratedClientConfigTarget}
                      title={isGeneratedClientConfigTarget ? "该目标配置由上方字段生成，请修改表单字段。" : undefined}
                      onChange={(e) => {
                        if (isGeneratedClientConfigTarget) return;
                        setDirtyConfigJsonText(e.currentTarget.value);
                        setConfigJsonDirty(true);
                        setConfigJsonError("");
                      }}
                    />
                    <div className="ccr-config-json-actions">
                      <label className="ccr-inline-switch">
                        <input
                          type="checkbox"
                          checked={canWriteTargetConfig && addForm.config_options.write_general_config}
                          disabled={!canWriteTargetConfig}
                          onChange={(e) =>
                            setAddForm({
                              ...addForm,
                              config_options: {
                                ...addForm.config_options,
                                write_general_config: e.currentTarget.checked,
                              },
                            })
                          }
                        />
                        <span>{targetWriteConfigLabel}</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
              {renderCodexConfigPanel()}
              <div className="ccr-add-actions">
                <Button variant="ghost" className="button" onPress={closeAddView}>
                  取消
                </Button>
                <Button variant="primary" className="button" onPress={handleAddConfirm}>
                  {isEditingProfile ? "保存" : "确认添加"}
                </Button>
              </div>
            </section>
          </div>
        ) : view === "overview" ? (

        /* ═══ Status overview view ═══ */
        <div className="ccr-overview-view">
          <header className="ccr-overview-header">
            <LayoutDashboardIcon className="h-5 w-5" />
            <h2>当前状态</h2>
          </header>
          <div className="ccr-overview-cards">
            {visibleTargetOptions.map((opt) => {
              const list = profilesForTarget(state, opt.key);
              const appliedId = state?.applied[opt.key as TargetKey] ?? null;
              const applied = list.find((item: any) => item.id === appliedId);
              const TargetIcon = targetIconByKey[opt.key];
              return (
                <div key={opt.key} className="ccr-overview-card">
                  <div className="ccr-overview-card-head">
                    <TargetIcon className="h-5 w-5" />
                    <strong>{opt.title}</strong>
                    <Chip size="sm" variant="soft" color={applied ? "success" : "default"}>
                      {applied ? "已配置" : "未配置"}
                    </Chip>
                  </div>
                  <div className="ccr-overview-card-body">
                    {applied ? (
                      <><span className="ccr-overview-vendor">{applied.display_name}</span><span className="ccr-overview-url">{"model" in applied ? applied.model : applied.base_url}</span></>
                    ) : (
                      <span className="ccr-overview-none">暂未配置厂商</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        ) : view === "switch" ? (

        /* ═══ Quick switch view ═══ */
        <div className="ccr-switch-view">
          <header className="ccr-overview-header">
            <SwitchIcon className="h-5 w-5" />
            <h2>快速切换</h2>
          </header>
          {visibleTargetOptions.map((opt) => {
            const list = profilesForTarget(state, opt.key);
            const appliedId = state?.applied[opt.key as TargetKey] ?? null;
            const TargetIcon = targetIconByKey[opt.key];
            return (
              <div key={opt.key} className="ccr-switch-group">
                <div className="ccr-switch-group-head">
                  <TargetIcon className="h-4 w-4" />
                  <span>{opt.title}</span>
                </div>
                <div className="ccr-switch-list">
                  {list.length === 0 && <div className="ccr-switch-empty">暂无配置</div>}
                  {list.map((profile: any) => {
                    const isApplied = profile.id === appliedId;
                    return (
                      <button
                        key={profile.id}
                        className={"ccr-switch-item" + (isApplied ? " active" : "")}
                        onClick={() => applyProfile(profile.id, opt.key)}
                        disabled={!supportsNativeApply(opt.key)}
                        type="button"
                        title={isApplied ? "重新应用：将配置重新写入磁盘" : ""}
                      >
                        <span className="ccr-switch-item-name">{profile.display_name}</span>
                        <span className="ccr-switch-item-url">{"model" in profile ? profile.model : profile.base_url}</span>
                        {isApplied && <Chip size="sm" color="success" variant="soft">当前</Chip>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        ) : view === "gateway" ? (

        /* ═══ Gateway detail view ═══ */
        <GatewayPage
          gatewayPageTarget={gatewayPageTarget}
          onGatewayPageTargetChange={setGatewayPageTarget}
          getSnapshot={getGatewaySnapshotForApp}
          onBack={handleGatewayBack}
          codexProxyBusy={codexProxyBusy}
          codexProxyDetailTab={codexProxyDetailTab}
          onDetailTabChange={setCodexProxyDetailTab}
          codexProxyOverview={codexProxyOverview}
          codexProxyOverviewRange={codexProxyOverviewRange}
          codexProxyOverviewBucket={codexProxyOverviewBucket}
          codexProxyOverviewError={codexProxyOverviewError}
          onLoadOverview={handleGatewayLoadOverview}
          codexProxyCallPage={codexProxyCallPage}
          codexProxyCallPageSize={codexProxyCallPageSize}
          codexProxyCallsPage={codexProxyCallsPage}
          codexProxyExpandedCallId={codexProxyExpandedCallId}
          codexProxyCallDetails={codexProxyCallDetails}
          onStartProxy={handleGatewayStartProxy}
          onStopProxy={handleGatewayStopProxy}
          onCallPageChange={setCodexProxyCallPage}
          onCallPageSizeChange={setCodexProxyCallPageSize}
          onCallsPageChange={setCodexProxyCallsPage}
          onToggleCallDetail={handleGatewayToggleCallDetail}
          callDetailKey={codexProxyCallDetailKey}
          language={language}
          currentTarget={target}
          targetLogo={TargetLogo}
          arrowLeftIcon={<ArrowLeftIcon className="h-4 w-4" />}
          layersIcon={<LayersIcon className="h-5 w-5" />}
          onOverviewRangeChange={setCodexProxyOverviewRange}
          onOverviewBucketChange={setCodexProxyOverviewBucket}
          onExpandedCallIdChange={setCodexProxyExpandedCallId}
        />

        ) : view === "mcp" ? (

        /* ═══ MCP & Skills view ═══ */
        <Suspense fallback={<div className="ccr-loading-center">加载中...</div>}>
          <McpSkillsView />
        </Suspense>

        ) : view === "env" ? (

        /* ═══ Environment check view ═══ */
        <div className="ccr-env-view">
          <header className="ccr-env-header">
            <div className="ccr-env-header-main">
              <span className={"ccr-env-header-icon" + (envChecking ? " spinning" : "")}>
                <ShieldCheckIcon className="h-5 w-5" />
              </span>
              <div>
                <h2>本地环境检查</h2>
	                <p>
	                  {envChecking
	                    ? envResults ? `正在重新检查 ${currentEnvPlatformLabel} 本地环境…` : `正在检查 ${currentEnvPlatformLabel} 本地环境…`
	                    : envCheckedAtLabel
	                      ? `最近检查 ${envCheckedAtLabel} · ${currentEnvPlatformLabel}`
	                      : `按 ${currentEnvPlatformLabel} 检查客户端安装、命令路径和本地配置文件。`}
	                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="primary"
              onPress={runEnvCheck}
              isDisabled={envChecking || envOperationBusy}
              className={"ccr-env-check-btn" + (envChecking ? " checking" : "")}
            >
              {envChecking ? (
                <><span className="ccr-env-spinner-xs" /> 检查中…</>
              ) : envResults ? "重新检查" : "检查"}
            </Button>
          </header>

          {envError ? <div className="ccr-env-error">{envError}</div> : null}

          {envChecking ? (
            <div className="ccr-env-scan-console">
              <div className="ccr-env-scan-console-head">
                <span className="ccr-env-spinner-sm" />
	                <div>
	                  <strong>正在检查本机环境</strong>
	                  <span>通过原生命令读取 {currentEnvPlatformLabel} 安装来源，完成后展示真实安装列表。</span>
	                </div>
              </div>
              <div className="ccr-env-scan-current">
                <span>当前状态</span>
                <code key={`${envCheckRun}-${currentEnvCheckPhase}`} title={currentEnvCheckPhase}>
                  {currentEnvCheckPhase}
                </code>
              </div>
              {currentEnvCheckDetail ? (
                <div className="ccr-env-scan-command">
                  <span>执行命令</span>
                  <code title={currentEnvCheckDetail}>{currentEnvCheckDetail}</code>
                </div>
              ) : null}
            </div>
          ) : null}

          {!envChecking ? (
            <div className="ccr-env-results">
              {!envResults || !selectedEnvCard ? (
                <div className="ccr-env-loading">点击右上角「检查」检测本地环境。</div>
              ) : (
                <>
                  <div className="ccr-gateway-app-tabs ccr-env-app-tabs" role="tablist" aria-label="环境检查应用列表">
                    {envCheckCards.map((item) => {
                      const selected = item.key === selectedEnvCard.key;
                      const status = envCardStatus(item);
                      return (
                        <button
                          key={item.key}
                          id={`ccr-env-tab-${item.key}`}
                          className={selected ? "ccr-gateway-app-tab ccr-env-app-tab active" : "ccr-gateway-app-tab ccr-env-app-tab"}
                          type="button"
                          role="tab"
                          aria-selected={selected}
                          aria-controls={`ccr-env-panel-${item.key}`}
                          aria-label={`${item.title} · ${status.label}`}
                          title={envOperationBusy ? "正在执行应用操作，完成后才能切换" : `${item.title} · ${status.label}`}
                          disabled={envOperationBusy}
                          onClick={() => selectEnvCard(item.key)}
                        >
                          <span className="ccr-gateway-app-tab-head">
                            <span className="ccr-target-logo-frame">
                              <TargetLogo src={item.logo} />
                            </span>
                          </span>
                          <span className={"ccr-gateway-app-tab-status " + status.dot} aria-hidden="true" />
                        </button>
                      );
                    })}
                  </div>

                  {(() => {
                    const item = selectedEnvCard;
                    const visibleLocations = dedupeEnvRecordsByPath(
                      item.locations.filter((record) => record.exists || record.is_primary),
                    );
                    const visibleConfigs = dedupeEnvRecordsByPath(
                      item.configs.filter((record) => record.exists || record.is_primary),
                    );
                    const visibleInstallations = dedupeEnvRecordsByPath(item.installations);
                    const hasUpgrade = envCardHasUpgrade(item);
                    const upgradeInstall = envCardUpgradeInstall(item);
                    const installTarget = envCardInstallTarget(item);
                    const requiresOpenCodeBeforeInstall =
                      item.key === "oh_my_opencode"
                      && !envCheckCards.some((card) => card.key === "opencode" && card.installations.length > 0);
                    const installBlockedReason = requiresOpenCodeBeforeInstall
                      ? "需先安装 OpenCode CLI 后才能安装 Oh My OpenAgent。"
                      : "";
                    const installCommand = envCardInstallCommand(item);
                    const launchCommand = launchCommandDisplay(item);
                    const launchArgs = launchArgsDisplay(item);
                    const uninstallPath = envCardUninstallPath(item);
                    const upgradePath = upgradeInstall?.path ?? "";
                    const activeUninstallPath = envOperationPathForCancel("uninstall", envUninstallPath);
                    const activeUpgradePath = envOperationPathForCancel("upgrade", envUpgradePath);
                    const orphanConfigPaths = visibleConfigs
                      .filter((record) => record.exists && (!record.is_primary || record.kind === "目录"))
                      .map((record) => record.path);
                    const hasOrphanConfigs = item.installed === false && orphanConfigPaths.length > 0;
                    const envUninstallPathBelongsToCurrentEnvCard = Boolean(activeUninstallPath) && (
                      activeUninstallPath === uninstallPath ||
                      visibleInstallations.some((record) => record.path === activeUninstallPath) ||
                      visibleLocations.some((record) => record.path === activeUninstallPath)
                    );
                    const envUpgradePathBelongsToCurrentEnvCard = Boolean(activeUpgradePath) && (
                      activeUpgradePath === upgradePath ||
                      visibleInstallations.some((record) => record.path === activeUpgradePath) ||
                      visibleLocations.some((record) => record.path === activeUpgradePath)
                    );
                    const installGuidance = requiresOpenCodeBeforeInstall
                      ? item.hint
                      : installTarget
                        ? "点击右上角「安装」后会自动刷新当前应用状态。"
                        : item.hint;
                    const isInstallCancelingCurrentEnvCard =
                      Boolean(installTarget) && envCancelingInstallTargetKey === installTarget;
                    const isUninstallCancelingCurrentEnvCard =
                      Boolean(activeUninstallPath) && envCancelingUninstallPath === activeUninstallPath;
                    const isUpgradeCancelingCurrentEnvCard =
                      Boolean(activeUpgradePath) && envCancelingUpgradePath === activeUpgradePath;
                    const isInstallOperationCurrentEnvCard = envInstallTargetKey === item.key;
                    const isUninstallOperationCurrentEnvCard = envUninstallPathBelongsToCurrentEnvCard;
                    const isUpgradeOperationCurrentEnvCard = envUpgradePathBelongsToCurrentEnvCard;
                    const envDeleteInstallPathBelongsToCurrentEnvCard = Boolean(envDeleteInstallPath) && (
                      visibleInstallations.some((record) => record.path === envDeleteInstallPath) ||
                      visibleLocations.some((record) => record.path === envDeleteInstallPath)
                    );
                    const isInstallingCurrentEnvCard =
                      isInstallOperationCurrentEnvCard && !isInstallCancelingCurrentEnvCard;
                    const isUninstallingCurrentEnvCard =
                      isUninstallOperationCurrentEnvCard && !isUninstallCancelingCurrentEnvCard;
                    const isUpgradingCurrentEnvCard =
                      isUpgradeOperationCurrentEnvCard && !isUpgradeCancelingCurrentEnvCard;
                    const isDeletingInstallCurrentEnvCard = envDeleteInstallPathBelongsToCurrentEnvCard;
                    const isOperatingCurrentEnvCard =
                      isInstallOperationCurrentEnvCard || isUninstallOperationCurrentEnvCard || isUpgradeOperationCurrentEnvCard || isDeletingInstallCurrentEnvCard;
                    const activeOperation: EnvProgressOperationKind | null = isDeletingInstallCurrentEnvCard
                      ? "delete_install"
                      : isUninstallOperationCurrentEnvCard
                        ? "uninstall"
                        : isUpgradeOperationCurrentEnvCard
                          ? "upgrade"
                          : isInstallOperationCurrentEnvCard
                            ? "install"
                            : null;
                    const operationToneClass = envOperationToneClass(activeOperation);
                    const activeOperationProgress =
                      activeOperation && envOperationProgress?.operation === activeOperation
                        ? envOperationProgress
                        : null;
                    const currentOperationStatus =
                      isUninstallCancelingCurrentEnvCard
                        ? "停止卸载"
                        : isInstallCancelingCurrentEnvCard
                          ? "停止安装"
                          : isUpgradeCancelingCurrentEnvCard
                            ? "停止升级"
                            : activeOperationProgress?.phase ??
                              (isDeletingInstallCurrentEnvCard
                                ? "删除多余安装位置"
                                : isUninstallingCurrentEnvCard
                                  ? "准备卸载环境"
                                  : isUpgradingCurrentEnvCard
                                    ? "准备升级环境"
	                                    : "准备安装环境");
                    const isUninstallPending = pendingUninstallEnvPath === uninstallPath;
                    const isUninstallReady = uninstallReadyEnvPath === uninstallPath;
                    const installActionDisabled =
                      envChecking ||
                      Boolean(envClearConfigTargetKey) ||
                      Boolean(envDeleteInstallPath) ||
                      Boolean(envUpgradePath) ||
                      Boolean(envUninstallPath) ||
                      isInstallCancelingCurrentEnvCard ||
                      requiresOpenCodeBeforeInstall ||
                      (Boolean(envInstallTargetKey) && envInstallTargetKey !== item.key);
                    const installActionButton = installTarget ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="ccr-env-install-action"
                        isDisabled={installActionDisabled}
                        onPress={() => {
                          if (requiresOpenCodeBeforeInstall) return;
                          if (isInstallingCurrentEnvCard) {
                            void cancelEnvOperation("install", installTarget, "");
                          } else {
                            void installEnvApplication(installTarget, item.key);
                          }
                        }}
                        title={installBlockedReason || "安装应用"}
                      >
                        {isInstallOperationCurrentEnvCard ? (
                          <RefreshCwIcon className="spinning" />
                        ) : (
                          <DownloadIcon className="h-3 w-3" />
                        )}
                        <span>{isInstallCancelingCurrentEnvCard ? "停止中" : isInstallingCurrentEnvCard ? "停止安装" : "安装"}</span>
                      </Button>
                    ) : null;

                    return (
                      <div
                        id={`ccr-env-panel-${item.key}`}
                        className={"ccr-gateway-card ccr-env-detail-card" + (item.installed ? " ok" : " warn")}
                        role="tabpanel"
                        aria-labelledby={`ccr-env-tab-${item.key}`}
                      >
                        <div className="ccr-env-detail-head">
                          <span className="ccr-env-item-icon">
                            <TargetLogo src={item.logo} className="ccr-env-target-logo" />
                          </span>
                          <div className="ccr-env-item-title">
                            <div className="ccr-env-title-line">
                              <strong>{item.title}</strong>
                              {item.installed ? (
                                <span className="ccr-env-subitem-badge ccr-env-title-status">已安装</span>
                              ) : null}
                            </div>
                            <span>{item.badge}</span>
                          </div>
                          <div className="ccr-env-detail-actions">
                            {upgradeInstall ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="ccr-env-upgrade-action"
                                isDisabled={
                                  envChecking ||
                                  Boolean(envInstallTargetKey) ||
                                  Boolean(envClearConfigTargetKey) ||
                                  Boolean(envDeleteInstallPath) ||
                                  Boolean(envUninstallPath) ||
                                  isUpgradeCancelingCurrentEnvCard ||
                                  (Boolean(envUpgradePath) && !isUpgradeOperationCurrentEnvCard)
                                }
                                onPress={() => {
                                  if (isUpgradeOperationCurrentEnvCard && !isUpgradeCancelingCurrentEnvCard) {
                                    void cancelEnvOperation("upgrade", "", activeUpgradePath || upgradeInstall.path);
                                  } else {
                                    void upgradeEnvInstallation(upgradeInstall.path);
                                  }
                                }}
                                title="升级到最新版本"
                              >
                                <RefreshCwIcon className={isUpgradeOperationCurrentEnvCard ? "spinning" : ""} />
                                <span>{isUpgradeCancelingCurrentEnvCard ? "停止中" : isUpgradingCurrentEnvCard ? "停止升级" : "升级"}</span>
                              </Button>
	                            ) : installActionButton ? (
                                installBlockedReason ? (
                                  <Tooltip.Root delay={350}>
                                    <Tooltip.Trigger asChild>
                                      <span className="ccr-env-disabled-install-tooltip">
                                        {installActionButton}
                                      </span>
                                    </Tooltip.Trigger>
                                    <Tooltip.Content showArrow className="ccr-option-tooltip">
                                      {installBlockedReason}
                                    </Tooltip.Content>
                                  </Tooltip.Root>
                                ) : installActionButton
	                            ) : null}
                            {uninstallPath ? (
                              <Button
                                size="sm"
                                variant="danger-soft"
                                className={
                                  isUninstallPending && isUninstallReady
                                    ? "ccr-env-uninstall-action ccr-delete-confirm-action"
                                    : "ccr-env-uninstall-action"
                                }
                                isDisabled={
                                  envChecking ||
                                  Boolean(envInstallTargetKey) ||
                                  Boolean(envClearConfigTargetKey) ||
                                  Boolean(envDeleteInstallPath) ||
                                  Boolean(envUpgradePath) ||
                                  isUninstallCancelingCurrentEnvCard ||
                                  (Boolean(envUninstallPath) && !isUninstallOperationCurrentEnvCard)
                                }
                                onPress={() => handleUninstallEnvInstallationPress(uninstallPath)}
                                onMouseLeave={() => {
                                  if (pendingUninstallEnvPath === uninstallPath) clearDeleteConfirmState();
                                }}
                              >
                                {isUninstallCancelingCurrentEnvCard ? (
                                  <>
                                    <TrashIcon className="h-3 w-3" />
                                    <span>停止中</span>
                                  </>
                                ) : isUninstallOperationCurrentEnvCard ? (
                                  <>
                                    <TrashIcon className="h-3 w-3" />
                                    <span>停止卸载</span>
                                  </>
                                ) : isUninstallPending && isUninstallReady ? (
                                  <>
                                    <TrashIcon className="h-3 w-3" />
                                    <span>确认卸载</span>
                                  </>
                                ) : (
                                  <>
                                    <TrashIcon className="h-3 w-3" />
                                    <span>卸载</span>
                                  </>
                                )}
                              </Button>
                            ) : null}
                          </div>
	                        </div>

	                        <div className="ccr-env-card-body">
	                          {item.installed === false ? (
	                            <div className="ccr-env-empty-state">
	                              <div className="ccr-env-empty-main">
	                                <span className="ccr-env-empty-icon">
	                                  <DownloadIcon className="h-4 w-4" />
                                </span>
                                <div>
                                  <strong>尚未安装 {item.title}</strong>
                                  <span>{installGuidance}</span>
                                </div>
	                              </div>
		                              <div className="ccr-env-empty-grid">
		                                {isInstallOperationCurrentEnvCard ? (
		                                  <div className={`ccr-env-empty-row active ${operationToneClass}`}>
		                                    <span>当前状态</span>
		                                    <code key={`${item.key}-${activeOperation ?? "idle"}-${currentOperationStatus}`}>
		                                      {currentOperationStatus}
	                                    </code>
	                                  </div>
	                                ) : null}
	                                {launchCommand ? (
	                                  <div className="ccr-env-empty-row wide">
	                                    <span>启动命令</span>
                                    <code title={launchCommand}>{launchCommand}</code>
                                  </div>
                                ) : null}
                                {launchArgs ? (
                                  <div className="ccr-env-empty-row">
                                    <span>启动参数</span>
                                    <code title={launchArgs}>{launchArgs}</code>
                                  </div>
                                ) : null}
                                {hasOrphanConfigs ? (
                                  <div className="ccr-env-orphan-config">
                                    <div>
                                      <strong>检测到配置文件或目录</strong>
                                      <span>当前未找到应用命令，但本机仍保留该应用配置。</span>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="danger-soft"
                                      className="ccr-env-clear-config-action"
                                      isDisabled={envOperationBusy}
                                      onPress={() => void clearEnvOrphanConfigs(item.key, orphanConfigPaths)}
                                      title="清除无用配置"
                                    >
                                      <TrashIcon className="h-3 w-3" />
                                      <span>{envClearConfigTargetKey === item.key ? "清除中" : "清除无用配置"}</span>
                                    </Button>
                                  </div>
                                ) : null}
                                {item.latest ? (
                                  <div className="ccr-env-empty-row">
                                    <span>最新</span>
                                    <strong>{item.latest}</strong>
                                  </div>
                                ) : null}
                                {installCommand ? (
                                  <div className="ccr-env-empty-row wide">
                                    <span>推荐安装命令</span>
                                    <code>{installCommand}</code>
                                  </div>
                                ) : null}
                              </div>
                            </div>
	                          ) : (
	                            <div className="ccr-env-detail-grid">
	                              {isOperatingCurrentEnvCard ? (
	                                <div className={`ccr-env-detail-row ccr-env-version-row active ${operationToneClass}`}>
	                                  <span>当前状态</span>
	                                  <strong>{currentOperationStatus}</strong>
	                                </div>
                              ) : null}
	                              <div
	                                className={
	                                  isOperatingCurrentEnvCard
	                                    ? `ccr-env-detail-row ccr-env-version-row active ${operationToneClass}`
	                                    : "ccr-env-detail-row ccr-env-version-row"
	                                }
                              >
                                <span>版本</span>
                                <strong>{item.version || "—"}</strong>
                              </div>
                              {item.latest ? (
                                <div className="ccr-env-detail-row">
                                  <span>最新</span>
                                  <strong className={hasUpgrade ? "upgrade" : "latest"}>
                                    {item.latest}
                                    {upgradeInstall ? (
                                      <span
                                        className="ccr-env-upgrade-badge"
                                        title="当前使用的安装可升级"
                                      >
                                        {isUpgradeOperationCurrentEnvCard ? "升级中" : "可升级"}
                                      </span>
                                    ) : null}
                                  </strong>
                                </div>
                              ) : null}
                              <div className="ccr-env-detail-row">
                                <span>路径</span>
                                <strong title={item.path}>{item.path || "—"}</strong>
                              </div>
                              {launchCommand ? (
                                <div className="ccr-env-detail-row">
                                  <span>启动命令</span>
                                  <strong title={launchCommand}>{launchCommand}</strong>
                                </div>
                              ) : null}
                              {launchArgs ? (
                                <div className="ccr-env-detail-row">
                                  <span>启动参数</span>
                                  <strong title={launchArgs}>{launchArgs}</strong>
                                </div>
                              ) : null}
                              <div className="ccr-env-detail-row">
                                <span>配置</span>
                                <strong className={item.configExists ? "ok" : "muted"}>
                                  {item.configLabel} · {item.configExists ? "已存在" : "未创建"}
                                </strong>
                              </div>
                            </div>
                          )}

                          {visibleInstallations.length > 0 ? (
                            <div className="ccr-env-sublist">
                              <div className="ccr-env-sublist-title">安装位置</div>
                              {visibleInstallations.map((record) => {
                                const isDeletePending = pendingDeleteEnvInstallPath === record.path;
                                const isDeleteReady = deleteReadyEnvInstallPath === record.path;
                                const isDeletingInstallRecord = envDeleteInstallPath === record.path;
                                const recordHasUpgrade =
                                  record.primary &&
                                  (record.upgrade_available ||
                                    (Boolean(record.version) &&
                                      isEnvVersionNewer(record.latest_version || item.latest, record.version)));

                                return (
                                  <div className="ccr-env-subitem" key={record.path}>
                                    <span className={record.primary ? "ccr-env-subitem-dot ok" : "ccr-env-subitem-dot"} />
                                    <div className="ccr-env-subitem-copy">
                                      <div>
                                        <strong>{record.source}</strong>
                                        <span className="ccr-env-subitem-badge">
                                          {record.primary ? "当前使用" : "多余安装"}
                                        </span>
                                        {recordHasUpgrade ? (
                                          <span
                                            className="ccr-env-upgrade-badge ccr-env-subitem-upgrade-action"
                                            title="当前使用的安装可升级"
                                          >
                                            {envUpgradePath === record.path ? "升级中" : "可升级"}
                                          </span>
                                        ) : null}
                                      </div>
                                      <code title={record.path}>{record.path}</code>
                                      {record.version ? <small>{record.version}</small> : null}
                                    </div>
                                    {record.deletable ? (
                                      <Button
                                        size="sm"
                                        variant="danger-soft"
                                        className={
                                          isDeletePending && isDeleteReady
                                            ? "ccr-env-delete-action ccr-delete-confirm-action"
                                            : "ccr-env-delete-action"
                                        }
                                        isDisabled={
                                          envChecking ||
                                          Boolean(envInstallTargetKey) ||
                                          Boolean(envClearConfigTargetKey) ||
                                          Boolean(envUpgradePath) ||
                                          Boolean(envUninstallPath) ||
                                          Boolean(envDeleteInstallPath)
                                        }
                                        onPress={() => handleDeleteEnvInstallationPress(record.path)}
                                        onMouseLeave={() => {
                                          if (pendingDeleteEnvInstallPath === record.path) clearDeleteConfirmState();
                                        }}
                                      >
                                        {isDeletingInstallRecord ? (
                                          <>
                                            <TrashIcon className="h-3 w-3" />
                                            <span>删除中</span>
                                          </>
                                        ) : isDeletePending && isDeleteReady ? (
                                          <span>确定删除</span>
                                        ) : (
                                          <>
                                            <TrashIcon className="h-3 w-3" />
                                            <span>删除</span>
                                          </>
                                        )}
                                      </Button>
                                    ) : null}
                                  </div>
                                );
                              })}
                            </div>
                          ) : null}

                          {visibleLocations.length > 0 ? (
                            <div className="ccr-env-sublist">
                              <div className="ccr-env-sublist-title">应用位置</div>
                              {visibleLocations.map((record) => {
                                const isDeletePending = pendingDeleteEnvInstallPath === record.path;
                                const isDeleteReady = deleteReadyEnvInstallPath === record.path;
                                const isDeletingInstallRecord = envDeleteInstallPath === record.path;

                                return (
                                  <div className="ccr-env-subitem" key={record.path}>
                                    <span className={record.exists ? "ccr-env-subitem-dot ok" : "ccr-env-subitem-dot"} />
                                    <div className="ccr-env-subitem-copy">
                                      <div>
                                        <strong>{record.label}</strong>
                                        <span className="ccr-env-subitem-badge">
                                          {record.is_primary ? "当前使用" : record.exists ? "多余安装" : "未发现"}
                                        </span>
                                      </div>
                                      <code title={record.path}>{record.path}</code>
                                    </div>
                                    {record.deletable ? (
                                      <Button
                                        size="sm"
                                        variant="danger-soft"
                                        className={
                                          isDeletePending && isDeleteReady
                                            ? "ccr-env-delete-action ccr-delete-confirm-action"
                                            : "ccr-env-delete-action"
                                        }
                                        isDisabled={
                                          envChecking ||
                                          Boolean(envInstallTargetKey) ||
                                          Boolean(envClearConfigTargetKey) ||
                                          Boolean(envUpgradePath) ||
                                          Boolean(envUninstallPath) ||
                                          Boolean(envDeleteInstallPath)
                                        }
                                        onPress={() => handleDeleteEnvInstallationPress(record.path)}
                                        onMouseLeave={() => {
                                          if (pendingDeleteEnvInstallPath === record.path) clearDeleteConfirmState();
                                        }}
                                      >
                                        {isDeletingInstallRecord ? (
                                          <>
                                            <TrashIcon className="h-3 w-3" />
                                            <span>删除中</span>
                                          </>
                                        ) : isDeletePending && isDeleteReady ? (
                                          <span>确定删除</span>
                                        ) : (
                                          <>
                                            <TrashIcon className="h-3 w-3" />
                                            <span>删除</span>
                                          </>
                                        )}
                                      </Button>
                                    ) : null}
                                  </div>
                                );
                              })}
                            </div>
                          ) : null}

                          {item.installed !== false && visibleConfigs.length > 0 ? (
                            <div className="ccr-env-sublist">
                              <div className="ccr-env-sublist-title">配置位置</div>
                              {visibleConfigs.map((record) => {
                                const isDeletePending = pendingDeleteEnvConfigPath === record.path;
                                const isDeleteReady = deleteReadyEnvConfigPath === record.path;

                                return (
                                  <div className="ccr-env-subitem" key={record.path}>
                                    <span className={record.exists ? "ccr-env-subitem-dot ok" : "ccr-env-subitem-dot"} />
                                    <div className="ccr-env-subitem-copy">
                                      <div>
                                        <strong>{record.label}</strong>
                                        <span className="ccr-env-subitem-badge">
                                          {envConfigStatusLabel(record)}
                                        </span>
                                      </div>
                                      <code title={record.path}>{record.path}</code>
                                    </div>
                                    {record.deletable ? (
                                      <Button
                                        size="sm"
                                        variant="danger-soft"
                                        className={
                                          isDeletePending && isDeleteReady
                                            ? "ccr-env-delete-action ccr-delete-confirm-action"
                                            : "ccr-env-delete-action"
                                        }
                                        isDisabled={envChecking || envOperationBusy}
                                        onPress={() => handleDeleteEnvConfigPress(record.path)}
                                        onMouseLeave={() => {
                                          if (pendingDeleteEnvConfigPath === record.path) clearDeleteConfirmState();
                                        }}
                                      >
                                        {isDeletePending && isDeleteReady ? (
                                          <span>确定删除</span>
                                        ) : (
                                          <>
                                            <TrashIcon className="h-3 w-3" />
                                            <span>删除</span>
                                          </>
                                        )}
                                      </Button>
                                    ) : null}
                                  </div>
                                );
                              })}
                            </div>
                          ) : null}

                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          ) : null}
        </div>

        ) : (

        /* ═══ Profile list view ═══ */
        <>
        <header className="ccr-main-header">
          <div className="ccr-main-header-left">
            <div className="ccr-main-header-row">
              <span className="ccr-main-header-logo-frame">
                <TargetLogo src={currentTargetMeta.logo} className="ccr-main-header-logo" />
              </span>
              <h1>{currentTargetMeta.title}</h1>
              <Chip size="sm" variant="soft" color="default">{currentTargetMeta.badge}</Chip>
            </div>
            <p className="ccr-main-header-desc">{currentTargetMeta.description}</p>
          </div>
          <div className="ccr-header-addon">
            <button
              className="ccr-target-btn"
              onClick={openAddView}
              disabled={!state || currentTargetMeta.disabled}
              type="button"
            >
              <span className="ccr-target-btn-icon">
                <PlusIcon className="h-4 w-4" />
              </span>
              <span className="ccr-target-btn-label">{targetAddActionLabel}</span>
            </button>
          </div>
        </header>

        <div className="ccr-config-list">
          {stateLoadError && !busy ? (
            <Card variant="default" className="ccr-empty-card">
              <Card.Content>
                <div className="ccr-empty-inner">
                  <div className="ccr-empty-title">无法读取本地配置</div>
                  <div className="ccr-empty-desc">请确认正在使用 Tauri 本地应用运行；当前错误：{stateLoadError}</div>
                </div>
              </Card.Content>
            </Card>
          ) : currentProfiles.length === 0 && !busy ? (
            <Card variant="default" className="ccr-empty-card">
              <Card.Content>
                <div className="ccr-empty-inner">
                  <div className="ccr-empty-icon-lg">
                    <TargetLogo src={currentTargetMeta.logo} className="ccr-empty-logo" />
                  </div>
                  <div>
                    <div className="ccr-empty-title">还没有厂商配置</div>
                    <div className="ccr-empty-desc">
                      {translateUiText(targetEmptyAddText, language)}
                      {targetDependencyNotice ? (
                        <span className="ccr-empty-desc-note">{targetDependencyNotice}</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>
          ) : (
            <DndContext
              sensors={profileDragSensors}
              collisionDetection={closestCenter}
              onDragEnd={handleProfileDragEnd}
            >
              <SortableContext
                items={currentProfiles.map((profile) => profile.id)}
                strategy={verticalListSortingStrategy}
              >
              {currentProfiles.map((profile) => {
                const isApplied = state?.applied[target] === profile.id;
                const isEditing = false;
                const profilePreset = presetForProfile(profile);
                const profileGatewayRequirement = isProxyTarget(target)
	                  ? gatewayRequirementForProfile(target, profile as CodexProfile | GatewayProfile, profilePreset)
                  : null;
                const profileGatewaySnapshot = isProxyTarget(target) ? getGatewaySnapshotForApp(target) : null;
                const showProfileGatewayToggle = Boolean(profileGatewayRequirement && profileGatewayRequirement.level !== "none");
                const profileGatewayRunning = Boolean(isApplied && profileGatewaySnapshot?.running);
                const profileGatewayToggleDisabled = busy || codexProxyBusy || !isApplied;
                const profileGatewayToggleTitle = !isApplied
                  ? "请先应用此配置，再开启兼容网关。"
                  : profileGatewayRunning
                    ? "关闭当前配置的兼容网关"
                    : "开启当前配置的兼容网关";
                const gp = profile as GatewayProfile;

              return (
                <SortableProfileCard
                  key={profile.id}
                  id={profile.id}
                  className={`ccr-config-card${isEditing ? " editing" : ""}${isApplied ? " applied" : ""}`}
                  disabled={busy}
                >
                  {(dragHandle) => (
                  <>
                  {/* ─── Card header ─── */}
                  <div className="ccr-config-head">
                    {dragHandle}
                    <div className="ccr-config-info">
                      <span className="ccr-config-logo-frame" title={profilePreset?.name ?? "自定义厂商"}>
                        <ProfileVendorLogo preset={profilePreset} />
                      </span>
                      <div className="ccr-config-copy">
                        <div className="ccr-config-primary">
                          <span className="ccr-config-name">{profile.display_name || "未命名厂商"}</span>
                          {(() => {
                            const modelName = profileModelName(profile);
                            return modelName ? (
                              <span className="ccr-config-model-badge" title={modelName}>
                                {modelName}
                              </span>
                            ) : null;
                          })()}
                          {isApplied ? (
                            <span className="ccr-config-applied-badge" aria-label="已应用" title="已应用">
                              <AppliedStatusCheckIcon weight="fill" />
                            </span>
                          ) : null}
                        </div>
                        <span className="ccr-config-meta">
                          <span className="ccr-config-meta-text">{profileCompatModeMeta(profile, target)}</span>
                          {profileGatewayRequirement ? (
                            <span className="ccr-config-gateway-advice">
                              {showProfileGatewayToggle ? (
                                <Switch
                                  aria-label={profileGatewayToggleTitle}
                                  className="ccr-config-gateway-toggle"
                                  disabled={profileGatewayToggleDisabled}
                                  isSelected={profileGatewayRunning}
                                  onChange={(checked) => void toggleProfileGateway(profile.id, checked)}
                                  size="sm"
                                  title={profileGatewayToggleTitle}
                                />
                              ) : null}
                              {renderGatewayRequirementIcon(profileGatewayRequirement)}
                            </span>
                          ) : null}
                        </span>
                      </div>
                    </div>

                    {/* Per-profile action buttons — like cc-switch */}
                    <div className="ccr-config-actions">
                      {!isApplied && supportsNativeApply(target) && (
	                        <Button
	                          size="sm"
	                          variant="primary"
	                          className="ccr-apply-action ccr-config-compact-action"
	                          onPress={() => applyProfile(profile.id)}
	                          isDisabled={busy}
	                        >
	                          <CheckIcon className="h-3.5 w-3.5" />
	                          <span>应用</span>
                        </Button>
                      )}
	                      {isApplied && supportsNativeApply(target) && (
		                        <Button
		                          size="sm"
		                          variant="ghost"
		                          className="ccr-config-compact-action"
		                          onPress={() => applyProfile(profile.id)}
		                          isDisabled={busy}
		                          title="重新写入磁盘配置，修复状态不一致"
		                        >
		                          <RefreshCwIcon className="h-3.5 w-3.5" />
		                          <span>重新应用</span>
	                        </Button>
	                      )}
	                      <Button
	                        size="sm"
	                        variant="ghost"
	                        className="ccr-config-compact-action"
	                        onPress={() => openEditView(profile)}
	                        isDisabled={busy}
	                      >
	                        <EditIcon className="h-3.5 w-3.5" />
	                        <span>编辑</span>
                      </Button>
	                      <DropdownMenuPrimitive.Root>
	                        <DropdownMenuPrimitive.Trigger asChild>
	                          <Button
                            size="sm"
                            variant="ghost"
                            className="ccr-config-compact-action ccr-config-more-trigger"
                            aria-label="更多操作"
                            isDisabled={busy}
                          >
                            <DotsThreeIcon className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuPrimitive.Trigger>
                        <DropdownMenuPrimitive.Portal>
                          <DropdownMenuPrimitive.Content
                            align="end"
                            className="ccr-config-more-menu"
                            collisionPadding={12}
	                            sideOffset={8}
	                          >
	                            <DropdownMenuPrimitive.Item
	                              className="ccr-config-more-item"
	                              disabled={busy}
	                              onSelect={() => {
	                                duplicateProfile(profile.id);
	                              }}
	                            >
	                              <CopyIcon className="h-3.5 w-3.5" />
	                              <span>复制</span>
	                            </DropdownMenuPrimitive.Item>
	                            <DropdownMenuPrimitive.Item
	                              className="ccr-config-more-item ccr-config-more-item-danger"
	                              disabled={busy}
	                              onSelect={() => {
	                                void deleteProfile(profile.id);
	                              }}
                            >
                              <TrashIcon className="h-3.5 w-3.5" />
                              <span>删除</span>
                            </DropdownMenuPrimitive.Item>
                          </DropdownMenuPrimitive.Content>
                        </DropdownMenuPrimitive.Portal>
                      </DropdownMenuPrimitive.Root>
                    </div>
                  </div>

                  {/* ─── Expanded edit panel ─── */}
                  {isEditing && (
                    <div className="ccr-config-edit">
                      <div className="ccr-edit-section">
                        {isGatewayTarget ? (
                          <>
                            <div className="ccr-edit-field">
                              <label>备注</label>
                              <Input
                                placeholder="例如：DeepSeek"
                                value={localizedDisplayValue(gp.display_name ?? "", language)}
                                onChange={(e) =>
                                  updateGatewayProfile(profile.id, { display_name: e.currentTarget.value })
                                }
                              />
                            </div>
                            <div className="ccr-edit-field">
                              <label>请求地址</label>
                              <Input
                                placeholder="https://api.example.com/anthropic"
                                value={gp.base_url ?? ""}
                                onChange={(e) =>
                                  updateGatewayProfile(profile.id, { base_url: e.currentTarget.value })
                                }
                              />
                            </div>
                            <div className="ccr-form-grid two">
                              <div className="ccr-edit-field">
                                <label>API 格式</label>
                                <select
                                  className="ccr-select"
                                  value={gp.api_format ?? "anthropic"}
                                  onChange={(e) =>
                                    updateGatewayProfile(profile.id, { api_format: e.currentTarget.value as ApiFormat })
                                  }
                                >
                                  {Object.entries(apiFormatLabels).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="ccr-edit-field">
                                <label>认证字段</label>
                                <select
                                  className="ccr-select"
                                  value={gp.auth_field ?? "ANTHROPIC_AUTH_TOKEN"}
                                  onChange={(e) =>
                                    updateGatewayProfile(profile.id, { auth_field: e.currentTarget.value as AuthField })
                                  }
                                >
                                  {Object.entries(authFieldLabels).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className="ccr-edit-field">
                              <label>API Key</label>
                              <div className="ccr-secret-field">
                                <Input
                                  type={visibleApiKeys[profile.id] ? "text" : "password"}
                                  placeholder="输入厂商 API Key"
                                  value={gp.api_key ?? ""}
                                  onChange={(e) =>
                                    updateGatewayProfile(profile.id, { api_key: e.currentTarget.value })
                                  }
                                />
                                <button
                                  className="ccr-secret-toggle"
                                  type="button"
                                  aria-label={visibleApiKeys[profile.id] ? "隐藏 API Key" : "显示 API Key"}
                                  onClick={() =>
                                    setVisibleApiKeys((current) => ({
                                      ...current,
                                      [profile.id]: !current[profile.id],
                                    }))
                                  }
                                >
                                  {visibleApiKeys[profile.id] ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>
                          </>
                        ) : (() => {
                          const codexProfile = profile as CodexProfile;
                          return (
                            <>
                              <div className="ccr-edit-field">
                                <label>备注</label>
                                <Input
                                  placeholder="例如：OpenAI Compatible"
                                  value={localizedDisplayValue(codexProfile.display_name, language)}
                                  onChange={(e) =>
                                    updateCodexProfile(profile.id, { display_name: e.currentTarget.value })
                                  }
                                />
                              </div>
                              {codexProfile.connection_mode === "official" ? (
                                <div className="ccr-note-box">
                                  官方账号配置使用本机 Codex 登录态；不要在这里填写三方 Base URL 或 API Key。没有官方账号时可跳过此配置，只使用三方 provider。默认模型会写回 config.toml；若 GPT-5.5 不可用，可改为 gpt-5.4-mini、gpt-5.4、gpt-5.3-codex 或 gpt-5.2。
                                </div>
                              ) : (
                                <>
                                  <div className="ccr-edit-field">
                                    <label>{codexProfile.compat_mode === "proxy" ? "上游地址" : "Responses 地址"}</label>
                                    <Input
                                      placeholder="https://your-gateway.example.com/v1"
                                      value={codexProfile.base_url}
                                      onChange={(e) =>
                                        updateCodexProfile(profile.id, { base_url: e.currentTarget.value })
                                      }
                                    />
                                    <span className="ccr-field-help">
                                      Codex 调用方式：{codexCompatModeLabel(codexProfile)}
                                    </span>
                                  </div>
                                  <div className="ccr-edit-field">
                                    <label>API Key</label>
                                    <div className="ccr-secret-field">
                                      <Input
                                        type={visibleApiKeys[profile.id] ? "text" : "password"}
                                        placeholder="输入厂商 API Key"
                                        value={codexProfile.api_key}
                                        onChange={(e) =>
                                          updateCodexProfile(profile.id, { api_key: e.currentTarget.value })
                                        }
                                      />
                                      <button
                                        className="ccr-secret-toggle"
                                        type="button"
                                        aria-label={visibleApiKeys[profile.id] ? "隐藏 API Key" : "显示 API Key"}
                                        onClick={() =>
                                          setVisibleApiKeys((current) => ({
                                            ...current,
                                            [profile.id]: !current[profile.id],
                                          }))
                                        }
                                      >
                                        {visibleApiKeys[profile.id] ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                                      </button>
                                    </div>
                                  </div>
                                </>
                              )}
                              <div className="ccr-edit-field">
                                <label>{codexProfile.connection_mode === "official" ? "默认模型" : "上游模型"}</label>
                                <Input
                                  placeholder="gpt-5.5"
                                  value={codexProfile.model}
                                  onChange={(e) =>
                                    updateCodexProfile(profile.id, {
                                      model: e.currentTarget.value,
                                      config_toml: codexProfile.connection_mode === "official"
                                        ? mergeCodexOfficialModelIntoToml(codexProfile.config_toml, e.currentTarget.value)
                                        : codexProfile.config_toml,
                                    })
                                  }
                                />
                              </div>
                              {codexProfile.compat_mode === "proxy" ? (
                                <div className="ccr-edit-field">
                                  <label>网关输出</label>
                                  <label className="ccr-check">
                                    <input
                                      type="checkbox"
                                      checked={Boolean(codexProfile.hide_think_blocks)}
                                      onChange={(e) =>
                                        updateCodexProfile(profile.id, { hide_think_blocks: e.currentTarget.checked })
                                      }
                                    />
                                    <span>隐藏 think 输出</span>
                                  </label>
                                  <span className="ccr-field-help">
                                    不勾选时兼容网关保留 &lt;think&gt; 内容；勾选后再剥离。
                                  </span>
                                </div>
                              ) : (
                                <div className="ccr-note-box">
                                  仅网关模式可剥离 &lt;think&gt; 内容；厂商连接配置不会经过本地网关。
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>

                      {isGatewayTarget && (
                        <div className="ccr-edit-section">
                          <div className="ccr-edit-section-header">
                            <div className="ccr-edit-section-title">
                              <LayersIcon className="h-3.5 w-3.5" />
                              <span>模型映射</span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onPress={() => addModel(profile.id)}
                            >
                              <PlusIcon className="h-3.5 w-3.5" />
                              <span>添加模型</span>
                            </Button>
                          </div>
                          <div className="ccr-form-grid two">
                            {[
                              ["main", "主模型"],
                              ["opus", "Opus 默认模型"],
                              ["sonnet", "Sonnet 默认模型"],
                              ["haiku", "Haiku 默认模型"],
                            ].map(([key, label]) => (
                              <div className="ccr-edit-field" key={key}>
                                <label>{label}</label>
                                <Input
                                  value={(gp.model_map ?? defaultModelMap(""))[key as keyof ModelMap] ?? ""}
                                  onChange={(e) => {
                                    const nextValue = e.currentTarget.value;
                                    updateGatewayProfile(profile.id, {
                                      model_map: {
                                        ...(gp.model_map ?? defaultModelMap("")),
                                        [key]: nextValue,
                                      },
                                      ...(key === "main" ? { upstream_model: nextValue } : {}),
                                    });
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                          <div className="ccr-model-list">
                            {gp.models.map((model, modelIdx) => {
                              const isModelDeletePending =
                                pendingDeleteModel?.profileId === profile.id &&
                                pendingDeleteModel.index === modelIdx;

                              return (
                                <div key={`${model.name}-${modelIdx}`} className="ccr-model-row">
                                  <Input
                                    aria-label={`模型 ${modelIdx + 1}`}
                                    placeholder="claude-opus-4-7"
                                    value={model.name}
                                    onChange={(e) =>
                                      updateModel(profile.id, modelIdx, { name: e.currentTarget.value })
                                    }
                                  />
                                  <Switch
                                    isSelected={model.supports_1m}
                                    onChange={(checked) =>
                                      updateModel(profile.id, modelIdx, { supports_1m: checked })
                                    }
                                    size="sm"
                                  >
                                    1M
                                  </Switch>
                                  <Button
                                    size="sm"
                                    variant="danger-soft"
                                    className={
                                      isModelDeletePending &&
                                      deleteReadyModel?.profileId === profile.id &&
                                      deleteReadyModel.index === modelIdx
                                        ? "ccr-delete-confirm-action"
                                        : ""
                                    }
                                    onPress={() => handleDeleteModelPress(profile.id, modelIdx)}
                                    onMouseLeave={() => {
                                      if (
                                        pendingDeleteModel?.profileId === profile.id &&
                                        pendingDeleteModel.index === modelIdx
                                      ) {
                                        clearDeleteConfirmState();
                                      }
                                    }}
                                  >
                                    {isModelDeletePending &&
                                    deleteReadyModel?.profileId === profile.id &&
                                    deleteReadyModel.index === modelIdx ? (
                                      <span>确定删除</span>
                                    ) : (
                                      <TrashIcon className="h-3 w-3" />
                                    )}
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  </>
                  )}
                </SortableProfileCard>
              );
            })}
              </SortableContext>
            </DndContext>
          )}
        </div>

        </>
        )}
      </section>
    </main>
  );
}

export default App;
