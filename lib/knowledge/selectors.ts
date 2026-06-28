import { getPrimaryDomain } from "./graph";
import type { KnowledgeData, KnowledgeNode } from "./types";

export function getNodeIndex(data: KnowledgeData) {
  return new Map(data.nodes.map((node) => [node.id, node]));
}

export function getNodeName(data: KnowledgeData, id: string) {
  return (
    getNodeIndex(data).get(id)?.name ??
    data.futureNodes.find((node) => node.id === id)?.name ??
    id
  );
}

export function getPrerequisiteIds(data: KnowledgeData, id: string) {
  return data.relationships
    .filter((relationship) => relationship.target === id && relationship.type === "prerequisite")
    .map((relationship) => relationship.source);
}

export function getEnabledIds(data: KnowledgeData, id: string) {
  return data.relationships
    .filter((relationship) => relationship.source === id)
    .map((relationship) => relationship.target);
}

export function matchesQuery(node: KnowledgeNode, query: string) {
  const haystack = [
    node.name,
    node.description,
    node.importance,
    node.status,
    ...node.tags
  ]
    .join(" ")
    .toLowerCase();

  return !query || haystack.includes(query.toLowerCase());
}

export function matchesCategory(node: KnowledgeNode, category: string) {
  return category === "all" || getPrimaryDomain(node) === category;
}

export function matchesNode(node: KnowledgeNode, query: string, category: string) {
  return matchesQuery(node, query) && matchesCategory(node, category);
}

export function getAvailableCategories(data: KnowledgeData) {
  return [...new Set(data.nodes.map((node) => getPrimaryDomain(node)))].sort();
}
