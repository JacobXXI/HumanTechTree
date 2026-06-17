(function (root, factory) {
  const graph = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = graph;
  }

  if (root) {
    root.HttKnowledgeGraph = graph;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function getNodeIds(data) {
    return new Set(data.nodes.map((node) => node.id));
  }

  function getFutureNodeIds(data) {
    return new Set((data.futureNodes || []).map((node) => node.id));
  }

  function getNodeIndex(data) {
    return new Map(data.nodes.map((node) => [node.id, node]));
  }

  function getFutureNodeIndex(data) {
    return new Map((data.futureNodes || []).map((node) => [node.id, node]));
  }

  function getNodeName(data, id) {
    return getNodeIndex(data).get(id)?.name || getFutureNodeIndex(data).get(id)?.name || id;
  }

  function getRenderableRelationships(data) {
    const nodeIds = getNodeIds(data);
    return data.relationships.filter(
      (relationship) => nodeIds.has(relationship.source) && nodeIds.has(relationship.target)
    );
  }

  function getIncomingRelationships(data, id, type) {
    return data.relationships.filter(
      (relationship) =>
        relationship.target === id && (!type || relationship.type === type)
    );
  }

  function getOutgoingRelationships(data, id, type) {
    return data.relationships.filter(
      (relationship) =>
        relationship.source === id && (!type || relationship.type === type)
    );
  }

  function getPrerequisiteIds(data, id) {
    return getIncomingRelationships(data, id, "prerequisite").map(
      (relationship) => relationship.source
    );
  }

  function getEnabledIds(data, id) {
    return getOutgoingRelationships(data, id).map((relationship) => relationship.target);
  }

  function getRelatedIds(data, id) {
    const related = new Set(id ? [id] : []);
    const nodeIds = getNodeIds(data);

    if (!id) return related;

    getRenderableRelationships(data).forEach((relationship) => {
      if (relationship.source === id && nodeIds.has(relationship.target)) {
        related.add(relationship.target);
      }
      if (relationship.target === id && nodeIds.has(relationship.source)) {
        related.add(relationship.source);
      }
    });

    return related;
  }

  function collectReachableIds(startId, adjacency, result) {
    const queue = [startId];

    while (queue.length) {
      const currentId = queue.shift();
      const nextIds = adjacency.get(currentId) || [];

      nextIds.forEach((nextId) => {
        if (result.has(nextId)) return;

        result.add(nextId);
        queue.push(nextId);
      });
    }
  }

  function getFocusedSubgraphIds(data, id) {
    const nodeIds = getNodeIds(data);
    const focused = new Set();

    if (!nodeIds.has(id)) return focused;

    const prerequisiteGraph = buildPrerequisiteGraph(data.nodes, data.relationships);
    const supportGraph = buildSupportGraph(data.nodes, data.relationships);
    focused.add(id);
    collectReachableIds(id, prerequisiteGraph.parents, focused);
    collectReachableIds(id, supportGraph.children, focused);

    return focused;
  }

  function buildRelationshipGraph(nodes, relationships, shouldIncludeRelationship) {
    const nodeIds = new Set(nodes.map((node) => node.id));
    const parents = new Map(nodes.map((node) => [node.id, []]));
    const children = new Map(nodes.map((node) => [node.id, []]));

    relationships
      .filter(
        (relationship) =>
          shouldIncludeRelationship(relationship) &&
          nodeIds.has(relationship.source) &&
          nodeIds.has(relationship.target)
      )
      .forEach((relationship) => {
        parents.get(relationship.target).push(relationship.source);
        children.get(relationship.source).push(relationship.target);
      });

    return { parents, children };
  }

  function buildPrerequisiteGraph(nodes, relationships) {
    return buildRelationshipGraph(
      nodes,
      relationships,
      (relationship) => relationship.type === "prerequisite"
    );
  }

  function buildSupportGraph(nodes, relationships) {
    return buildRelationshipGraph(nodes, relationships, () => true);
  }

  function computeLayers(nodes, parents) {
    const nodeOrder = new Map(nodes.map((node, index) => [node.id, index]));
    const visiting = new Set();
    const resolved = new Map();

    function getLayer(id) {
      if (resolved.has(id)) return resolved.get(id);
      if (visiting.has(id)) return 0;

      visiting.add(id);
      const prerequisites = parents.get(id) || [];
      const layer = prerequisites.length
        ? Math.max(...prerequisites.map((prerequisiteId) => getLayer(prerequisiteId))) + 1
        : 0;
      visiting.delete(id);
      resolved.set(id, layer);
      return layer;
    }

    nodes.forEach((node) => getLayer(node.id));

    return Array.from(resolved.entries()).reduce((layers, [id, layer]) => {
      if (!layers[layer]) layers[layer] = [];
      layers[layer].push(id);
      layers[layer].sort((a, b) => nodeOrder.get(a) - nodeOrder.get(b));
      return layers;
    }, []);
  }

  function orderLayers(layers, parents, children) {
    const orderedLayers = layers.map((layer) => [...layer]);
    const layerById = new Map();

    orderedLayers.forEach((layer, layerIndex) => {
      layer.forEach((id) => layerById.set(id, layerIndex));
    });

    function layerPositions() {
      const positions = new Map();
      orderedLayers.forEach((layer) => {
        layer.forEach((id, index) => positions.set(id, index));
      });
      return positions;
    }

    function getBarycenter(id, layerIndex, neighborDirection, positions) {
      const neighborLayer = layerIndex + neighborDirection;
      const neighbors = [...(parents.get(id) || []), ...(children.get(id) || [])].filter(
        (neighborId) => layerById.get(neighborId) === neighborLayer
      );

      if (!neighbors.length) return positions.get(id);

      return (
        neighbors.reduce((sum, neighborId) => sum + positions.get(neighborId), 0) /
        neighbors.length
      );
    }

    function reorderLayer(layerIndex, neighborDirection) {
      const positions = layerPositions();
      const layer = orderedLayers[layerIndex];

      layer.sort((a, b) => {
        const barycenterA = getBarycenter(a, layerIndex, neighborDirection, positions);
        const barycenterB = getBarycenter(b, layerIndex, neighborDirection, positions);
        if (barycenterA !== barycenterB) return barycenterA - barycenterB;
        return a.localeCompare(b);
      });
    }

    for (let pass = 0; pass < 4; pass += 1) {
      for (let layerIndex = 1; layerIndex < orderedLayers.length; layerIndex += 1) {
        reorderLayer(layerIndex, -1);
      }
      for (let layerIndex = orderedLayers.length - 2; layerIndex >= 0; layerIndex -= 1) {
        reorderLayer(layerIndex, 1);
      }
    }

    return orderedLayers;
  }

  function enforceMinimumSpacing(layer, coordinates) {
    if (layer.length < 2) return;

    const minGap = Math.min(0.24, 0.86 / (layer.length - 1));
    const ordered = [...layer].sort((a, b) => coordinates.get(a).x - coordinates.get(b).x);

    for (let index = 1; index < ordered.length; index += 1) {
      const previous = coordinates.get(ordered[index - 1]);
      const current = coordinates.get(ordered[index]);
      if (current.x - previous.x < minGap) current.x = previous.x + minGap;
    }

    const overflow = coordinates.get(ordered[ordered.length - 1]).x - 0.9;
    if (overflow > 0) {
      ordered.forEach((id) => {
        coordinates.get(id).x -= overflow;
      });
    }

    const underflow = 0.1 - coordinates.get(ordered[0]).x;
    if (underflow > 0) {
      ordered.forEach((id) => {
        coordinates.get(id).x += underflow;
      });
    }
  }

  function relaxLayerCoordinates(layers, parents, children, coordinates) {
    const layerById = new Map();
    layers.forEach((layer, layerIndex) => {
      layer.forEach((id) => layerById.set(id, layerIndex));
    });

    for (let pass = 0; pass < 6; pass += 1) {
      layers.forEach((layer, layerIndex) => {
        layer.forEach((id) => {
          const neighbors = [...(parents.get(id) || []), ...(children.get(id) || [])].filter(
            (neighborId) => Math.abs(layerById.get(neighborId) - layerIndex) === 1
          );
          if (!neighbors.length) return;

          const neighborCenter =
            neighbors.reduce((sum, neighborId) => sum + coordinates.get(neighborId).x, 0) /
            neighbors.length;
          const current = coordinates.get(id);
          current.x = current.x * 0.62 + neighborCenter * 0.38;
        });

        enforceMinimumSpacing(layer, coordinates);
      });
    }
  }

  function computeNormalizedPositions(nodes, relationships) {
    const { parents, children } = buildSupportGraph(nodes, relationships);
    const layers = orderLayers(computeLayers(nodes, parents), parents, children);
    const maxLayerIndex = Math.max(layers.length - 1, 1);
    const coordinates = new Map();

    layers.forEach((layer, layerIndex) => {
      layer.forEach((id, orderIndex) => {
        coordinates.set(id, {
          x: (orderIndex + 1) / (layer.length + 1),
          y: 1 - layerIndex / maxLayerIndex
        });
      });
    });

    relaxLayerCoordinates(layers, parents, children, coordinates);

    return coordinates;
  }

  function getRelationshipColor(type) {
    if (type === "prerequisite") return "#67e8f9";
    if (type === "application") return "#f472b6";
    if (type === "influence") return "#fbbf24";
    return "#c4b5fd";
  }

  return {
    buildPrerequisiteGraph,
    computeNormalizedPositions,
    getEnabledIds,
    getFutureNodeIds,
    getFutureNodeIndex,
    getFocusedSubgraphIds,
    getIncomingRelationships,
    getNodeIds,
    getNodeIndex,
    getNodeName,
    getOutgoingRelationships,
    getPrerequisiteIds,
    getRelatedIds,
    getRelationshipColor,
    getRenderableRelationships
  };
});
