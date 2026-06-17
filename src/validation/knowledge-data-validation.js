(function (root, factory) {
  const validation = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = validation;
  }

  if (root) {
    root.HttKnowledgeValidation = validation;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const ALLOWED_STATUSES = new Set(["draft", "reviewed", "verified", "incomplete", "uncertain"]);
  const ALLOWED_RELATIONSHIP_TYPES = new Set([
    "prerequisite",
    "influence",
    "application",
    "alternative-path"
  ]);
  const REQUIRED_NODE_FIELDS = [
    "id",
    "name",
    "tags",
    "description",
    "importance",
    "references",
    "status"
  ];

  function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
  }

  function isValidUrl(value) {
    if (!isNonEmptyString(value)) return false;

    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_error) {
      return false;
    }
  }

  function findDuplicateIds(items) {
    const seen = new Set();
    const duplicates = new Set();

    items.forEach((item) => {
      if (!isPlainObject(item) || !isNonEmptyString(item.id)) return;
      if (seen.has(item.id)) duplicates.add(item.id);
      seen.add(item.id);
    });

    return [...duplicates];
  }

  function validateNode(node, index, errors) {
    if (!isPlainObject(node)) {
      errors.push(`nodes[${index}] must be an object.`);
      return;
    }

    REQUIRED_NODE_FIELDS.forEach((field) => {
      if (!(field in node)) errors.push(`${node.id || `nodes[${index}]`} is missing ${field}.`);
    });

    if ("prerequisites" in node) {
      errors.push(`${node.id || `nodes[${index}]`} must not define node-level prerequisites.`);
    }

    if ("enabled" in node) {
      errors.push(`${node.id || `nodes[${index}]`} must not define node-level enabled ideas.`);
    }

    if (!isNonEmptyString(node.id)) errors.push(`nodes[${index}] has an invalid id.`);
    if (!isNonEmptyString(node.name)) errors.push(`${node.id || `nodes[${index}]`} has an invalid name.`);
    if (!Array.isArray(node.tags) || !node.tags.every(isNonEmptyString)) {
      errors.push(`${node.id || `nodes[${index}]`} must define tags as non-empty strings.`);
    }
    if (!isNonEmptyString(node.description)) {
      errors.push(`${node.id || `nodes[${index}]`} has an invalid description.`);
    }
    if (!isNonEmptyString(node.importance)) {
      errors.push(`${node.id || `nodes[${index}]`} has an invalid importance.`);
    }
    if (!ALLOWED_STATUSES.has(node.status)) {
      errors.push(`${node.id || `nodes[${index}]`} has invalid status "${node.status}".`);
    }

    if (!Array.isArray(node.references) || !node.references.length) {
      errors.push(`${node.id || `nodes[${index}]`} must include at least one reference.`);
      return;
    }

    node.references.forEach((reference, referenceIndex) => {
      const label = `${node.id || `nodes[${index}]`}.references[${referenceIndex}]`;
      if (!isPlainObject(reference)) {
        errors.push(`${label} must be an object.`);
        return;
      }
      if (!isNonEmptyString(reference.title)) errors.push(`${label} has an invalid title.`);
      if (!isValidUrl(reference.url)) errors.push(`${label} has an invalid URL.`);
      if (!isNonEmptyString(reference.type)) errors.push(`${label} has an invalid type.`);
    });
  }

  function validateFutureNode(futureNode, index, errors) {
    if (!isPlainObject(futureNode)) {
      errors.push(`futureNodes[${index}] must be an object.`);
      return;
    }

    if (!isNonEmptyString(futureNode.id)) errors.push(`futureNodes[${index}] has an invalid id.`);
    if (!isNonEmptyString(futureNode.name)) {
      errors.push(`${futureNode.id || `futureNodes[${index}]`} has an invalid name.`);
    }
  }

  function validateRelationship(relationship, index, ids, errors) {
    const { nodeIds, targetIds } = ids;

    if (!isPlainObject(relationship)) {
      errors.push(`relationships[${index}] must be an object.`);
      return;
    }

    const label = `${relationship.source || "unknown"} -> ${relationship.target || "unknown"}`;
    if (!nodeIds.has(relationship.source)) {
      errors.push(`Relationship ${label} has an unknown source.`);
    }
    if (!targetIds.has(relationship.target)) {
      errors.push(`Relationship ${label} has an unknown target.`);
    }
    if (!ALLOWED_RELATIONSHIP_TYPES.has(relationship.type)) {
      errors.push(`Relationship ${label} has invalid type "${relationship.type}".`);
    }
    if (!isNonEmptyString(relationship.note)) {
      errors.push(`Relationship ${label} must include a note.`);
    }
  }

  function findPrerequisiteCycles(nodes, relationships) {
    const nodeIds = new Set(nodes.map((node) => node.id));
    const adjacency = new Map(nodes.map((node) => [node.id, []]));
    const visiting = new Set();
    const visited = new Set();
    const stack = [];
    const cycles = [];

    relationships
      .filter(
        (relationship) =>
          relationship.type === "prerequisite" &&
          nodeIds.has(relationship.source) &&
          nodeIds.has(relationship.target)
      )
      .forEach((relationship) => {
        adjacency.get(relationship.source).push(relationship.target);
      });

    function visit(id) {
      if (visiting.has(id)) {
        const cycleStart = stack.indexOf(id);
        cycles.push([...stack.slice(cycleStart), id].join(" -> "));
        return;
      }
      if (visited.has(id)) return;

      visiting.add(id);
      stack.push(id);
      adjacency.get(id).forEach(visit);
      stack.pop();
      visiting.delete(id);
      visited.add(id);
    }

    nodes.forEach((node) => visit(node.id));

    return cycles;
  }

  function validateKnowledgeData(data) {
    const errors = [];

    if (!isPlainObject(data)) {
      return {
        valid: false,
        errors: ["Knowledge data must be an object."]
      };
    }

    if (!Array.isArray(data.nodes)) errors.push("Knowledge data must include a nodes array.");
    if (!Array.isArray(data.relationships)) {
      errors.push("Knowledge data must include a relationships array.");
    }
    if (data.futureNodes && !Array.isArray(data.futureNodes)) {
      errors.push("futureNodes must be an array when present.");
    }

    if (errors.length) {
      return {
        valid: false,
        errors
      };
    }

    const futureNodes = data.futureNodes || [];
    data.nodes.forEach((node, index) => validateNode(node, index, errors));
    futureNodes.forEach((futureNode, index) => validateFutureNode(futureNode, index, errors));

    findDuplicateIds(data.nodes).forEach((id) => errors.push(`Duplicate node id "${id}".`));
    findDuplicateIds(futureNodes).forEach((id) => errors.push(`Duplicate future node id "${id}".`));

    const nodeIds = new Set(data.nodes.map((node) => node.id));
    const futureNodeIds = new Set(futureNodes.map((node) => node.id));
    futureNodeIds.forEach((id) => {
      if (nodeIds.has(id)) errors.push(`Future node id "${id}" conflicts with a current node.`);
    });

    const targetIds = new Set([...nodeIds, ...futureNodeIds]);
    const relationshipKeys = new Set();

    data.relationships.forEach((relationship, index) => {
      validateRelationship(relationship, index, { nodeIds, targetIds }, errors);

      if (isPlainObject(relationship)) {
        const key = `${relationship.source}|${relationship.target}|${relationship.type}`;
        if (relationshipKeys.has(key)) errors.push(`Duplicate relationship ${key}.`);
        relationshipKeys.add(key);
      }
    });

    findPrerequisiteCycles(data.nodes, data.relationships).forEach((cycle) => {
      errors.push(`Prerequisite cycle detected: ${cycle}.`);
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  return {
    ALLOWED_RELATIONSHIP_TYPES,
    ALLOWED_STATUSES,
    validateKnowledgeData
  };
});
