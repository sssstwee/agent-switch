export function mergeTopLevelTomlString(toml: string, key: string, value: string): string {
  const assignment = `${key} = "${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  if (!toml.trim()) return assignment;
  const lines = toml.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const firstSectionIndex = lines.findIndex((line) => /^\s*\[[^\]]+\]/.test(line));
  const topLevelEnd = firstSectionIndex >= 0 ? firstSectionIndex : lines.length;
  const existingIndex = lines
    .slice(0, topLevelEnd)
    .findIndex((line) => new RegExp(`^\\s*${key}\\s*=`).test(line));
  if (existingIndex >= 0) {
    const next = [...lines];
    next[existingIndex] = assignment;
    return next.join("\n").trimEnd();
  }
  const next = [...lines];
  const insertAt = firstSectionIndex >= 0 ? firstSectionIndex : next.length;
  next.splice(insertAt, 0, assignment);
  return next.join("\n").trimEnd();
}

export function mergeCodexOfficialModelIntoToml(toml: string, model: string): string {
  const trimmed = model.trim();
  if (!trimmed) return toml;
  return mergeTopLevelTomlString(toml, "model", trimmed);
}
