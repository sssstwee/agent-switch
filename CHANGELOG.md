# Changelog

## v1.0.0 - 2026-05-26

Switch++ 首个正式公开版本。这个版本面向日常使用者，而不是内部测试版本；后续公开发布从 `v1.0.0` 开始。

### 功能亮点

- 让第三方模型更容易进入 Claude、Codex 以及常用本地 AI 编程工具。
- 支持 DeepSeek、MiniMax、Kimi、GLM 等国产模型接入 Codex 客户端及 Claude 客户端。
- 支持国产模型接入 Codex 后配合使用官方插件和移动端能力；需先登录官方账号并添加官方配置，再与三方模型配置搭配使用。
- 在官方账号模式和第三方模型厂商模式之间快速切换。
- 为不同工具保存多套配置，并支持新增、编辑、复制、删除、排序和一键应用。
- 写入前预览配置内容，并在应用前自动保留备份，便于回退。
- 内置主流厂商预设、模型发现、能力提示和配置建议，减少手动试错。
- 提供本地兼容网关，统一承接 Claude 与 Codex 的第三方模型调用。
- 展示网关状态、调用记录、消耗统计、错误记录和趋势图表，方便定位问题。
- 检查本机工具、应用、配置文件、安装版本和可升级状态。
- 支持一键安装、升级、卸载常用 CLI 工具。
- 支持中英双语界面、紧凑侧边栏、系统托盘和桌面原生窗口体验。

### 界面预览 / Screenshots

**Codex Desktop 使用 DeepSeek 三方模型 / Codex Desktop with a DeepSeek third-party model**

![Codex Desktop 使用 DeepSeek 三方模型](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.0/docs/assets/screenshots/switchpp-codex-desktop-deepseek.png)

| Codex 配置列表 / Codex profiles | 新增 Codex 配置 / New Codex profile |
| --- | --- |
| ![Codex 配置列表](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.0/docs/assets/screenshots/switchpp-codex-profiles.png) | ![新增 Codex 配置](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.0/docs/assets/screenshots/switchpp-codex-new-profile.png) |

| Claude Desktop 配置切换 / Claude Desktop profiles | 本地环境检查 / Environment check |
| --- | --- |
| ![Claude Desktop 配置切换](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.0/docs/assets/screenshots/switchpp-claude-desktop-profiles.png) | ![本地环境检查](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.0/docs/assets/screenshots/switchpp-environment-check.png) |

| 兼容网关概览 / Gateway overview | 兼容网关调用记录 / Gateway request history |
| --- | --- |
| ![兼容网关概览](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.0/docs/assets/screenshots/switchpp-gateway-overview.png) | ![兼容网关调用记录](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.0/docs/assets/screenshots/switchpp-gateway-requests.png) |

| Claude Desktop 模型菜单 / Claude Desktop model menu | Claude Desktop 经由本地网关响应 / Claude Desktop through local gateway |
| --- | --- |
| ![Claude Desktop 模型菜单](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.0/docs/assets/screenshots/switchpp-claude-model-menu.png) | ![Claude Desktop 经由本地网关响应](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.0/docs/assets/screenshots/switchpp-claude-gateway-chat.png) |

### macOS 首次启动说明

Switch++ 尚未通过 Apple 公证（notarization），macOS 首次启动时可能会阻止。安装到 `/Applications` 后请运行：

```bash
sudo xattr -rd com.apple.quarantine "/Applications/Switch++.app"
open "/Applications/Switch++.app"
```

### English

Switch++ first public stable release. This version is intended as the first official external release; public release history starts from `v1.0.0`.

#### Highlights

- Bring third-party models into Claude, Codex, and common local AI coding tools.
- Connect domestic model providers such as DeepSeek, MiniMax, Kimi, and GLM to Codex and Claude clients.
- Use official Codex plugins and mobile features alongside domestic model profiles after signing in with an official account and adding the official configuration.
- Switch quickly between official-account mode and third-party provider mode.
- Save multiple profiles per tool, then add, edit, duplicate, delete, reorder, and apply them quickly.
- Preview local configuration before writing it, with backups created before changes are applied.
- Use built-in provider presets, model discovery, capability notes, and recommendations to reduce trial and error.
- Route Claude and Codex third-party model calls through the local compatibility gateway.
- Inspect gateway status, request history, usage statistics, recent errors, and trend charts.
- Check local tools, apps, config files, installed versions, and available upgrades.
- Install, upgrade, and uninstall common CLI tools from the app.
- Use the bilingual desktop interface with compact navigation, tray support, and native window behavior.

#### macOS First-Launch Notice

Switch++ has not passed Apple notarization yet, so macOS may block it on first launch. After installing to `/Applications`, run:

```bash
sudo xattr -rd com.apple.quarantine "/Applications/Switch++.app"
open "/Applications/Switch++.app"
```
