import { deepEqual, equal } from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildEnvCheckCards } from "./features/env-check/envCheckCards.ts";

function readSource(path: string) {
  return readFileSync(new URL(path, import.meta.url), "utf8").replace(/\r\n/g, "\n");
}

const cards = buildEnvCheckCards(null, "macos");

const piCard = cards.find((card) => card.key === "pi");
equal(piCard?.launchCommand, "pi");
deepEqual(piCard?.launchArgs, []);

const ohMyPiCard = cards.find((card) => card.key === "oh_my_pi");
equal(ohMyPiCard?.launchCommand, "omp");
deepEqual(ohMyPiCard?.launchArgs, []);

const ohMyOpenAgentCard = cards.find((card) => card.key === "oh_my_opencode");
equal(ohMyOpenAgentCard?.launchCommand, "opencode");
deepEqual(ohMyOpenAgentCard?.launchArgs, []);

const codexDesktopCard = cards.find((card) => card.key === "codex_desktop");
equal(codexDesktopCard?.launchCommand, "open");
deepEqual(codexDesktopCard?.launchArgs, ["-a", "Codex"]);

const appSource = readSource("./App.tsx");
const envCheckCardsSource = readSource("./features/env-check/envCheckCards.ts");
equal(envCheckCardsSource.includes("请先安装 OpenCode"), true);
equal(envCheckCardsSource.includes("它是独立增强版 CLI"), true);
equal(appSource.includes("启动命令"), true);
equal(appSource.includes("启动参数"), true);
equal(appSource.includes("launchCommandDisplay(item)"), true);
equal(appSource.includes("launchArgsDisplay(item)"), true);
equal(appSource.includes(': "无"'), false);
equal(appSource.includes('item.badge.includes("桌面端")'), true);
