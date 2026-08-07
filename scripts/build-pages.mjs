#!/usr/bin/env node

import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputFlag = process.argv.indexOf("--output");
if (outputFlag >= 0 && !process.argv[outputFlag + 1]) throw new Error("--output requires a directory");
const output = path.resolve(root, outputFlag >= 0 ? process.argv[outputFlag + 1] : ".pages-src");
if (output === root || !output.startsWith(`${root}${path.sep}`)) {
  throw new Error("output must be a directory inside the repository");
}

function frontMatter({ title, lang, alternateUrl, alternateLang, alternateLabel, homeUrl }) {
  return [
    "---",
    "layout: default",
    `title: ${JSON.stringify(title)}`,
    `lang: ${lang}`,
    `alternate_url: ${alternateUrl}`,
    `alternate_lang: ${alternateLang}`,
    `alternate_label: ${alternateLabel}`,
    `home_url: ${homeUrl}`,
    "---",
    "",
  ].join("\n");
}

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function parseReadme(markdown, filename) {
  const title = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim();
  if (!title) throw new Error(`${filename} must contain an H1 title`);
  const body = markdown
    .replace(/^\[(?:English|中文)\]\(README(?:\.en)?\.md\)\s*$/m, "")
    .replace(/\]\((?!https?:\/\/|#|\/)([^)]+)\)/g, (match, target) => {
      const repositoryPath = path.posix.normalize(path.posix.join(path.posix.dirname(filename), target));
      if (repositoryPath.startsWith("../")) throw new Error(`${filename} contains a link outside the repository`);
      return `]({{ site.github.repository_url }}/blob/{{ site.github.build_revision }}/${repositoryPath})`;
    })
    .trim();
  const paragraphs = body.split(/\n\s*\n/).map((value) => value.trim()).filter((value) =>
    value && !value.startsWith("#") && !value.startsWith("[") && !value.startsWith("```") && !value.startsWith(">")
  );
  const description = paragraphs[0]?.replace(/[`*_]/g, "") || title;
  return { title, description, body };
}

function indexPage(lang, agents) {
  const chinese = lang === "zh-CN";
  const rows = agents.map(({ slug, title, description }) => {
    const url = chinese ? `/agents/${slug}/` : `/en/agents/${slug}/`;
    return `<article class="agent-row"><h2><a href="{{ '${url}' | relative_url }}">${escapeHtml(title)}</a></h2><p>${escapeHtml(description)}</p></article>`;
  }).join("\n");
  const heading = chinese ? "Agent 示例" : "Agent samples";
  const intro = chinese
    ? "从可运行的小项目学习 agent-compose。每个示例都说明适用场景、工作流程、启动方式与预期结果。"
    : "Learn agent-compose through small, runnable projects. Each sample explains its use case, workflow, commands, and expected result.";
  return `${frontMatter({
    title: heading, lang, alternateUrl: chinese ? "/en/" : "/", alternateLang: chinese ? "en" : "zh-CN",
    alternateLabel: chinese ? "English" : "中文", homeUrl: chinese ? "/" : "/en/",
  })}<h1>${heading}</h1>\n<p class="intro">${intro}</p>\n<section class="agent-list">${rows}</section>\n`;
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(path.join(root, "pages"), output, { recursive: true });

const entries = (await readdir(path.join(root, "agents"), { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .sort((left, right) => left.name.localeCompare(right.name));
const indexes = { zh: [], en: [] };

for (const entry of entries) {
  const directory = path.join(root, "agents", entry.name);
  const [zhMarkdown, enMarkdown] = await Promise.all([
    readFile(path.join(directory, "README.md"), "utf8"),
    readFile(path.join(directory, "README.en.md"), "utf8"),
  ]);
  const zh = parseReadme(zhMarkdown, `agents/${entry.name}/README.md`);
  const en = parseReadme(enMarkdown, `agents/${entry.name}/README.en.md`);
  indexes.zh.push({ slug: entry.name, ...zh });
  indexes.en.push({ slug: entry.name, ...en });

  const zhTarget = path.join(output, "agents", entry.name);
  const enTarget = path.join(output, "en", "agents", entry.name);
  await Promise.all([mkdir(zhTarget, { recursive: true }), mkdir(enTarget, { recursive: true })]);
  await Promise.all([
    writeFile(path.join(zhTarget, "index.md"), frontMatter({ title: zh.title, lang: "zh-CN", alternateUrl: `/en/agents/${entry.name}/`, alternateLang: "en", alternateLabel: "English", homeUrl: "/" }) + zh.body + "\n"),
    writeFile(path.join(enTarget, "index.md"), frontMatter({ title: en.title, lang: "en", alternateUrl: `/agents/${entry.name}/`, alternateLang: "zh-CN", alternateLabel: "中文", homeUrl: "/en/" }) + en.body + "\n"),
  ]);
}

await mkdir(path.join(output, "en"), { recursive: true });
await Promise.all([
  writeFile(path.join(output, "index.html"), indexPage("zh-CN", indexes.zh)),
  writeFile(path.join(output, "en", "index.html"), indexPage("en", indexes.en)),
]);
console.log(`Generated ${entries.length * 2 + 2} pages from ${entries.length} agents in ${path.relative(root, output)}`);
