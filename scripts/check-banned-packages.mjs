import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const bannedPackages = new Set(["plain-crypto-js", "axios"]);
const packageJsonPath = path.join(rootDir, "package.json");
const packageLockPath = path.join(rootDir, "package-lock.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function collectManifestHits(manifest) {
  const sections = [
    "dependencies",
    "devDependencies",
    "optionalDependencies",
    "peerDependencies",
    "overrides",
  ];
  const hits = [];

  for (const section of sections) {
    const entries = manifest?.[section];
    if (!entries || typeof entries !== "object") {
      continue;
    }

    for (const name of Object.keys(entries)) {
      if (bannedPackages.has(name)) {
        hits.push(`package.json -> ${section}.${name}`);
      }
    }
  }

  return hits;
}

function collectLockfileHits(lockfile) {
  const hits = [];
  const packages = lockfile?.packages;

  if (packages && typeof packages === "object") {
    for (const [packagePath, metadata] of Object.entries(packages)) {
      const packageName =
        packagePath.startsWith("node_modules/")
          ? packagePath.slice("node_modules/".length)
          : metadata?.name;

      if (packageName && bannedPackages.has(packageName)) {
        hits.push(`package-lock.json -> packages[${packagePath || "."}]`);
      }
    }
  }

  const rootDependencies = lockfile?.dependencies;
  if (rootDependencies && typeof rootDependencies === "object") {
    for (const name of Object.keys(rootDependencies)) {
      if (bannedPackages.has(name)) {
        hits.push(`package-lock.json -> dependencies.${name}`);
      }
    }
  }

  return hits;
}

const manifest = readJson(packageJsonPath);
const lockfile = readJson(packageLockPath);
const hits = [
  ...collectManifestHits(manifest),
  ...collectLockfileHits(lockfile),
];

if (hits.length > 0) {
  console.error("Banned packages detected:");
  for (const hit of hits) {
    console.error(`- ${hit}`);
  }
  console.error(
    "Remove `plain-crypto-js` and `axios` from the project before installing dependencies.",
  );
  process.exit(1);
}

console.log("Dependency guard passed: no banned packages found.");
