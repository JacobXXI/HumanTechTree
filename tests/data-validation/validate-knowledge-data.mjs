import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const knowledgeData = require("../../data/machine-learning-knowledge.js");
const allowedStatuses = new Set(["draft", "reviewed", "verified", "incomplete", "uncertain"]);
const allowedRelationshipTypes = new Set([
  "prerequisite",
  "influence",
  "application",
  "alternative-path"
]);
const errors = [];
const nodeIds = new Set();

for (const [index, node] of knowledgeData.nodes.entries()) {
  const label = node.id || `nodes[${index}]`;
  if (!node.id || nodeIds.has(node.id)) errors.push(`Invalid or duplicate node id "${node.id}".`);
  nodeIds.add(node.id);
  if (!node.name || !node.description || !node.importance) {
    errors.push(`${label} is missing required content.`);
  }
  if (!Array.isArray(node.tags) || !node.tags.length) errors.push(`${label} must include tags.`);
  if (!allowedStatuses.has(node.status)) errors.push(`${label} has invalid status "${node.status}".`);
  if (!Array.isArray(node.references) || !node.references.length) {
    errors.push(`${label} must include at least one reference.`);
  }
}

const futureIds = new Set((knowledgeData.futureNodes || []).map((node) => node.id));
const targetIds = new Set([...nodeIds, ...futureIds]);
const relationshipKeys = new Set();

for (const relationship of knowledgeData.relationships) {
  const label = `${relationship.source} -> ${relationship.target}`;
  const key = `${label}|${relationship.type}`;
  if (!nodeIds.has(relationship.source)) errors.push(`Relationship ${label} has an unknown source.`);
  if (!targetIds.has(relationship.target)) errors.push(`Relationship ${label} has an unknown target.`);
  if (!allowedRelationshipTypes.has(relationship.type)) {
    errors.push(`Relationship ${label} has invalid type "${relationship.type}".`);
  }
  if (!relationship.note) errors.push(`Relationship ${label} must include a note.`);
  if (relationshipKeys.has(key)) errors.push(`Duplicate relationship ${key}.`);
  relationshipKeys.add(key);
}

if (errors.length) {
  console.error("Knowledge data validation failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Knowledge data validation passed.");
