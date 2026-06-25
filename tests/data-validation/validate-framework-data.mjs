import { readFile } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(currentDirectory, "..", "..");
const knowledgeData = require("../../src/data/machine-learning-knowledge.js");
const { validateKnowledgeData } = require("../../src/validation/knowledge-data-validation.js");
const frameworkDataPath = path.join(repositoryRoot, "data", "machine-learning-knowledge.json");

const frameworkData = JSON.parse(await readFile(frameworkDataPath, "utf8"));
const validationResult = validateKnowledgeData(frameworkData);

if (!validationResult.valid) {
  console.error("Framework-neutral knowledge data validation failed:");
  validationResult.errors.forEach((error) => {
    console.error(`- ${error}`);
  });
  process.exit(1);
}

if (JSON.stringify(frameworkData) !== JSON.stringify(knowledgeData)) {
  console.error(
    'Framework-neutral knowledge data is out of sync with src/data/machine-learning-knowledge.js. Run "npm run export:framework-data".'
  );
  process.exit(1);
}

console.log("Framework-neutral knowledge data validation passed.");
