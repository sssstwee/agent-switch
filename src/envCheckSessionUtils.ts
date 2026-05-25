import {
  DEFAULT_ENV_CARD_KEY,
  ENV_CHECK_CARD_ORDER,
  type EnvCheckCardKey,
  type EnvCheckResult,
  type EnvCheckSessionSnapshot,
  type EnvConfigLocation,
} from "./appConstants.ts";
import { invokeNative, nativeCommand } from "./nativeIpc.ts";

function normalizeEnvCheckSnapshot(snapshot: Partial<EnvCheckSessionSnapshot> | null): EnvCheckSessionSnapshot | null {
  const parsed = snapshot;
  if (!parsed || typeof parsed.checkedAt !== "number" || !parsed.results) {
    return null;
  }

  const selectedKey =
    typeof parsed.selectedKey === "string" && ENV_CHECK_CARD_ORDER.includes(parsed.selectedKey as EnvCheckCardKey)
      ? parsed.selectedKey
      : DEFAULT_ENV_CARD_KEY;

  return {
    results: parsed.results as EnvCheckResult,
    checkedAt: parsed.checkedAt,
    selectedKey,
  };
}

export async function readEnvCheckSessionSnapshot(): Promise<EnvCheckSessionSnapshot | null> {
  try {
    const snapshot = await invokeNative<EnvCheckSessionSnapshot | null>(nativeCommand.loadEnvCheckSnapshot);
    return normalizeEnvCheckSnapshot(snapshot);
  } catch {
    return null;
  }
}

export async function writeEnvCheckSessionSnapshot(results: EnvCheckResult, checkedAt: number, selectedKey: string) {
  try {
    await invokeNative<void>(nativeCommand.saveEnvCheckSnapshot, {
      snapshot: { results, checkedAt, selectedKey },
    });
  } catch {
    // Env check cache is only a convenience; failures should not block checks.
  }
}

export function isEnvOperationStopped(error: unknown) {
  return String(error).includes("操作已停止");
}

export function envConfigStatusLabel(record: EnvConfigLocation) {
  if (record.is_primary) return "主配置";
  if (record.exists && record.kind === "目录") return "配置目录";
  if (record.exists) return "多余配置";
  return "未创建";
}
