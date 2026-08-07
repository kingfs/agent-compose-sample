#!/usr/bin/env node

import { access, readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

function run(binary, args, cwd) {
  const result = spawnSync(binary, args, { cwd, encoding: "utf8", env: process.env });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || `${binary} failed`).trim());
  }
}

async function main() {
  const input = process.argv[2];
  if (!input || process.argv.length > 3) {
    throw new Error("Usage: validate-project.mjs <project-directory>");
  }
  const project = path.resolve(input);
  const compose = path.join(project, "agent-compose.yml");
  await access(compose);
  const source = await readFile(compose, "utf8");
  const errors = [];

  if (!/^name:\s*[a-z0-9][a-z0-9-]*\s*$/m.test(source)) errors.push("missing lowercase kebab-case project name");
  if (!/^agents:\s*$/m.test(source)) errors.push("missing agents mapping");
  if (/\/(?:Users|home|root|data\/src)\//.test(source)) errors.push("machine-specific absolute path found");
  if (/(?:token|password|secret|api[_-]?key):\s*["']?(?!\$\{)[A-Za-z0-9_+/=.-]{8,}/i.test(source)) {
    errors.push("possible plaintext secret found");
  }
  if (errors.length > 0) throw new Error(errors.join("; "));

  const binary = process.env.AGENT_COMPOSE_BIN || "agent-compose";
  run(binary, ["--file", compose, "config", "--quiet"], project);
  console.log(JSON.stringify({ ok: true, project, composeValid: true }, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, composeValid: false, error: error.message }, null, 2));
  process.exit(1);
});

