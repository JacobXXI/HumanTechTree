const data = window.machineLearningKnowledge;
const state = {
  selectedId: null,
  view: "tree",
  filter: "all",
  query: ""
};

const nodeList = document.querySelector("#nodeList");
const treeView = document.querySelector("#treeView");
const graphNodes = document.querySelector("#graphNodes");
const edgeLayer = document.querySelector("#edgeLayer");
const introPage = document.querySelector("#introPage");
const searchInput = document.querySelector("#searchInput");
const filterButtons = Array.from(document.querySelectorAll(".filter-button"));

const nodesById = new Map(data.nodes.map((node) => [node.id, node]));
const futureIdeaNames = {
  "ensemble-methods": "Ensemble Methods",
  "representation-learning": "Representation Learning",
  "deep-learning": "Deep Learning",
  "large-language-models": "Large Language Models"
};

function matchesNode(node) {
  const haystack = [
    node.name,
    node.description,
    node.importance,
    node.difficulty,
    node.status,
    ...node.tags
  ]
    .join(" ")
    .toLowerCase();
  const matchesQuery = !state.query || haystack.includes(state.query.toLowerCase());
  const matchesFilter = state.filter === "all" || node.tags.includes(state.filter);
  return matchesQuery && matchesFilter;
}

function getRelatedIds(id) {
  const related = new Set(id ? [id] : []);
  if (!id) return related;
  data.relationships.forEach((relationship) => {
    if (relationship.source === id) related.add(relationship.target);
    if (relationship.target === id) related.add(relationship.source);
  });
  return related;
}

function getNodeName(id) {
  return nodesById.get(id)?.name || futureIdeaNames[id] || id;
}

function buildPrerequisiteGraph(nodes) {
  const nodeIds = new Set(nodes.map((node) => node.id));
  const parents = new Map(nodes.map((node) => [node.id, []]));
  const children = new Map(nodes.map((node) => [node.id, []]));

  nodes.forEach((node) => {
    node.prerequisites
      .filter((prerequisiteId) => nodeIds.has(prerequisiteId))
      .forEach((prerequisiteId) => {
        parents.get(node.id).push(prerequisiteId);
        children.get(prerequisiteId).push(node.id);
      });
  });

  return { parents, children };
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

  function getBarycenter(id, layerIndex, neighborDirection, positions) {
    const neighborLayer = layerIndex + neighborDirection;
    const neighbors = [...(parents.get(id) || []), ...(children.get(id) || [])].filter(
      (neighborId) => layerById.get(neighborId) === neighborLayer
    );

    if (!neighbors.length) return positions.get(id);

    return (
      neighbors.reduce((sum, neighborId) => sum + positions.get(neighborId), 0) / neighbors.length
    );
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

function enforceMinimumSpacing(layer, coordinates) {
  if (layer.length < 2) return;

  const minGap = Math.min(0.18, 0.72 / (layer.length - 1));
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

function computeNormalizedPositions(nodes) {
  const { parents, children } = buildPrerequisiteGraph(nodes);
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

function renderNodeList() {
  const filteredNodes = data.nodes.filter(matchesNode);
  nodeList.innerHTML = "";

  if (!filteredNodes.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No matching knowledge nodes.";
    nodeList.append(empty);
    return;
  }

  filteredNodes.forEach((node) => {
    const button = document.createElement("button");
    button.className = `node-button${node.id === state.selectedId ? " is-active" : ""}`;
    button.type = "button";
    button.dataset.id = node.id;
    button.innerHTML = `
      <strong>${node.name}</strong>
      <span>${node.tags.slice(0, 2).join(" / ")} - ${node.difficulty}</span>
    `;
    button.addEventListener("click", () => openIntro(node.id));
    nodeList.append(button);
  });
}

function renderGraph() {
  const selectedRelated = getRelatedIds(state.selectedId);
  const panelRect = graphNodes.getBoundingClientRect();
  const width = panelRect.width || 900;
  const height = panelRect.height || 520;
  const nodeWidth = width < 620 ? 116 : 150;
  const nodeHeight = 58;
  const paddingX = 18;
  const paddingTop = 56;
  const paddingBottom = 36;
  const usableWidth = width - nodeWidth - paddingX * 2;
  const usableHeight = height - nodeHeight - paddingTop - paddingBottom;
  const normalizedPositions = computeNormalizedPositions(data.nodes);
  const positions = new Map();

  graphNodes.innerHTML = "";
  edgeLayer.innerHTML = "";
  edgeLayer.setAttribute("viewBox", `0 0 ${width} ${height}`);
  edgeLayer.innerHTML = `
    <defs>
    </defs>
  `;

  data.nodes.forEach((node) => {
    const spot = normalizedPositions.get(node.id);
    const x = Math.min(width - nodeWidth - paddingX, Math.max(paddingX, paddingX + spot.x * usableWidth));
    const y = Math.min(
      height - nodeHeight - paddingBottom,
      Math.max(paddingTop, paddingTop + spot.y * usableHeight)
    );
    positions.set(node.id, {
      x,
      y,
      top: y,
      bottom: y + nodeHeight,
      cx: x + nodeWidth / 2
    });

    const button = document.createElement("button");
    button.className = "graph-node";
    if (node.id === state.selectedId) button.classList.add("is-selected");
    if (state.selectedId && selectedRelated.has(node.id) && node.id !== state.selectedId) {
      button.classList.add("is-related");
    }
    if (state.selectedId && !selectedRelated.has(node.id)) button.classList.add("is-dimmed");
    button.type = "button";
    button.style.left = `${x}px`;
    button.style.top = `${y}px`;
    button.dataset.id = node.id;
    button.innerHTML = `<strong>${node.name}</strong><span>${node.difficulty}</span>`;
    button.addEventListener("click", () => openIntro(node.id));
    graphNodes.append(button);
  });

  data.relationships.forEach((relationship) => {
    const source = positions.get(relationship.source);
    const target = positions.get(relationship.target);
    const selectedEdge =
      relationship.source === state.selectedId || relationship.target === state.selectedId;
    const color = relationship.type === "prerequisite" ? "#0f766e" : "#9d174d";
    const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const verticalDistance = Math.abs(target.bottom - source.top);
    const curve = Math.max(36, verticalDistance * 0.42);
    const horizontalBend = (target.cx - source.cx) * 0.12;
    line.setAttribute(
      "d",
      `M ${source.cx} ${source.top} C ${source.cx + horizontalBend} ${source.top - curve}, ${target.cx - horizontalBend} ${target.bottom + curve}, ${target.cx} ${target.bottom}`
    );
    line.setAttribute("fill", "none");
    line.setAttribute("stroke", color);
    line.setAttribute("stroke-width", selectedEdge ? "3" : "1.6");
    line.setAttribute("opacity", selectedEdge ? "0.88" : "0.34");
    edgeLayer.append(line);
  });
}

function renderIntroPage() {
  const node = nodesById.get(state.selectedId);
  const prerequisiteNames = node.prerequisites.map(getNodeName);
  const enabledNames = node.enabled.map(getNodeName);

  introPage.innerHTML = `
    <button id="backToTree" class="back-button" type="button">Back</button>
    <div class="meta-row">
      ${node.tags.map((tag) => `<span class="chip ${tag === "Mathematics" ? "math" : ""}">${tag}</span>`).join("")}
      <span class="chip diff">${node.difficulty}</span>
      <span class="chip status">${node.status}</span>
    </div>
    <h2>${node.name}</h2>
    <p>${node.description}</p>
    <p><strong>Why it matters:</strong> ${node.importance}</p>
    <p class="section-label">Prerequisites</p>
    <div class="chip-row">
      ${prerequisiteNames.length ? prerequisiteNames.map((name) => `<span class="chip">${name}</span>`).join("") : '<span class="chip">Entry point</span>'}
    </div>
    <p class="section-label">Enables</p>
    <div class="chip-row">
      ${enabledNames.map((name) => `<span class="chip">${name}</span>`).join("")}
    </div>
    <p class="section-label">References</p>
    <div class="reference-list">
      ${node.references
        .map(
          (reference) =>
            `<a class="link-button" href="${reference.url}" target="_blank" rel="noreferrer">${reference.title}</a>`
        )
        .join("")}
    </div>
  `;
  document.querySelector("#backToTree").addEventListener("click", showTree);
}

function openIntro(id) {
  state.selectedId = id;
  state.view = "intro";
  render();
}

function showTree() {
  state.view = "tree";
  render();
}

function renderView() {
  const showingTree = state.view === "tree";
  treeView.classList.toggle("is-active", showingTree);
  treeView.hidden = !showingTree;
  introPage.hidden = showingTree;

  if (showingTree) {
    renderGraph();
  } else {
    renderIntroPage();
  }
}

function render() {
  renderNodeList();
  renderView();
}

searchInput.addEventListener("input", (event) => {
  state.query = event.target.value.trim();
  renderNodeList();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.filter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    renderNodeList();
  });
});

window.addEventListener("resize", () => {
  if (state.view === "tree") renderGraph();
});

render();
