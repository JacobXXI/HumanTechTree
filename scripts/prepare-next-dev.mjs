import { rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(currentDirectory, "..");
const nextBuildDirectory = path.join(repositoryRoot, ".next");

await rm(nextBuildDirectory, { force: true, recursive: true });

console.log("Cleared .next before starting the development server.");
