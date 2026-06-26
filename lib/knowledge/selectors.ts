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

export function matchesNode(node: KnowledgeNode, query: string, filter: string) {
  const haystack = [
    node.name,
    node.description,
    node.importance,
    node.status,
    ...node.tags
  ]
    .join(" ")
    .toLowerCase();

  return (
    (!query || haystack.includes(query.toLowerCase())) &&
    (filter === "all" || node.tags.includes(filter))
  );
}

export function getAvailableTags(data: KnowledgeData) {
  return [...new Set(data.nodes.flatMap((node) => node.tags))].sort();
}
