#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
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
const MAX_DESCRIPTION_CHARS = 1024;
const MIN_DESCRIPTION_CHARS = 120;
const MAX_SKILL_LINES = 500;
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

function markdownLinks(markdown) {
  return [...markdown.matchAll(/\[[^\]]+\]\(([^)#]+\.md)(?:#[^)]+)?\)/g)].map((match) => match[1]);
}

const ossRoot = resolve(process.env.POLPO_OSS_ROOT ?? join(root, "..", "polpo"));
const corePackage = join(ossRoot, "packages", "core", "package.json");
const currentVersion = existsSync(corePackage) ? JSON.parse(read(corePackage)).version : null;
if (!currentVersion) {
  console.warn(`Polpo OSS checkout not found at ${ossRoot}; skipping the version freshness check.`);
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
  const description = frontmatter.description ?? "";
  if (description.length < MIN_DESCRIPTION_CHARS) {
    errors.push(`${entrypoint}: description is missing or too short to trigger reliably`);
  }
  if (description.length > MAX_DESCRIPTION_CHARS) {
    errors.push(`${entrypoint}: description is ${description.length} characters (limit ${MAX_DESCRIPTION_CHARS})`);
  }
  if (!/\buse (this|it) whenever\b/i.test(description)) {
    errors.push(`${entrypoint}: description should say when to use the skill ("Use this whenever ...")`);
  }
  const lineCount = source.split("\n").length;
  if (lineCount > MAX_SKILL_LINES) {
    errors.push(`${entrypoint}: ${lineCount} lines; move detail into references/ (limit ${MAX_SKILL_LINES})`);
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
  } else {
    const declared = read(contractVersion).match(/^verified-against: `([^`]+)`$/m)?.[1];
    if (!declared) {
      errors.push(`${contractVersion}: missing a "verified-against: \`x.y.z\`" line`);
    } else if (currentVersion && declared !== currentVersion) {
      errors.push(`${contractVersion}: verified against ${declared}, but Polpo OSS is ${currentVersion}; re-check the skill and update it`);
    }
  }

  // Every reference must be reachable from SKILL.md, or the agent never loads it.
  const referencesDir = join(directory, "references");
  if (existsSync(referencesDir)) {
    const linked = new Set(markdownLinks(source).map((link) => resolve(directory, link)));
    for (const file of markdownFiles(referencesDir)) {
      if (!linked.has(file)) errors.push(`${relative(root, file)}: not linked from ${name}/SKILL.md`);
    }
  }

  for (const file of markdownFiles(directory)) {
    const markdown = read(file);
    if (/\[TODO(?::|\])/i.test(markdown)) errors.push(`${file}: unfinished TODO placeholder`);
    // Release bookkeeping belongs in CHANGELOG.md, which coding agents never load.
    if (/release tracking|\bPRs? #\d+/i.test(markdown)) {
      errors.push(`${file}: contains release bookkeeping; move it to CHANGELOG.md`);
    }

    for (const link of markdownLinks(markdown)) {
      const target = resolve(dirname(file), link);
      if (!existsSync(target) || !statSync(target).isFile()) {
        errors.push(`${file}: broken Markdown link ${link}`);
      }
    }
  }
}

const allowedLegacyFiles = new Set([
  join(root, "polpo", "SKILL.md"),
  join(root, "polpo", "references", "project-layout.md"),
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

const evals = join(root, "evals", "evals.json");
if (existsSync(evals)) {
  const parsed = JSON.parse(read(evals));
  for (const entry of parsed.evals ?? []) {
    if (!expectedSkills.includes(entry.skill)) errors.push(`${basename(evals)}: eval ${entry.id} names unknown skill ${entry.skill}`);
  }
}

if (errors.length > 0) {
  console.error(`Skill validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validated ${expectedSkills.length} Polpo skills${currentVersion ? ` against Polpo OSS ${currentVersion}` : ""}.`);
