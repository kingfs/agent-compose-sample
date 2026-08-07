#!/usr/bin/env node

import { access } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--host") options.host = argv[++index];
    else if (!options.project) options.project = argv[index];
    else throw new Error(`unknown argument: ${argv[index]}`);
  }
  options.host ||= process.env.AGENT_COMPOSE_HOST;
  if (!options.project || !options.host) {
    throw new Error("Usage: publish-project.mjs <project-directory> --host <daemon-url>");
  }
  return options;
}

function run(binary, args, cwd) {
  const result = spawnSync(binary, args, { cwd, encoding: "utf8", env: process.env });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error((result.stderr || result.stdout || `${binary} failed`).trim());
  return result.stdout.trim();
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const project = path.resolve(options.project);
  const compose = path.join(project, "agent-compose.yml");
  await access(compose);
  const binary = process.env.AGENT_COMPOSE_BIN || "agent-compose";
  run(binary, ["--file", compose, "config", "--quiet"], project);
  const output = run(binary, ["--host", options.host, "--file", compose, "--json", "up"], project);
  console.log(JSON.stringify({ ok: true, project, host: options.host, imported: true, result: JSON.parse(output) }, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, imported: false, error: error.message }, null, 2));
  process.exit(1);
});

