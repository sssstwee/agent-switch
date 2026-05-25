import { readFileSync } from "node:fs";

function equal<T>(actual: T, expected: T) {
  if (actual !== expected) {
    throw new Error(`Expected ${String(expected)}, got ${String(actual)}`);
  }
}

const tauriConfig = JSON.parse(
  readFileSync(new URL("../src-tauri/tauri.conf.json", import.meta.url), "utf8"),
) as { app: { security: { csp: string; devCsp: string } } };

const { csp, devCsp } = tauriConfig.app.security;

equal(csp.includes("http://127.0.0.1:*"), false);
equal(csp.includes("http://localhost:*"), false);
equal(csp.includes("https://api.github.com"), false);
equal(csp.includes("https://registry.npmjs.org"), false);

equal(devCsp.includes("http://localhost:1420"), true);
equal(devCsp.includes("ws://localhost:1420"), true);
