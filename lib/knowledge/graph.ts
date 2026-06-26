import type { KnowledgeData, KnowledgeNode, KnowledgeRelationship } from "./types";

export interface ConePosition {
  angle: number;
  layer: number;
  radius: number;
  x: number;
  y: number;
  z: number;
}

export interface ConeLayout {
  domainColors: Map<string, string>;
  layers: string[][];
  nodeDomains: Map<string, string>;
  positions: Map<string, ConePosition>;
  relationships: KnowledgeRelationship[];
}

export interface ConeCamera {
  pitch: number;
  viewOffsetY: number;
  yaw: number;
  zoom: number;
}

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

function orderLayers(
  layers: string[][],
  parents: Map<string, string[]>,
  children: Map<string, string[]>
) {
  const orderedLayers = layers.map((layer) => [...layer]);
  const layerById = new Map<string, number>();

  orderedLayers.forEach((layer, layerIndex) => {
    layer.forEach((id) => layerById.set(id, layerIndex));
  });

  function getPositions() {
    const positions = new Map<string, number>();
    orderedLayers.forEach((layer) => {
      layer.forEach((id, index) => positions.set(id, index));
    });
    return positions;
  }

  function reorderLayer(layerIndex: number, neighborDirection: -1 | 1) {
    const positions = getPositions();
    const layer = orderedLayers[layerIndex];

    layer.sort((left, right) => {
      const getBarycenter = (id: string) => {
        const neighborLayer = layerIndex + neighborDirection;
        const neighbors = [...(parents.get(id) ?? []), ...(children.get(id) ?? [])].filter(
          (neighborId) => layerById.get(neighborId) === neighborLayer
        );
        if (!neighbors.length) return positions.get(id) ?? 0;
        return (
          neighbors.reduce((sum, neighborId) => sum + (positions.get(neighborId) ?? 0), 0) /
          neighbors.length
        );
      };

      const difference = getBarycenter(left) - getBarycenter(right);
      return difference || left.localeCompare(right);
    });
  }

  for (let pass = 0; pass < 4; pass += 1) {
    for (let index = 1; index < orderedLayers.length; index += 1) {
      reorderLayer(index, -1);
    }
    for (let index = orderedLayers.length - 2; index >= 0; index -= 1) {
      reorderLayer(index, 1);
    }
  }

  return orderedLayers;
}

export function getOrderedLayers(
  nodes: KnowledgeNode[],
  relationships: KnowledgeRelationship[]
) {
  const { parents, children } = buildGraph(nodes, relationships);
  return orderLayers(computeLayers(nodes, relationships), parents, children);
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

export function getRelatedIds(data: KnowledgeData, id: string) {
  const related = new Set<string>([id]);
  getRenderableRelationships(data).forEach((relationship) => {
    if (relationship.source === id) related.add(relationship.target);
    if (relationship.target === id) related.add(relationship.source);
  });
  return related;
}

export function getPrimaryDomain(node: KnowledgeNode) {
  const tags = node.tags ?? [];

  if (tags.includes("Deep Learning")) return "Deep Learning";
  if (tags.includes("Machine Learning")) return "Machine Learning";
  if (tags.includes("Statistics") || tags.includes("Probability")) return "Statistics";
  if (tags.includes("Mathematics")) return "Mathematics";
  if (tags.includes("Computer Science") || tags.includes("Algorithm")) return "Computer Science";
  if (
    tags.includes("Computing Hardware") ||
    tags.includes("Computing Systems") ||
    tags.includes("Machine Learning Infrastructure")
  ) {
    return "Computing Systems";
  }
  if (tags.includes("Data Science")) return "Data Science";

  return tags[0] || "Other";
}

export function getDomainColor(domain: string) {
  const colors: Record<string, string> = {
    "Computer Science": "#60a5fa",
    "Computing Systems": "#a78bfa",
    "Data Science": "#34d399",
    "Deep Learning": "#f472b6",
    "Machine Learning": "#22d3ee",
    Mathematics: "#fbbf24",
    Other: "#cbd5e1",
    Statistics: "#fb7185"
  };

  return colors[domain] ?? colors.Other;
}

export function computeConeLayout(data: KnowledgeData): ConeLayout {
  const relationships = getRenderableRelationships(data);
  const layers = getOrderedLayers(data.nodes, relationships);
  const nodeIndex = new Map(data.nodes.map((node) => [node.id, node]));
  const maxLayerIndex = Math.max(layers.length - 1, 1);
  const positions = new Map<string, ConePosition>();
  const nodeDomains = new Map<string, string>();

  layers.forEach((layer, layerIndex) => {
    const layerProgress = layerIndex / maxLayerIndex;
    const radius = 7.8 - (7.8 - 1.25) * layerProgress;
    const y = (layerIndex - maxLayerIndex / 2) * 2.35;
    const angleOffset = layerIndex * 0.42;

    layer.forEach((id, orderIndex) => {
      const angle = angleOffset + (Math.PI * 2 * orderIndex) / Math.max(layer.length, 1);
      const node = nodeIndex.get(id);
      const domain = node ? getPrimaryDomain(node) : "Other";

      positions.set(id, {
        angle,
        layer: layerIndex,
        radius,
        x: Math.cos(angle) * radius,
        y,
        z: Math.sin(angle) * radius
      });
      nodeDomains.set(id, domain);
    });
  });

  const domains = [...new Set(nodeDomains.values())].sort();
  return {
    domainColors: new Map(domains.map((domain) => [domain, getDomainColor(domain)])),
    layers,
    nodeDomains,
    positions,
    relationships
  };
}

export function getRelationshipColor(type: KnowledgeRelationship["type"]) {
  return {
    prerequisite: "#67e8f9",
    application: "#f472b6",
    influence: "#fbbf24",
    "alternative-path": "#a78bfa"
  }[type];
}
