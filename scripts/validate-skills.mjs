#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const expectedSkills = [
  "polpo",
  "polpo-agents",
  "polpo-channels",
  "polpo-integrations",
  "polpo-react",
  "polpo-runtime",
];
const errors = [];

function read(path) {
  return readFileSync(path, "utf8");
}

function markdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(path);
    return entry.isFile() && entry.name.endsWith(".md") ? [path] : [];
  });
}

function parseFrontmatter(source, file) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) {
    errors.push(`${file}: missing YAML frontmatter`);
    return {};
  }
  const values = {};
  for (const line of match[1].split("\n")) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    values[line.slice(0, separator).trim()] = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
  }
  return values;
}

for (const name of expectedSkills) {
  const directory = join(root, name);
  const entrypoint = join(directory, "SKILL.md");
  if (!existsSync(entrypoint)) {
    errors.push(`${name}: missing SKILL.md`);
    continue;
  }

  const source = read(entrypoint);
  const frontmatter = parseFrontmatter(source, entrypoint);
  if (frontmatter.name !== name) errors.push(`${entrypoint}: frontmatter name must be ${name}`);
  if (!frontmatter.description || frontmatter.description.length < 30) {
    errors.push(`${entrypoint}: description is missing or not discriminating`);
  }

  const metadata = join(directory, "agents", "openai.yaml");
  if (!existsSync(metadata)) {
    errors.push(`${name}: missing agents/openai.yaml`);
  } else {
    const yaml = read(metadata);
    if (!yaml.includes("display_name:") || !yaml.includes("short_description:")) {
      errors.push(`${metadata}: incomplete UI metadata`);
    }
  }

  const contractVersion = join(directory, "references", "contract-version.md");
  if (!existsSync(contractVersion)) {
    errors.push(`${name}: missing references/contract-version.md`);
  }

  for (const file of markdownFiles(directory)) {
    const markdown = read(file);
    if (/\[TODO(?::|\])/i.test(markdown)) errors.push(`${file}: unfinished TODO placeholder`);

    const links = markdown.matchAll(/\[[^\]]+\]\(([^)#]+\.md)(?:#[^)]+)?\)/g);
    for (const link of links) {
      const target = resolve(dirname(file), link[1]);
      if (!existsSync(target) || !statSync(target).isFile()) {
        errors.push(`${file}: broken Markdown link ${link[1]}`);
      }
    }
  }
}

const allowedLegacyFiles = new Set([
  join(root, "polpo", "SKILL.md"),
  join(root, "polpo", "references", "project-layout.md"),
  join(root, "polpo-agents", "references", "contract-version.md"),
]);
for (const name of expectedSkills) {
  for (const file of markdownFiles(join(root, name))) {
    if (allowedLegacyFiles.has(file)) continue;
    const markdown = read(file);
    for (const pattern of [/\.polpo\/agents\.json/g, /\.polpo\/polpo\.json/g, /provider:model/g]) {
      if (pattern.test(markdown)) errors.push(`${file}: contains legacy contract ${pattern.source}`);
    }
  }
}

const ossRoot = resolve(process.env.POLPO_OSS_ROOT ?? join(root, "..", "polpo"));
const corePackage = join(ossRoot, "packages", "core", "package.json");
if (existsSync(corePackage)) {
  const currentVersion = JSON.parse(read(corePackage)).version;
  for (const name of expectedSkills) {
    const contract = join(root, name, "references", "contract-version.md");
    if (existsSync(contract) && !read(contract).includes(`\`${currentVersion}\``)) {
      errors.push(`${contract}: does not declare current OSS version ${currentVersion}`);
    }
  }
}

if (errors.length > 0) {
  console.error(`Skill validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validated ${expectedSkills.length} Polpo skills.`);
