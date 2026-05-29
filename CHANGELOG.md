# Changelog

## v1.0.2 - 2026-05-30

Switch++ 小版本更新。本次重点打磨桌面端外观、窗口比例、侧栏密度、滚动体验和细节动效，让应用更像一个紧凑、原生、可长期停留在桌面的工具。

### 功能亮点 / Highlights

- 重新校准默认窗口尺寸为 `936x655`，保持约 `1.43` 的宽高比，并限制最小尺寸，避免工具窗口被缩到不可用状态。
- 将左侧侧栏固定为窗口宽度的 25%，在默认尺寸下完整展示应用与工具菜单，减少默认进入时的滚动需求。
- 优化配置列表顶部栏在最小尺寸下的收缩规则，保留右侧操作按钮单行显示，标题和描述在空间不足时自然省略。
- 隐藏内部滚动条但保留滚动能力，让侧栏、配置列表、网关详情和配置编辑区域视觉上更干净。
- 统一窗口、面板、卡片、按钮、菜单和弹出层的圆角 token，保持更一致的 macOS 工具应用质感。
- 为刷新、网关启停、更多菜单、更新提示和菜单项加入克制微动效，同时遵守系统的 reduced motion 偏好。
- 改进菜单栏图标为独立的 switch 模板图标，避免 Dock 图标和菜单栏图标混用导致显示成黑块或比例失真。
- 修正英文模式下的短状态与动作翻译，避免出现中英混排或半翻译状态。

### 界面预览 / Screenshots

**Codex Desktop 使用 DeepSeek 三方模型 / Codex Desktop with a DeepSeek third-party model**

![Codex Desktop 使用 DeepSeek 三方模型](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.2/docs/assets/screenshots/switchpp-codex-desktop-deepseek.png)

| Codex 配置列表 / Codex profiles | 新增 Codex 配置 / New Codex profile |
| --- | --- |
| ![Codex 配置列表](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.2/docs/assets/screenshots/switchpp-codex-profiles.png) | ![新增 Codex 配置](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.2/docs/assets/screenshots/switchpp-codex-new-profile.png) |

| Claude Desktop 配置切换 / Claude Desktop profiles | 本地环境检查 / Environment check |
| --- | --- |
| ![Claude Desktop 配置切换](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.2/docs/assets/screenshots/switchpp-claude-desktop-profiles.png) | ![本地环境检查](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.2/docs/assets/screenshots/switchpp-environment-check.png) |

| 兼容网关概览 / Gateway overview | 兼容网关调用记录 / Gateway request history |
| --- | --- |
| ![兼容网关概览](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.2/docs/assets/screenshots/switchpp-gateway-overview.png) | ![兼容网关调用记录](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.2/docs/assets/screenshots/switchpp-gateway-requests.png) |

| Claude Desktop 模型菜单 / Claude Desktop model menu | Claude Desktop 经由本地网关响应 / Claude Desktop through local gateway |
| --- | --- |
| ![Claude Desktop 模型菜单](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.2/docs/assets/screenshots/switchpp-claude-model-menu.png) | ![Claude Desktop 经由本地网关响应](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.2/docs/assets/screenshots/switchpp-claude-gateway-chat.png) |

### macOS 首次启动说明 / macOS First-Launch Notice

Switch++ 尚未通过 Apple 公证（notarization），macOS 首次启动时可能会阻止。安装到 `/Applications` 后请运行：

```bash
sudo xattr -rd com.apple.quarantine "/Applications/Switch++.app"
open "/Applications/Switch++.app"
```

Switch++ has not passed Apple notarization yet, so macOS may block it on first launch. After installing to `/Applications`, run:

```bash
sudo xattr -rd com.apple.quarantine "/Applications/Switch++.app"
open "/Applications/Switch++.app"
```

## v1.0.1 - 2026-05-26

Switch++ 小版本更新。本次重点改进 Claude / Codex 本地兼容网关、后台流量统计、推荐配置项和公开说明，让第三方模型接入 Claude Desktop、Codex Desktop 和 Claude Code 时更容易诊断、更稳定。

### 更新亮点

- 改进本地兼容网关统计，区分缓存命中、缓存创建和上游未上报缓存字段，避免把没有 cache 字段的请求误判为“缓存未命中”。
- 将代理转发与流量统计解析拆分为不同模块，降低后续替换统计实现或引入第三方统计方案时对网关代理路径的影响。
- 支持 Claude Code / Claude Desktop 的 `bypassPermissions` 权限选项，以高风险按需勾选方式写入配置。
- 新增 Claude Desktop 推荐配置策略，区分 Claude Code 与 Claude Desktop 的稳定性选项，减少把 CLI 专属字段误用于桌面端。
- 改进 Codex / Claude 的 token、缓存、错误和趋势图展示，便于判断问题来自账号、模型、协议、缓存还是本地网关。
- 安装并启用打包内置托盘图标，修复部分环境下托盘图标缺失或回退为默认图标的问题。
- 更新 README、下载页和 Release 页面文案，突出 Switch++ 在 Claude Desktop、Codex Desktop、官方登录态隔离、本地兼容网关、请求诊断和可审计写入上的差异化能力。

### 为什么选择 Switch++

Switch++ 不只是一个 provider 切换器，而是面向 Claude / Codex 桌面与本地 agent 生态的三方模型接入控制台：

- **Claude Desktop 深度适配**：管理桌面端第三方配置库，让 Claude Desktop 可以通过本地网关、官方模型名映射和厂商真实模型转发使用第三方模型。
- **Codex Desktop 官方登录态隔离**：三方模型写入专用 `agent-switch` provider，尽量保留官方 `auth.json`、ChatGPT 登录壳、插件入口和移动端连接能力。
- **本地兼容网关**：当目标应用与上游厂商协议不一致时，由 Switch++ 负责协议适配、模型映射、认证隔离、请求记录和统一启停。
- **可诊断的请求链路**：请求详情、token、缓存命中、缓存创建、错误记录和趋势图都在本机可见，方便判断是账号、模型、协议还是网关问题。
- **写入前可审计**：生成的 JSON / TOML 配置会先预览，推荐选项以勾选框呈现，并在应用前创建备份，降低误写配置的风险。
- **本地 agent 工具链管理**：覆盖 Claude Code、Claude Desktop、Codex、Hermes、OpenCode、OpenClaw、Pi、Oh My OpenAgent、Oh My Pi 等常见本地 agent 入口。

### 界面预览 / Screenshots

**Codex Desktop 使用 DeepSeek 三方模型 / Codex Desktop with a DeepSeek third-party model**

![Codex Desktop 使用 DeepSeek 三方模型](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.1/docs/assets/screenshots/switchpp-codex-desktop-deepseek.png)

| Codex 配置列表 / Codex profiles | 新增 Codex 配置 / New Codex profile |
| --- | --- |
| ![Codex 配置列表](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.1/docs/assets/screenshots/switchpp-codex-profiles.png) | ![新增 Codex 配置](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.1/docs/assets/screenshots/switchpp-codex-new-profile.png) |

| Claude Desktop 配置切换 / Claude Desktop profiles | 本地环境检查 / Environment check |
| --- | --- |
| ![Claude Desktop 配置切换](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.1/docs/assets/screenshots/switchpp-claude-desktop-profiles.png) | ![本地环境检查](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.1/docs/assets/screenshots/switchpp-environment-check.png) |

| 兼容网关概览 / Gateway overview | 兼容网关调用记录 / Gateway request history |
| --- | --- |
| ![兼容网关概览](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.1/docs/assets/screenshots/switchpp-gateway-overview.png) | ![兼容网关调用记录](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.1/docs/assets/screenshots/switchpp-gateway-requests.png) |

| Claude Desktop 模型菜单 / Claude Desktop model menu | Claude Desktop 经由本地网关响应 / Claude Desktop through local gateway |
| --- | --- |
| ![Claude Desktop 模型菜单](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.1/docs/assets/screenshots/switchpp-claude-model-menu.png) | ![Claude Desktop 经由本地网关响应](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.1/docs/assets/screenshots/switchpp-claude-gateway-chat.png) |

### macOS 首次启动说明

Switch++ 尚未通过 Apple 公证（notarization），macOS 首次启动时可能会阻止。安装到 `/Applications` 后请运行：

```bash
sudo xattr -rd com.apple.quarantine "/Applications/Switch++.app"
open "/Applications/Switch++.app"
```

### English

Switch++ patch release focused on Claude / Codex local gateway reliability, backend traffic statistics, recommended configuration options, and public messaging. Third-party model access through Claude Desktop, Codex Desktop, and Claude Code is now easier to diagnose and more stable.

#### Highlights

- Improve local gateway usage statistics by distinguishing cache hits, cache creation, and upstream responses that do not report cache fields.
- Split proxy forwarding from usage-stat parsing, reducing the impact of future metrics implementation changes on the gateway proxy path.
- Add the Claude Code / Claude Desktop `bypassPermissions` option as a high-risk, opt-in checkbox.
- Add Claude Desktop-specific recommended configuration rules, separate from Claude Code CLI options.
- Improve Codex / Claude token, cache, error, and trend displays to help identify account, model, protocol, cache, or local gateway issues.
- Install and use the bundled tray icon so desktop builds do not fall back to a missing/default tray icon.
- Update README, download page, and Release page copy around Claude Desktop, Codex Desktop, official-login isolation, local compatibility gateway, request diagnostics, and auditable writes.

#### Why Switch++

Switch++ is not just a provider switcher. It is a third-party model access console for Claude / Codex desktop workflows and local agent toolchains:

- **Claude Desktop first-class support**: manage the desktop third-party config library, route Claude Desktop through the local gateway, and map official Claude model names to real provider models.
- **Codex Desktop with official-login isolation**: write third-party models to a dedicated `agent-switch` provider while preserving the official `auth.json`, ChatGPT login shell, plugin entry points, and mobile connection path as much as possible.
- **Local compatibility gateway**: when a target app and upstream provider speak different protocols, Switch++ handles protocol adaptation, model mapping, auth isolation, request records, and unified start/stop.
- **Diagnosable request path**: request details, tokens, cache hits, cache creation, errors, and trend charts stay visible locally, making it easier to identify account, model, protocol, or gateway issues.
- **Auditable writes**: generated JSON / TOML is previewed before writing, recommended options are exposed as checkboxes, and backups are created before applying changes.
- **Local agent toolchain management**: cover Claude Code, Claude Desktop, Codex, Hermes, OpenCode, OpenClaw, Pi, Oh My OpenAgent, Oh My Pi, and other local agent entry points.

#### macOS First-Launch Notice

Switch++ has not passed Apple notarization yet, so macOS may block it on first launch. After installing to `/Applications`, run:

```bash
sudo xattr -rd com.apple.quarantine "/Applications/Switch++.app"
open "/Applications/Switch++.app"
```

## v1.0.0 - 2026-05-26

Switch++ 首个正式公开版本。这个版本面向日常使用者，而不是内部测试版本；后续公开发布从 `v1.0.0` 开始。

### 功能亮点

- 让第三方模型稳定进入 Claude Code、Claude Desktop、Codex CLI、Codex Desktop 以及常用本地 AI 编程工具。
- 支持 DeepSeek、MiniMax、Kimi、GLM 等国产模型接入 Codex 客户端及 Claude 客户端，并提供本地协议适配路径。
- 支持国产模型接入 Codex 后配合使用官方插件和移动端能力；需先登录官方账号并添加官方配置，再与三方模型配置搭配使用。
- 在官方账号模式和第三方模型厂商模式之间快速切换。
- 为不同工具保存多套配置，并支持新增、编辑、复制、删除、排序和一键应用。
- 写入前预览配置内容，并在应用前自动保留备份，便于回退。
- 内置主流厂商预设、模型发现、能力提示和配置建议，减少手动试错。
- 提供本地兼容网关，统一承接 Claude 与 Codex 的第三方模型调用，并处理 Anthropic / OpenAI / Responses / Chat Completions 之间的协议差异。
- 展示网关状态、调用记录、消耗统计、缓存读写、错误记录和趋势图表，方便定位问题。
- 检查本机工具、应用、配置文件、安装版本和可升级状态。
- 支持一键安装、升级、卸载常用 CLI 工具。
- 支持中英双语界面、紧凑侧边栏、系统托盘和桌面原生窗口体验。

### 为什么选择 Switch++

Switch++ 不只是一个 provider 切换器，而是面向 Claude / Codex 桌面与本地 agent 生态的三方模型接入控制台：

- **Claude Desktop 深度适配**：管理桌面端第三方配置库，让 Claude Desktop 可以通过本地网关、官方模型名映射和厂商真实模型转发使用第三方模型。
- **Codex Desktop 官方登录态隔离**：三方模型写入专用 `agent-switch` provider，尽量保留官方 `auth.json`、ChatGPT 登录壳、插件入口和移动端连接能力。
- **本地兼容网关**：当目标应用与上游厂商协议不一致时，由 Switch++ 负责协议适配、模型映射、认证隔离、请求记录和统一启停。
- **可诊断的请求链路**：请求详情、token、缓存命中、缓存创建、错误记录和趋势图都在本机可见，方便判断是账号、模型、协议还是网关问题。
- **写入前可审计**：生成的 JSON / TOML 配置会先预览，推荐选项以勾选框呈现，并在应用前创建备份，降低误写配置的风险。
- **本地 agent 工具链管理**：覆盖 Claude Code、Claude Desktop、Codex、Hermes、OpenCode、OpenClaw、Pi、Oh My OpenAgent、Oh My Pi 等常见本地 agent 入口。

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

- Bring third-party models into Claude Code, Claude Desktop, Codex CLI, Codex Desktop, and common local AI coding tools.
- Connect domestic model providers such as DeepSeek, MiniMax, Kimi, and GLM to Codex and Claude clients through local protocol adaptation when needed.
- Use official Codex plugins and mobile features alongside domestic model profiles after signing in with an official account and adding the official configuration.
- Switch quickly between official-account mode and third-party provider mode.
- Save multiple profiles per tool, then add, edit, duplicate, delete, reorder, and apply them quickly.
- Preview local configuration before writing it, with backups created before changes are applied.
- Use built-in provider presets, model discovery, capability notes, and recommendations to reduce trial and error.
- Route Claude and Codex third-party model calls through the local compatibility gateway, including Anthropic / OpenAI / Responses / Chat Completions protocol differences.
- Inspect gateway status, request history, usage statistics, cache reads, cache creation, recent errors, and trend charts.
- Check local tools, apps, config files, installed versions, and available upgrades.
- Install, upgrade, and uninstall common CLI tools from the app.
- Use the bilingual desktop interface with compact navigation, tray support, and native window behavior.

#### Why Switch++

Switch++ is not just a provider switcher. It is a third-party model access console for Claude / Codex desktop workflows and local agent toolchains:

- **Claude Desktop first-class support**: manage the desktop third-party config library, route Claude Desktop through the local gateway, and map official Claude model names to real provider models.
- **Codex Desktop with official-login isolation**: write third-party models to a dedicated `agent-switch` provider while preserving the official `auth.json`, ChatGPT login shell, plugin entry points, and mobile connection path as much as possible.
- **Local compatibility gateway**: when a target app and upstream provider speak different protocols, Switch++ handles protocol adaptation, model mapping, auth isolation, request records, and unified start/stop.
- **Diagnosable request path**: request details, tokens, cache hits, cache creation, errors, and trend charts stay visible locally, making it easier to identify account, model, protocol, or gateway issues.
- **Auditable writes**: generated JSON / TOML is previewed before writing, recommended options are exposed as checkboxes, and backups are created before applying changes.
- **Local agent toolchain management**: cover Claude Code, Claude Desktop, Codex, Hermes, OpenCode, OpenClaw, Pi, Oh My OpenAgent, Oh My Pi, and other local agent entry points.

#### macOS First-Launch Notice

Switch++ has not passed Apple notarization yet, so macOS may block it on first launch. After installing to `/Applications`, run:

```bash
sudo xattr -rd com.apple.quarantine "/Applications/Switch++.app"
open "/Applications/Switch++.app"
```
