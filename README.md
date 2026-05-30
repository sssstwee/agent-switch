# Switch++：Claude 与 Codex 的第三方模型接入工具

English version: [README.en.md](README.en.md)

Switch++ 是一个桌面端配置切换、模型路由和本地兼容网关工具，用来把第三方模型接入 Claude Code、Claude Desktop、Codex CLI、Codex Desktop 以及常见本地 AI coding agent。

- 下载地址：https://github.com/sssstwee/switch-plus-plus/releases/latest
- 下载页与使用指南：https://sssstwee.github.io/switch-plus-plus/

## 它解决什么问题

- 在一个桌面应用里管理 Claude、Codex 和本地 agent 的多套模型配置。
- 在官方账号配置和第三方模型配置之间快速切换。
- 用本地兼容网关处理 Anthropic、OpenAI、Responses 和 Chat Completions 之间的协议差异。
- 在写入本地配置前预览 JSON / TOML，并自动保留备份。
- 查看本地网关请求记录、token 统计、缓存命中、错误记录和趋势图表。
- 检查本机应用、CLI、配置文件路径、版本和可升级状态。

## 适合谁

- 想在 Claude Code、Claude Desktop、Codex CLI 或 Codex Desktop 中使用第三方模型的开发者。
- 需要同时维护官方账号模式和第三方模型厂商模式的用户。
- 需要接入 DeepSeek、MiniMax、Kimi、GLM 等 OpenAI-compatible 或 Anthropic-compatible 模型的用户。
- 需要排查本地 agent 请求链路、配置写入位置、模型名称或协议适配问题的用户。

## 核心能力

### 配置管理

- 为不同目标应用保存多套配置。
- 支持新增、编辑、复制、删除、排序和一键应用。
- 内置主流厂商预设、模型发现、能力提示和配置建议。
- 写入前预览配置内容，应用前创建备份，便于回退。

### 本地兼容网关

- 统一承接 Claude 和 Codex 的第三方模型调用。
- 处理 OpenAI-compatible、Anthropic-compatible、Responses 和 Chat Completions 协议差异。
- 支持模型映射、认证隔离、请求记录和统一启停。
- Codex 三方模型可通过本地 Responses runtime gateway 路由，同时尽量保留官方 `auth.json`、ChatGPT 登录壳、插件入口和移动端连接能力。

### 诊断与环境检查

- 展示网关状态、请求详情、token、缓存读写、错误记录和趋势图表。
- 检查本机工具、应用、配置文件、安装版本和可升级状态。
- 支持一键安装、升级、卸载常用 CLI 工具。

## 支持的目标应用

| 目标应用 | Switch++ 管理内容 | 主要配置位置 |
| --- | --- | --- |
| Claude Code | CLI settings、模型映射、网关环境变量、功能开关 | `~/.claude/settings.json` |
| Claude Desktop | 桌面端第三方配置库 | macOS: `~/Library/Application Support/Claude-3p/configLibrary`; Windows: `%APPDATA%\Claude-3p\configLibrary` |
| Codex | 官方登录配置和第三方厂商配置 | `~/.codex/auth.json`, `~/.codex/config.toml` |
| OpenCode | OpenAI-compatible provider、默认模型、small model | `~/.config/opencode/opencode.json` |
| Oh My OpenAgent | agents/categories 模型路由，并同步 OpenCode provider | `~/.config/opencode/oh-my-openagent.json` |
| OpenClaw | provider 与默认 agent 模型 | `~/.openclaw/openclaw.json` |
| Hermes Agent | custom provider 与默认模型 | `~/.hermes/config.yaml` |
| Pi | custom provider、默认 provider 与默认模型 | `~/.pi/agent/models.json`, `~/.pi/agent/settings.json` |
| Oh My Pi | provider 与 agent/category 模型路由 | `~/.omp/agent/models.yml` |

## 界面预览

**Codex 配置列表**

![Codex 配置列表](docs/assets/screenshots/switchpp-codex-profiles.png)

**新增 Codex 配置**

![新增 Codex 配置](docs/assets/screenshots/switchpp-codex-new-profile.png)

**Claude Code 配置列表**

![Claude Code 配置列表](docs/assets/screenshots/switchpp-claude-code-profiles.png)

**兼容网关概览**

![兼容网关概览](docs/assets/screenshots/switchpp-gateway-overview.png)

**兼容网关调用记录**

![兼容网关调用记录](docs/assets/screenshots/switchpp-gateway-requests.png)

**本地环境检查**

![本地环境检查](docs/assets/screenshots/switchpp-environment-check.png)

## 下载与安装

打开发布页，按系统选择安装包：

- macOS Apple Silicon：`aarch64.dmg`
- macOS Intel：`x64.dmg`
- Windows x64：`x64-setup.exe`
- Linux x64：`amd64.AppImage`

具体可用安装包以发布页实际显示为准。

## macOS 首次启动

如果 macOS 提示无法验证开发者，先确认安装包来自本仓库发布页，然后尝试：

1. 在 Finder 中打开「应用程序」。
2. 按住 Control 点击 `Switch++.app`。
3. 选择「打开」，再在系统提示中确认打开。

如果仍然被 quarantine 标记阻止启动，可以执行：

```bash
sudo xattr -rd com.apple.quarantine "/Applications/Switch++.app"
open "/Applications/Switch++.app"
```

如系统仍提示拦截，请打开「系统设置」>「隐私与安全性」，在 Switch++ 提示项旁点击「仍要打开」。

## 基本使用流程

1. 下载并安装 Switch++。
2. 打开应用，先运行「环境检查」。
3. 选择 Claude Code、Claude Desktop、Codex 或兼容网关。
4. 添加新配置，或同步当前本地配置。
5. 检查 Switch++ 生成的本地配置内容。
6. 点击「应用」写入配置。
7. 如果目标应用只在启动时读取配置，请重启目标应用或打开新的终端会话。

## 配置生效说明

- Switch++ 写入的是当前用户的本地配置文件。
- 已经运行的终端会话或桌面应用可能仍保留旧配置。
- 应用配置后，如果没有立即生效，请新开终端会话或重启目标应用。
- 切换到第三方模型厂商配置后，请确认目标应用的请求地址和模型名称符合预期。

## 安全说明

- Switch++ 只写入当前用户的本地配置文件。
- 应用配置会改变 Claude Code、Claude Desktop 或 Codex 的请求目标。
- 写入前请检查 API Base URL、模型名称和 API Key。
- API Key 请自行妥善保存，不要分享包含密钥的截图。
- 如需回退，请使用 Switch++ 创建的备份或重新同步目标应用当前配置。

## 常见问题

### 应用后为什么当前终端没有变化？

部分命令行工具只在启动时读取环境变量或配置文件。请关闭当前终端窗口，重新打开一个新终端后再测试。

### 可以同时保留官方账号和第三方模型配置吗？

可以。Switch++ 支持保存多套配置，并在需要时切换。切换后请按目标应用要求重启或新开会话。

### 为什么需要环境检查？

环境检查用于确认目标应用、命令路径和配置文件位置是否存在，避免把配置写到错误位置。

### Linux 上为什么没有 Claude Desktop 检查？

当系统没有可用的 Claude Desktop 桌面目标时，Switch++ 会跳过桌面端检查，只处理可用的 Claude Code 和 Codex 配置。

## 搜索关键词

Switch++, Agent Router, model router, model switcher, LLM gateway, Claude Code third-party models, Claude Desktop, Codex third-party models, Codex CLI, Codex Desktop, Hermes, OpenCode, OpenClaw, Pi, OpenAI-compatible, Anthropic-compatible, local compatibility gateway.

## 版权与许可

Copyright (c) 2026 sssstwee.

本项目采用自定义的 Switch++ Proprietary Non-Commercial Source License 1.0。这不是 OSI 定义的开源协议；源码仅允许个人、教育、研究或评估用途查看、运行和修改。未经书面许可，严格禁止商业使用、企业内部使用、SaaS/托管服务、付费交付、商业项目集成、发布修改版或衍生版本，以及用于机器学习训练、数据集、评测或自动化开发工具。

完整条款见 [LICENSE](LICENSE)。
