import { readFileSync } from "node:fs";

function includesForbidden(source: string, forbidden: string[]) {
  const lower = source.toLowerCase();
  return forbidden.filter((item) => lower.includes(item));
}

function equal<T>(actual: T, expected: T) {
  if (actual !== expected) {
    throw new Error(`Expected ${String(expected)}, got ${String(actual)}`);
  }
}

const appCss = readFileSync(new URL("./App.css", import.meta.url), "utf8");
const cargoToml = readFileSync(new URL("../src-tauri/Cargo.toml", import.meta.url), "utf8");

equal(includesForbidden(appCss, ["liquid glass", "glass-effect", "backdrop-filter"]).length, 0);
equal(includesForbidden(cargoToml, ["window-vibrancy"]).length, 0);
