import { strict as assert } from "node:assert";
import { test } from "node:test";
import { translateUiText } from "./uiTranslation.ts";

test("English mode translates gateway switch labels as whole phrases", () => {
  assert.equal(translateUiText("已开启", "en"), "On");
  assert.equal(translateUiText("已关闭", "en"), "Stopped");
  assert.equal(translateUiText("刷新", "en"), "Refresh");
  assert.equal(translateUiText("刷新：重新写入配置", "en"), "Refresh: rewrite config");
});
