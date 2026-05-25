import { getCurrentWindow } from "@tauri-apps/api/window";
import { openUrl } from "@tauri-apps/plugin-opener";
import { useEffect, useRef, useState, type MouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import {
  APP_UPDATE_INITIAL_CHECK_DELAY_MS,
  APP_UPDATE_POLL_INTERVAL_MS,
  APP_UPDATE_STARTUP_RETRY_DELAY_MS,
  shouldRunEventAppUpdateCheck,
  shouldRunScheduledAppUpdateCheck,
  shouldShowAppUpdateNotice,
  type AppUpdateCheckMode,
} from "../../appUpdatePolling.ts";
import {
  APP_RELEASES_URL,
  DEV_MOCK_APP_UPDATE_STORAGE_KEY,
  LEGACY_DEV_MOCK_APP_UPDATE_STORAGE_KEYS,
  SIDEBAR_COLLAPSE_WIDTH,
  SIDEBAR_EXPANDED_MIN_WIDTH,
  SIDEBAR_TEXT_ONLY_WIDTH,
} from "../../appConstants.ts";
import type { AppUpdateCheckResult } from "../../appTypes.ts";
import { invokeNative, nativeCommand } from "../../nativeIpc.ts";
import { clampSidebarWidth } from "../../sidebarUtils.ts";

type StateUpdater<T> = T | ((current: T) => T);

type SettingsPopoverAnchor = {
  left: number;
  bottom: number;
};

type UseAppShellChromeOptions = {
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  setSidebarCollapsed: (value: StateUpdater<boolean>) => void;
  setSidebarWidth: (value: StateUpdater<number>) => void;
  setSettingsPopoverOpen: (value: StateUpdater<boolean>) => void;
  setSettingsPopoverAnchor: (value: SettingsPopoverAnchor) => void;
  showStatus: (message: string, type?: "success" | "error" | "") => void;
};

function devMockAppUpdate(): AppUpdateCheckResult | null {
  try {
    if (!import.meta.env.DEV) return null;
    const enabled =
      window.localStorage.getItem(DEV_MOCK_APP_UPDATE_STORAGE_KEY) === "1" ||
      LEGACY_DEV_MOCK_APP_UPDATE_STORAGE_KEYS.some((key) => window.localStorage.getItem(key) === "1");
    if (!enabled) return null;
    return {
      current_version: "1.0.9",
      latest_version: "9.9.9",
      has_update: true,
      release_url: APP_RELEASES_URL,
      checked_at: Date.now(),
      message: "发现新版本",
      error: "",
    };
  } catch {
    return null;
  }
}

function currentDocumentVisibility(): DocumentVisibilityState | "unknown" {
  return typeof document === "undefined" ? "unknown" : document.visibilityState;
}

export function useAppShellChrome({
  sidebarCollapsed,
  sidebarWidth,
  setSidebarCollapsed,
  setSidebarWidth,
  setSettingsPopoverOpen,
  setSettingsPopoverAnchor,
  showStatus,
}: UseAppShellChromeOptions) {
  const settingsButtonRef = useRef<HTMLButtonElement | null>(null);
  const [appUpdate, setAppUpdate] = useState<AppUpdateCheckResult | null>(() => devMockAppUpdate());
  const appUpdateRef = useRef<AppUpdateCheckResult | null>(devMockAppUpdate());
  const appUpdateCheckingRef = useRef(false);
  const lastEventAppUpdateCheckAtRef = useRef<number | null>(null);

  function handleSidebarResizePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (sidebarCollapsed) return;
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = sidebarWidth;

    function updateSidebarWidth(pointerEvent: PointerEvent) {
      const nextWidth = clampSidebarWidth(startWidth + pointerEvent.clientX - startX);
      if (nextWidth <= SIDEBAR_COLLAPSE_WIDTH) {
        setSidebarWidth(SIDEBAR_TEXT_ONLY_WIDTH);
        setSidebarCollapsed(true);
        stopSidebarResize();
        return;
      }
      setSidebarWidth(nextWidth);
    }

    function stopSidebarResize() {
      document.documentElement.classList.remove("ccr-sidebar-resizing");
      window.removeEventListener("pointermove", updateSidebarWidth);
      window.removeEventListener("pointerup", stopSidebarResize);
      window.removeEventListener("pointercancel", stopSidebarResize);
    }

    document.documentElement.classList.add("ccr-sidebar-resizing");
    window.addEventListener("pointermove", updateSidebarWidth);
    window.addEventListener("pointerup", stopSidebarResize);
    window.addEventListener("pointercancel", stopSidebarResize);
  }

  function toggleSidebarCollapsed() {
    setSidebarCollapsed((collapsed) => {
      if (collapsed) {
        setSidebarWidth((width) => Math.max(width, SIDEBAR_EXPANDED_MIN_WIDTH));
      }
      return !collapsed;
    });
  }

  function toggleSettingsPopover() {
    const rect = settingsButtonRef.current?.getBoundingClientRect();
    if (rect) {
      const popoverWidth = 156;
      const margin = 12;
      const left = Math.max(margin, Math.min(window.innerWidth - popoverWidth - margin, rect.right - popoverWidth));
      const bottom = Math.max(margin, window.innerHeight - rect.top + 8);
      setSettingsPopoverAnchor({ left, bottom });
    }
    setSettingsPopoverOpen((open) => !open);
  }

  function startWindowDrag(event: MouseEvent<HTMLElement>) {
    if (event.button !== 0) return;
    event.preventDefault();
    try {
      void getCurrentWindow().startDragging().catch(() => {
        // The Vite-only browser preview does not provide a Tauri window handle.
      });
    } catch {
      // The Vite-only browser preview does not provide a Tauri window handle.
    }
  }

  async function runAppUpdateCheck(mode: AppUpdateCheckMode = "manual") {
    if (appUpdateCheckingRef.current) return;
    if (!shouldRunScheduledAppUpdateCheck(mode, currentDocumentVisibility())) return;
    const devMock = devMockAppUpdate();
    if (devMock) {
      appUpdateRef.current = devMock;
      setAppUpdate(devMock);
      return;
    }
    appUpdateCheckingRef.current = true;
    try {
      const result = await invokeNative<AppUpdateCheckResult>(nativeCommand.checkAppUpdate);
      const previous = appUpdateRef.current;
      appUpdateRef.current = result;
      setAppUpdate(result);
      if (shouldShowAppUpdateNotice(mode, previous, result)) {
        showStatus("发现新版本", "success");
      } else if (mode === "manual" && !result.error) {
        showStatus(result.message, "success");
      }
    } catch (error) {
      const previous = appUpdateRef.current;
      const result = {
        current_version: previous?.current_version ?? "",
        latest_version: previous?.latest_version ?? "",
        has_update: previous?.has_update ?? false,
        release_url: previous?.release_url || APP_RELEASES_URL,
        checked_at: Date.now(),
        message: "暂时无法检查更新",
        error: `版本检查失败：${String(error)}`,
      };
      appUpdateRef.current = result;
      setAppUpdate(result);
    } finally {
      appUpdateCheckingRef.current = false;
    }
  }

  function openAppUpdateRelease(event?: MouseEvent<HTMLElement>) {
    event?.preventDefault();
    const url = appUpdate?.release_url || APP_RELEASES_URL;
    void openUrl(url).catch(() => {
      window.open(url, "_blank", "noopener,noreferrer");
    });
  }

  useEffect(() => {
    const runEventAppUpdateCheck = () => {
      const now = Date.now();
      if (!shouldRunEventAppUpdateCheck(lastEventAppUpdateCheckAtRef.current, now)) return;
      lastEventAppUpdateCheckAtRef.current = now;
      runAppUpdateCheck("poll");
    };
    const startupTimer = window.setTimeout(() => {
      runAppUpdateCheck("startup");
    }, APP_UPDATE_INITIAL_CHECK_DELAY_MS);
    const startupRetryTimer = window.setTimeout(() => {
      runAppUpdateCheck("startup");
    }, APP_UPDATE_STARTUP_RETRY_DELAY_MS);
    const pollTimer = window.setInterval(() => {
      runAppUpdateCheck("poll");
    }, APP_UPDATE_POLL_INTERVAL_MS);
    const handleVisibilityChange = () => {
      if (currentDocumentVisibility() === "visible") {
        runEventAppUpdateCheck();
      }
    };
    const handleWindowFocus = () => {
      runEventAppUpdateCheck();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("online", handleWindowFocus);
    return () => {
      window.clearTimeout(startupTimer);
      window.clearTimeout(startupRetryTimer);
      window.clearInterval(pollTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("online", handleWindowFocus);
    };
  }, []);

  return {
    appUpdate,
    handleSidebarResizePointerDown,
    openAppUpdateRelease,
    runAppUpdateCheck,
    settingsButtonRef,
    startWindowDrag,
    toggleSettingsPopover,
    toggleSidebarCollapsed,
  };
}
