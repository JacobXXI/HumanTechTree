import { writeFile } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(currentDirectory, "..");
const knowledgeData = require("../data/machine-learning-knowledge.js");
const outputPath = path.join(repositoryRoot, "data", "machine-learning-knowledge.json");

await writeFile(outputPath, `${JSON.stringify(knowledgeData, null, 2)}\n`, "utf8");

console.log(`Wrote ${path.relative(repositoryRoot, outputPath)}`);
