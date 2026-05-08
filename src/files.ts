import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

export type LoadedLogFile = {
  path: string;
  displayPath: string;
  content: string;
};

export async function expandInputs(inputs: string[], cwd: string): Promise<string[]> {
  const files = new Set<string>();
  for (const input of inputs) {
    const expanded = hasGlob(input) ? await expandGlob(input, cwd) : [path.resolve(cwd, input)];
    for (const file of expanded) files.add(file);
  }
  return [...files].sort();
}

export async function loadInputs(inputs: string[], cwd: string): Promise<LoadedLogFile[]> {
  const paths = await expandInputs(inputs, cwd);
  if (paths.length === 0) {
    throw new Error('No input files matched. Pass one or more log files or globs.');
  }

  const loaded: LoadedLogFile[] = [];
  for (const filePath of paths) {
    const info = await stat(filePath).catch(() => undefined);
    if (!info || !info.isFile()) continue;
    loaded.push({
      path: filePath,
      displayPath: path.relative(cwd, filePath) || path.basename(filePath),
      content: await readFile(filePath, 'utf8')
    });
  }

  if (loaded.length === 0) {
    throw new Error('No readable input files found after expansion.');
  }
  return loaded;
}

function hasGlob(value: string): boolean {
  return /[*?\[\]]/.test(value);
}

async function expandGlob(pattern: string, cwd: string): Promise<string[]> {
  const absolutePattern = path.resolve(cwd, pattern);
  const base = globBase(absolutePattern);
  const matcher = globToRegExp(absolutePattern);
  const found: string[] = [];
  await walk(base, async (candidate) => {
    if (matcher.test(candidate)) found.push(candidate);
  });
  return found;
}

function globBase(pattern: string): string {
  const parts = pattern.split(path.sep);
  const globIndex = parts.findIndex((part) => hasGlob(part));
  const baseParts = globIndex === -1 ? parts.slice(0, -1) : parts.slice(0, globIndex);
  return baseParts.join(path.sep) || path.sep;
}

async function walk(root: string, visit: (file: string) => Promise<void>): Promise<void> {
  const entries = await readdir(root, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    const candidate = path.join(root, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;
      await walk(candidate, visit);
    } else if (entry.isFile()) {
      await visit(candidate);
    }
  }
}

function globToRegExp(pattern: string): RegExp {
  const normalized = pattern.split(path.sep).join('/');
  let source = '^';
  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index];
    const next = normalized[index + 1];
    if (char === '*' && next === '*') {
      source += '.*';
      index += 1;
    } else if (char === '*') {
      source += '[^/]*';
    } else if (char === '?') {
      source += '[^/]';
    } else {
      source += escapeRegExp(char ?? '');
    }
  }
  source += '$';
  return new RegExp(source);
}

function escapeRegExp(value: string): string {
  return value.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
}
