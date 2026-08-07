#!/usr/bin/env node

import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

function parseArgs(argv) {
  const options = { force: false };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--force") options.force = true;
    else if (value === "--blueprint") options.blueprint = argv[++index];
    else if (value === "--output") options.output = argv[++index];
    else throw new Error(`unknown argument: ${value}`);
  }
  if (!options.blueprint || !options.output) {
    throw new Error("Usage: scaffold.mjs --blueprint <file.json> --output <directory> [--force]");
  }
  return options;
}

function identifier(value, field) {
  const result = String(value || "").trim();
  if (!/^[a-z0-9][a-z0-9-]*$/.test(result)) {
    throw new Error(`${field} must use lowercase kebab-case`);
  }
  return result;
}

function quote(value) {
  return JSON.stringify(String(value));
}

function block(value, spaces) {
  const prefix = " ".repeat(spaces);
  return String(value).trim().split("\n").map((line) => `${prefix}${line}`).join("\n");
}

function renderCompose(blueprint) {
  const projectName = identifier(blueprint.name, "project name");
  if (!Array.isArray(blueprint.agents) || blueprint.agents.length === 0) {
    throw new Error("blueprint.agents must be a non-empty array");
  }
  const lines = [`name: ${projectName}`, "", "agents:"];
  for (const raw of blueprint.agents) {
    const name = identifier(raw.name, "agent name");
    const provider = identifier(raw.provider || "codex", "provider");
    const driver = identifier(raw.driver || "docker", "driver");
    lines.push(
      `  ${name}:`,
      `    provider: ${provider}`,
      `    image: ${quote(raw.image || "agent-compose-guest:latest")}`,
      "    system_prompt: |",
      block(raw.systemPrompt || "You are a reliable assistant.", 6),
      "    driver:",
      `      ${driver}: {}`,
    );
  }
  return `${lines.join("\n")}\n`;
}

function renderReadme(blueprint) {
  return `# ${blueprint.name}\n\nGenerated agent-compose project.\n\n## Run\n\n\`\`\`bash\nagent-compose config --quiet\nagent-compose up\nagent-compose run ${blueprint.agents[0].name} --prompt "Hello"\nagent-compose down\n\`\`\`\n`;
}

async function ensureWritable(target, force) {
  if (force) return;
  try {
    await access(target);
    throw new Error(`${target} already exists; pass --force to overwrite`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const blueprint = JSON.parse(await readFile(path.resolve(options.blueprint), "utf8"));
  const output = path.resolve(options.output);
  const compose = path.join(output, "agent-compose.yml");
  await mkdir(output, { recursive: true });
  await ensureWritable(compose, options.force);
  await writeFile(compose, renderCompose(blueprint), "utf8");
  await writeFile(path.join(output, "README.md"), renderReadme(blueprint), "utf8");
  console.log(JSON.stringify({ ok: true, output, files: ["agent-compose.yml", "README.md"] }, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
  process.exit(1);
});

