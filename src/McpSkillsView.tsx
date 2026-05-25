import { Cpu as CpuIcon, SquaresFour as LayoutDashboardIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import type { McpServerData, SkillData } from "./appTypes.ts";
import { nativeApi } from "./nativeApi.ts";
import { Button, Input } from "./nativeUi.tsx";

export default function McpSkillsView() {
  const [mcpServers, setMcpServers] = useState<McpServerData[]>([]);
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [loading, setLoading] = useState(true);
  const [skillContent, setSkillContent] = useState<string | null>(null);
  const [skillViewName, setSkillViewName] = useState<string | null>(null);
  const [editingMcp, setEditingMcp] = useState<McpServerData | null>(null);
  const [newName, setNewName] = useState("");
  const [newCmd, setNewCmd] = useState("");
  const [newArgs, setNewArgs] = useState("");
  const [newEnv, setNewEnv] = useState("");
  const [addMode, setAddMode] = useState(false);

  useEffect(() => {
    void loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [mcpResult, skillsResult] = await Promise.all([
        nativeApi.listMcpServers(),
        nativeApi.listSkills(),
      ]);
      setMcpServers(mcpResult);
      setSkills(skillsResult);
    } catch (error) {
      console.error("Failed to load MCP/Skills:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveMcp() {
    const name = (addMode ? newName : editingMcp?.name) || "";
    if (!name || !newCmd) return;
    const args = newArgs.split(" ").filter(Boolean);
    const env: Record<string, string> = {};
    newEnv
      .split("\n")
      .filter(Boolean)
      .forEach((line) => {
        const idx = line.indexOf("=");
        if (idx > 0) env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
      });
    try {
      await nativeApi.saveMcpServer({ name, command: newCmd, args, env });
      setMcpServers(await nativeApi.listMcpServers());
    } catch (error) {
      console.error("Failed to save MCP server:", error);
    }
    setEditingMcp(null);
    setAddMode(false);
  }

  function startEdit(server: McpServerData) {
    setEditingMcp(server);
    setAddMode(false);
    setNewCmd(server.command);
    setNewArgs(server.args.join(" "));
    setNewEnv(Object.entries(server.env).map(([key, value]) => `${key}=${value}`).join("\n"));
  }

  function startAdd() {
    setAddMode(true);
    setEditingMcp(null);
    setNewName("");
    setNewCmd("");
    setNewArgs("");
    setNewEnv("");
  }

  async function handleDeleteMcp(name: string) {
    try {
      setMcpServers(await nativeApi.deleteMcpServer(name));
    } catch (error) {
      console.error("Failed to delete MCP server:", error);
    }
  }

  async function viewSkill(name: string) {
    try {
      const content = await nativeApi.getSkillContent(name);
      setSkillContent(content);
      setSkillViewName(name);
    } catch (error) {
      console.error("Failed to load skill:", error);
    }
  }

  async function handleDeleteSkill(name: string) {
    try {
      setSkills(await nativeApi.deleteSkill(name));
      if (skillViewName === name) setSkillContent(null);
    } catch (error) {
      console.error("Failed to delete skill:", error);
    }
  }

  if (loading) return <div className="ccr-loading-center">加载中...</div>;

  return (
    <div className="ccr-mcp-view">
      <section className="ccr-mcp-section">
        <header className="ccr-mcp-section-header">
          <div className="ccr-env-header-main">
            <CpuIcon className="h-5 w-5 ccr-env-header-icon" />
            <div>
              <h2>MCP 服务器</h2>
              <p>管理 Claude Code/Desktop 的 MCP 工具服务器配置。</p>
            </div>
          </div>
          <Button size="sm" variant="primary" onPress={startAdd}>添加 MCP</Button>
        </header>

        {(addMode || editingMcp) && (
          <div className="ccr-mcp-form">
            {addMode && (
              <div className="ccr-edit-field">
                <label>名称</label>
                <Input placeholder="例如: filesystem" value={newName} onChange={(e) => setNewName(e.currentTarget.value)} />
              </div>
            )}
            <div className="ccr-edit-field">
              <label>命令</label>
              <Input placeholder="例如: npx" value={newCmd} onChange={(e) => setNewCmd(e.currentTarget.value)} />
            </div>
            <div className="ccr-edit-field">
              <label>参数（空格分隔）</label>
              <Input placeholder="-y @modelcontextprotocol/server-filesystem /tmp" value={newArgs} onChange={(e) => setNewArgs(e.currentTarget.value)} />
            </div>
            <div className="ccr-edit-field">
              <label>环境变量（每行 KEY=VALUE）</label>
              <Input placeholder="API_KEY=sk-..." value={newEnv} onChange={(e) => setNewEnv(e.currentTarget.value)} />
            </div>
            <div className="ccr-mcp-form-actions">
              <Button size="sm" variant="primary" onPress={handleSaveMcp} isDisabled={!newCmd}>保存</Button>
              <Button size="sm" variant="ghost" onPress={() => { setEditingMcp(null); setAddMode(false); }}>取消</Button>
            </div>
          </div>
        )}

        <div className="ccr-mcp-list">
          {mcpServers.length === 0 && <div className="ccr-mcp-empty">暂无 MCP 服务器，点击上方添加。</div>}
          {mcpServers.map((server) => (
            <div key={server.name} className="ccr-mcp-item">
              <div className="ccr-mcp-item-head">
                <strong>{server.name}</strong>
                <code>{server.command} {server.args.join(" ")}</code>
              </div>
              <div className="ccr-mcp-item-actions">
                <Button size="sm" variant="ghost" onPress={() => startEdit(server)}>编辑</Button>
                <Button size="sm" variant="danger-soft" onPress={() => handleDeleteMcp(server.name)}>删除</Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="ccr-mcp-section">
        <header className="ccr-mcp-section-header">
          <div className="ccr-env-header-main">
            <LayoutDashboardIcon className="h-5 w-5 ccr-env-header-icon" />
            <div>
              <h2>技能</h2>
              <p>Claude Code 当前可用的技能清单（来自 ~/.claude/skills/）。</p>
            </div>
          </div>
        </header>

        <div className="ccr-mcp-list">
          {skills.length === 0 && <div className="ccr-mcp-empty">暂无 Skills。</div>}
          {skills.map((skill) => (
            <div key={skill.name} className="ccr-mcp-item">
              <div className="ccr-mcp-item-head">
                <strong>{skill.name}</strong>
                <span className="ccr-mcp-item-desc">{skill.description}</span>
              </div>
              <div className="ccr-mcp-item-actions">
                <Button size="sm" variant="ghost" onPress={() => viewSkill(skill.name)}>查看</Button>
                <Button size="sm" variant="danger-soft" onPress={() => handleDeleteSkill(skill.name)}>删除</Button>
              </div>
            </div>
          ))}
        </div>

        {skillContent && (
          <div className="ccr-mcp-skill-view">
            <div className="ccr-mcp-skill-view-head">
              <strong>{skillViewName}.md</strong>
              <Button size="sm" variant="ghost" onPress={() => setSkillContent(null)}>关闭</Button>
            </div>
            <pre className="ccr-mcp-skill-content">{skillContent}</pre>
          </div>
        )}
      </section>
    </div>
  );
}
