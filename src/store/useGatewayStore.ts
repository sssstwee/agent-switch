import { create } from "zustand";
import type {
  CodexProxyCallRecord,
  CodexProxyCallsPage,
  CodexProxyOverview,
  CodexProxyOverviewBucket,
  CodexProxyOverviewRange,
  CodexProxyStatus,
} from "../appTypes.ts";
import type { ProxyTargetKey } from "../proxyTargets.ts";

export type GatewayDetailTab = "overview" | "basic" | "detail";
export type GatewayCallPageSize = 20 | 50 | 100;

type StateUpdater<T> = T | ((current: T) => T);

type GatewayStore = {
  codexProxyStatus: CodexProxyStatus | null;
  codexProxyCallsPage: CodexProxyCallsPage | null;
  codexProxyOverview: CodexProxyOverview | null;
  codexProxyOverviewRange: CodexProxyOverviewRange;
  codexProxyOverviewBucket: CodexProxyOverviewBucket;
  codexProxyOverviewError: string;
  gatewayPageTarget: ProxyTargetKey | null;
  codexProxyDetailTab: GatewayDetailTab;
  codexProxyCallPage: number;
  codexProxyCallPageSize: GatewayCallPageSize;
  codexProxyExpandedCallId: number | null;
  codexProxyCallDetails: Record<string, CodexProxyCallRecord>;
  codexProxyBusy: boolean;
  setCodexProxyStatus: (value: CodexProxyStatus | null) => void;
  setCodexProxyCallsPage: (value: CodexProxyCallsPage | null) => void;
  setCodexProxyOverview: (value: CodexProxyOverview | null) => void;
  setCodexProxyOverviewRange: (value: CodexProxyOverviewRange) => void;
  setCodexProxyOverviewBucket: (value: CodexProxyOverviewBucket) => void;
  setCodexProxyOverviewError: (value: string) => void;
  setGatewayPageTarget: (value: ProxyTargetKey | null) => void;
  setCodexProxyDetailTab: (value: GatewayDetailTab) => void;
  setCodexProxyCallPage: (value: number) => void;
  setCodexProxyCallPageSize: (value: GatewayCallPageSize) => void;
  setCodexProxyExpandedCallId: (value: number | null) => void;
  setCodexProxyCallDetails: (value: StateUpdater<Record<string, CodexProxyCallRecord>>) => void;
  setCodexProxyBusy: (value: boolean) => void;
  resetGatewayHistoryView: () => void;
};

export const useGatewayStore = create<GatewayStore>((set) => ({
  codexProxyStatus: null,
  codexProxyCallsPage: null,
  codexProxyOverview: null,
  codexProxyOverviewRange: "24h",
  codexProxyOverviewBucket: "hour",
  codexProxyOverviewError: "",
  gatewayPageTarget: null,
  codexProxyDetailTab: "overview",
  codexProxyCallPage: 1,
  codexProxyCallPageSize: 50,
  codexProxyExpandedCallId: null,
  codexProxyCallDetails: {},
  codexProxyBusy: false,
  setCodexProxyStatus: (codexProxyStatus) => set({ codexProxyStatus }),
  setCodexProxyCallsPage: (codexProxyCallsPage) => set({ codexProxyCallsPage }),
  setCodexProxyOverview: (codexProxyOverview) => set({ codexProxyOverview }),
  setCodexProxyOverviewRange: (codexProxyOverviewRange) => set({ codexProxyOverviewRange }),
  setCodexProxyOverviewBucket: (codexProxyOverviewBucket) => set({ codexProxyOverviewBucket }),
  setCodexProxyOverviewError: (codexProxyOverviewError) => set({ codexProxyOverviewError }),
  setGatewayPageTarget: (gatewayPageTarget) => set({ gatewayPageTarget }),
  setCodexProxyDetailTab: (codexProxyDetailTab) => set({ codexProxyDetailTab }),
  setCodexProxyCallPage: (codexProxyCallPage) => set({ codexProxyCallPage }),
  setCodexProxyCallPageSize: (codexProxyCallPageSize) => set({ codexProxyCallPageSize }),
  setCodexProxyExpandedCallId: (codexProxyExpandedCallId) => set({ codexProxyExpandedCallId }),
  setCodexProxyCallDetails: (value) => set((state) => ({
    codexProxyCallDetails: typeof value === "function" ? value(state.codexProxyCallDetails) : value,
  })),
  setCodexProxyBusy: (codexProxyBusy) => set({ codexProxyBusy }),
  resetGatewayHistoryView: () => set({
    codexProxyCallPage: 1,
    codexProxyExpandedCallId: null,
    codexProxyCallsPage: null,
    codexProxyOverview: null,
    codexProxyOverviewError: "",
    codexProxyCallDetails: {},
  }),
}));
