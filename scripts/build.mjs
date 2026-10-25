import { cp, mkdir, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const validation = spawnSync(process.execPath, ["scripts/validate.mjs"], {
  stdio: "inherit",
});

if (validation.status !== 0) process.exit(validation.status ?? 1);

const outputDirectory = "dist";
const files = [
  "index.html",
  "icon.svg",
  "robots.txt",
  "site.webmanifest",
];
const directories = ["data", "lessons"];

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

for (const file of files) {
  await cp(file, `${outputDirectory}/${file}`);
}

for (const directory of directories) {
  await cp(directory, `${outputDirectory}/${directory}`, { recursive: true });
}

console.log(`Static site built in ${outputDirectory}/.`);
