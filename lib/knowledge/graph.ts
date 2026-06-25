import type { KnowledgeData, KnowledgeNode, KnowledgeRelationship } from "./types";

export function getRenderableRelationships(data: KnowledgeData) {
  const ids = new Set(data.nodes.map((node) => node.id));
  return data.relationships.filter(
    (relationship) => ids.has(relationship.source) && ids.has(relationship.target)
  );
}

function buildGraph(nodes: KnowledgeNode[], relationships: KnowledgeRelationship[]) {
  const ids = new Set(nodes.map((node) => node.id));
  const parents = new Map(nodes.map((node) => [node.id, [] as string[]]));
  const children = new Map(nodes.map((node) => [node.id, [] as string[]]));

  relationships.forEach((relationship) => {
    if (!ids.has(relationship.source) || !ids.has(relationship.target)) return;
    parents.get(relationship.target)?.push(relationship.source);
    children.get(relationship.source)?.push(relationship.target);
  });

  return { parents, children };
}

export function computeLayers(nodes: KnowledgeNode[], relationships: KnowledgeRelationship[]) {
  const { parents } = buildGraph(nodes, relationships);
  const visiting = new Set<string>();
  const resolved = new Map<string, number>();

  function resolve(id: string): number {
    if (resolved.has(id)) return resolved.get(id)!;
    if (visiting.has(id)) return 0;
    visiting.add(id);
    const dependencies = parents.get(id) ?? [];
    const layer = dependencies.length
      ? Math.max(...dependencies.map((dependency) => resolve(dependency))) + 1
      : 0;
    visiting.delete(id);
    resolved.set(id, layer);
    return layer;
  }

  nodes.forEach((node) => resolve(node.id));
  const layers: string[][] = [];
  nodes.forEach((node) => {
    const layer = resolved.get(node.id) ?? 0;
    (layers[layer] ??= []).push(node.id);
  });
  return layers;
}

export function getFocusedSubgraphIds(data: KnowledgeData, id: string) {
  const relationships = getRenderableRelationships(data);
  const prerequisites = relationships.filter((relationship) => relationship.type === "prerequisite");
  const prerequisiteGraph = buildGraph(data.nodes, prerequisites);
  const supportGraph = buildGraph(data.nodes, relationships);
  const focused = new Set<string>([id]);

  function collect(startId: string, adjacency: Map<string, string[]>) {
    const queue = [startId];
    while (queue.length) {
      const current = queue.shift()!;
      for (const next of adjacency.get(current) ?? []) {
        if (focused.has(next)) continue;
        focused.add(next);
        queue.push(next);
      }
    }
  }

  collect(id, prerequisiteGraph.parents);
  collect(id, supportGraph.children);
  return focused;
}

export function getRelationshipColor(type: KnowledgeRelationship["type"]) {
  return {
    prerequisite: "#67e8f9",
    application: "#f472b6",
    influence: "#fbbf24",
    "alternative-path": "#a78bfa"
  }[type];
}
