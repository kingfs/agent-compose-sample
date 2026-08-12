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

function campaignFrontMatter({ title, description, homeUrl = "/stories/" }) {
  return [
    "---",
    "layout: default",
    `title: ${JSON.stringify(title)}`,
    `description: ${JSON.stringify(description)}`,
    "lang: zh-CN",
    `home_url: ${homeUrl}`,
    "hide_language_switch: true",
    "---",
    "",
  ].join("\n");
}

function englishCampaignFrontMatter({ title, description }) {
  return campaignFrontMatter({ title, description, homeUrl: "/en/stories/" }).replace("lang: zh-CN", "lang: en");
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

function storyBody(markdown, filename) {
  const parsed = parseReadme(markdown, filename);
  return { ...parsed, body: parsed.body
    .replaceAll("](../assets/", "](/stories/assets/")
    .replace(/\]\(\{\{ site\.github\.repository_url \}\}\/blob\/\{\{ site\.github\.build_revision \}\}\/docs\/assets\//g, "](/stories/assets/") };
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
  const stories = chinese ? '<p class="stories-cta"><a href="{{ \'/stories/\' | relative_url }}">读场景故事：看看 Agent 如何真正上班 →</a></p>' : "";
  return `${frontMatter({
    title: heading, lang, alternateUrl: chinese ? "/en/" : "/", alternateLang: chinese ? "en" : "zh-CN",
    alternateLabel: chinese ? "English" : "中文", homeUrl: chinese ? "/" : "/en/",
  })}<h1>${heading}</h1>\n<p class="intro">${intro}</p>\n${stories}\n<section class="agent-list">${rows}</section>\n`;
}

function storiesIndex(stories) {
  const cards = stories.map(({ slug, title, description, eyebrow }) =>
    `<article class="story-card"><span>${escapeHtml(eyebrow)}</span><h2><a href="{{ '/stories/${slug}/' | relative_url }}">${escapeHtml(title)}</a></h2><p>${escapeHtml(description)}</p><a class="story-link" href="{{ '/stories/${slug}/' | relative_url }}">开始阅读 →</a></article>`
  ).join("\n");
  return `${campaignFrontMatter({ title: "Agent 上班实录", description: "四个真实场景，读懂如何用 agent-compose 创建对话、动态工作流、事件驱动与多触发 Agent。", homeUrl: "/" })}<div class="story-hero"><p class="eyebrow">AGENT-COMPOSE · 场景故事</p><h1>别只让 Agent 跑脚本，<br>也让它接电话、组队和听铃上班</h1><p class="intro">四篇不太像说明书的技术故事：从一个具体麻烦出发，拆开配置，看请求如何抵达 Agent，再亲手跑一次。</p></div>\n<section class="story-grid">${cards}</section>\n`;
}

function englishStoriesIndex(stories) {
  const cards = stories.map(({ slug, title, description }) => `<article class="story-card"><span>AGENT AT WORK</span><h2><a href="{{ '/en/stories/${slug}/' | relative_url }}">${escapeHtml(title)}</a></h2><p>${escapeHtml(description)}</p><a class="story-link" href="{{ '/en/stories/${slug}/' | relative_url }}">Read the story →</a></article>`).join("\n");
  return `${englishCampaignFrontMatter({ title: "Agent at Work", description: "Four approachable stories about building chat, dynamic, event-driven, and scheduled agents with agent-compose." })}<div class="story-hero"><p class="eyebrow">AGENT-COMPOSE · STORIES</p><h1>Let your Agent answer the phone,<br>form a team, and hear the alarm</h1><p class="intro">Four technical stories that start with an everyday mess and quietly reveal the architecture underneath.</p></div>\n<section class="story-grid">${cards}</section>\n`;
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

const docsRoot = path.join(root, "docs");
await cp(path.join(docsRoot, "assets"), path.join(output, "stories", "assets"), { recursive: true });
const storyEntries = (await readdir(docsRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory() && entry.name !== "assets")
  .sort((left, right) => left.name.localeCompare(right.name));
const stories = [];
const englishStories = [];
for (const entry of storyEntries) {
  const filename = `docs/${entry.name}/index.md`;
  const markdown = await readFile(path.join(root, filename), "utf8");
  const parsed = storyBody(markdown, filename);
  const eyebrow = markdown.match(/^>\s*栏目：(.+)$/m)?.[1]?.trim() || "场景故事";
  stories.push({ slug: entry.name, eyebrow, ...parsed });
  const englishFilename = `docs/${entry.name}/index.en.md`;
  const englishMarkdown = await readFile(path.join(root, englishFilename), "utf8");
  englishStories.push({ slug: entry.name, ...storyBody(englishMarkdown, englishFilename) });
  const target = path.join(output, "stories", entry.name);
  await mkdir(target, { recursive: true });
  await writeFile(path.join(target, "index.md"), campaignFrontMatter({ title: parsed.title, description: parsed.description }) + parsed.body + "\n");
  const englishTarget = path.join(output, "en", "stories", entry.name);
  await mkdir(englishTarget, { recursive: true });
  const english = englishStories.at(-1);
  await writeFile(path.join(englishTarget, "index.md"), englishCampaignFrontMatter({ title: english.title, description: english.description }) + english.body + "\n");
}
await mkdir(path.join(output, "stories"), { recursive: true });
await writeFile(path.join(output, "stories", "index.html"), storiesIndex(stories));
await mkdir(path.join(output, "en", "stories"), { recursive: true });
await writeFile(path.join(output, "en", "stories", "index.html"), englishStoriesIndex(englishStories));
console.log(`Generated ${entries.length * 2 + stories.length * 2 + 4} pages from ${entries.length} agents and ${stories.length} stories in ${path.relative(root, output)}`);
