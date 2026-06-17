import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const knowledgeData = require("../../src/data/machine-learning-knowledge.js");
const { validateKnowledgeData } = require("../../src/validation/knowledge-data-validation.js");

const result = validateKnowledgeData(knowledgeData);

if (!result.valid) {
  console.error("Knowledge data validation failed:");
  result.errors.forEach((error) => {
    console.error(`- ${error}`);
  });
  process.exit(1);
}

console.log("Knowledge data validation passed.");
