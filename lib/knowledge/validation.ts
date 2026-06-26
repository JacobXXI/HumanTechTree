import type { KnowledgeData } from "./types";

const statuses = new Set(["draft", "reviewed", "verified", "incomplete", "uncertain"]);
const relationshipTypes = new Set([
  "prerequisite",
  "influence",
  "application",
  "alternative-path"
]);

export function validateKnowledgeData(data: KnowledgeData) {
  const errors: string[] = [];
  const ids = new Set<string>();

  for (const node of data.nodes) {
    if (!node.id || ids.has(node.id)) errors.push(`Invalid or duplicate node id "${node.id}".`);
    ids.add(node.id);
    if (!node.name || !node.description || !node.importance) {
      errors.push(`${node.id} is missing required content.`);
    }
    if (!statuses.has(node.status)) errors.push(`${node.id} has invalid status "${node.status}".`);
    if (!node.references.length) errors.push(`${node.id} must include at least one reference.`);
  }

  const targets = new Set([...ids, ...data.futureNodes.map((node) => node.id)]);
  for (const relationship of data.relationships) {
    if (!ids.has(relationship.source) || !targets.has(relationship.target)) {
      errors.push(`Relationship ${relationship.source} -> ${relationship.target} has an unknown node.`);
    }
    if (!relationshipTypes.has(relationship.type)) {
      errors.push(`Relationship ${relationship.source} -> ${relationship.target} has an invalid type.`);
    }
  }

  return { valid: errors.length === 0, errors };
}
