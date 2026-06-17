const DATA_SCRIPT_PATH = "data/machine-learning-knowledge.js";

let data = null;
const state = {
  selectedId: null,
  view: "tree",
  filter: "all",
  query: ""
};

const nodeList = document.querySelector("#nodeList");
const treeView = document.querySelector("#treeView");
const networkCanvas = document.querySelector("#networkBackground");
const graphPanel = document.querySelector(".graph-panel");
const graphViewport = document.querySelector("#graphViewport");
const graphNodes = document.querySelector("#graphNodes");
const edgeLayer = document.querySelector("#edgeLayer");
const introPage = document.querySelector("#introPage");
const searchInput = document.querySelector("#searchInput");
const filterButtons = Array.from(document.querySelectorAll(".filter-button"));
const zoomInButton = document.querySelector("#zoomIn");
const zoomOutButton = document.querySelector("#zoomOut");
const zoomResetButton = document.querySelector("#zoomReset");
const networkContext = networkCanvas?.getContext("2d");
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

let nodesById = new Map();
const networkState = {
  frameId: null,
  height: 0,
  lastTimestamp: 0,
  particles: [],
  pixelRatio: 1,
  width: 0
};
const graphTransform = {
  dragDistance: 0,
  dragStartX: 0,
  dragStartY: 0,
  isDragging: false,
  maxScale: 2.4,
  minScale: 0.55,
  originX: 0,
  originY: 0,
  scale: 1,
  suppressClick: false,
  x: 0,
  y: 0
};
const futureIdeaNames = {
  "ensemble-methods": "Ensemble Methods",
  "representation-learning": "Representation Learning",
  "deep-learning": "Deep Learning",
  "large-language-models": "Large Language Models"
};

function loadDataScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      reject(new Error(`Could not load ${src}`));
    };
    document.head.append(script);
  });
}

async function loadKnowledgeData() {
  if (window.machineLearningKnowledge) return window.machineLearningKnowledge;

  await loadDataScript(DATA_SCRIPT_PATH);
  if (window.machineLearningKnowledge) return window.machineLearningKnowledge;

  throw new Error(`${DATA_SCRIPT_PATH} loaded without knowledge data.`);
}

function showLoadError(error) {
  console.error(error);
  nodeList.innerHTML = "";

  const empty = document.createElement("p");
  empty.className = "empty-state";
  empty.textContent =
    "Unable to load knowledge data. Keep data/machine-learning-knowledge.js with the root app files.";
  nodeList.append(empty);

  graphNodes.innerHTML = "";
  edgeLayer.innerHTML = "";
}

function randomBetween(minimum, maximum) {
  return minimum + Math.random() * (maximum - minimum);
}

function createNetworkParticle(width, height) {
  const angle = randomBetween(0, Math.PI * 2);
  const speed = randomBetween(14, 34);

  return {
    alpha: randomBetween(0.48, 0.9),
    phase: randomBetween(0, Math.PI * 2),
    radius: randomBetween(1.2, 2.4),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    x: randomBetween(0, width),
    y: randomBetween(0, height)
  };
}

function seedNetworkParticles(width, height) {
  const particleCount = Math.round(Math.min(92, Math.max(44, (width * height) / 11000)));
  networkState.particles = Array.from({ length: particleCount }, () =>
    createNetworkParticle(width, height)
  );
}

function resizeNetworkBackground() {
  if (!networkCanvas || !networkContext) return;

  const rect = networkCanvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const sizeChanged =
    width !== networkState.width ||
    height !== networkState.height ||
    pixelRatio !== networkState.pixelRatio;

  if (!sizeChanged && networkState.particles.length) return;

  networkState.width = width;
  networkState.height = height;
  networkState.pixelRatio = pixelRatio;
  networkCanvas.width = Math.round(width * pixelRatio);
  networkCanvas.height = Math.round(height * pixelRatio);
  networkContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  seedNetworkParticles(width, height);
}

function updateNetworkParticles(deltaSeconds) {
  const margin = 10;

  networkState.particles.forEach((particle) => {
    particle.x += particle.vx * deltaSeconds;
    particle.y += particle.vy * deltaSeconds;

    if (particle.x < margin || particle.x > networkState.width - margin) {
      particle.vx *= -1;
      particle.x = Math.min(networkState.width - margin, Math.max(margin, particle.x));
    }

    if (particle.y < margin || particle.y > networkState.height - margin) {
      particle.vy *= -1;
      particle.y = Math.min(networkState.height - margin, Math.max(margin, particle.y));
    }
  });
}

function drawNetworkBackground(timestamp = 0) {
  if (!networkContext) return;

  const { width, height, particles } = networkState;
  const linkDistance = Math.min(150, Math.max(96, width * 0.16));

  networkContext.clearRect(0, 0, width, height);
  networkContext.save();
  networkContext.globalCompositeOperation = "lighter";

  for (let index = 0; index < particles.length; index += 1) {
    for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
      const current = particles[index];
      const next = particles[nextIndex];
      const distance = Math.hypot(current.x - next.x, current.y - next.y);

      if (distance > linkDistance) continue;

      const opacity = Math.pow(1 - distance / linkDistance, 2) * 0.2;
      networkContext.beginPath();
      networkContext.moveTo(current.x, current.y);
      networkContext.lineTo(next.x, next.y);
      networkContext.strokeStyle = `rgba(180, 234, 255, ${opacity})`;
      networkContext.lineWidth = 1;
      networkContext.stroke();
    }
  }

  particles.forEach((particle) => {
    const pulse = 0.72 + Math.sin(timestamp * 0.002 + particle.phase) * 0.28;

    networkContext.beginPath();
    networkContext.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    networkContext.fillStyle = `rgba(236, 250, 255, ${particle.alpha * pulse})`;
    networkContext.shadowBlur = 10;
    networkContext.shadowColor = "rgba(103, 232, 249, 0.55)";
    networkContext.fill();
  });

  networkContext.restore();
}

function animateNetworkBackground(timestamp) {
  resizeNetworkBackground();

  const deltaSeconds = networkState.lastTimestamp
    ? Math.min((timestamp - networkState.lastTimestamp) / 1000, 0.05)
    : 0;
  networkState.lastTimestamp = timestamp;

  if (!reducedMotionQuery.matches) updateNetworkParticles(deltaSeconds);
  drawNetworkBackground(timestamp);

  if (state.view === "tree" && !reducedMotionQuery.matches) {
    networkState.frameId = window.requestAnimationFrame(animateNetworkBackground);
  } else {
    networkState.frameId = null;
    networkState.lastTimestamp = 0;
  }
}

function startNetworkBackground() {
  if (!networkCanvas || !networkContext) return;

  resizeNetworkBackground();
  drawNetworkBackground();

  if (networkState.frameId || reducedMotionQuery.matches) return;

  networkState.lastTimestamp = 0;
  networkState.frameId = window.requestAnimationFrame(animateNetworkBackground);
}

function stopNetworkBackground() {
  if (!networkState.frameId) return;

  window.cancelAnimationFrame(networkState.frameId);
  networkState.frameId = null;
  networkState.lastTimestamp = 0;
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function applyGraphTransform() {
  if (!graphViewport) return;

  graphViewport.style.transform = `translate(${graphTransform.x}px, ${graphTransform.y}px) scale(${graphTransform.scale})`;
}

function getGraphPanelPoint(clientX, clientY) {
  const rect = graphPanel.getBoundingClientRect();

  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

function zoomGraphAt(panelX, panelY, factor) {
  const nextScale = clamp(
    graphTransform.scale * factor,
    graphTransform.minScale,
    graphTransform.maxScale
  );

  if (nextScale === graphTransform.scale) return;

  const scaleRatio = nextScale / graphTransform.scale;
  graphTransform.x = panelX - (panelX - graphTransform.x) * scaleRatio;
  graphTransform.y = panelY - (panelY - graphTransform.y) * scaleRatio;
  graphTransform.scale = nextScale;
  applyGraphTransform();
}

function zoomGraphFromCenter(factor) {
  const rect = graphPanel.getBoundingClientRect();
  zoomGraphAt(rect.width / 2, rect.height / 2, factor);
}

function resetGraphTransform() {
  graphTransform.x = 0;
  graphTransform.y = 0;
  graphTransform.scale = 1;
  applyGraphTransform();
}

function matchesNode(node) {
  const haystack = [
    node.name,
    node.description,
    node.importance,
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
  if (!data) return;

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
      <span>${node.tags.slice(0, 2).join(" / ")}</span>
    `;
    button.addEventListener("click", () => openIntro(node.id));
    nodeList.append(button);
  });
}

function renderGraph() {
  if (!data) return;

  const selectedRelated = getRelatedIds(state.selectedId);
  const width = graphViewport.clientWidth || graphNodes.clientWidth || 900;
  const height = graphViewport.clientHeight || graphNodes.clientHeight || 520;
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
    button.innerHTML = `<strong>${node.name}</strong>`;
    button.addEventListener("click", (event) => {
      if (graphTransform.suppressClick) {
        event.preventDefault();
        graphTransform.suppressClick = false;
        return;
      }

      openIntro(node.id);
    });
    graphNodes.append(button);
  });

  data.relationships.forEach((relationship) => {
    const source = positions.get(relationship.source);
    const target = positions.get(relationship.target);
    const selectedEdge =
      relationship.source === state.selectedId || relationship.target === state.selectedId;
    const color = relationship.type === "prerequisite" ? "#67e8f9" : "#f472b6";
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
    line.setAttribute("opacity", selectedEdge ? "0.95" : "0.48");
    edgeLayer.append(line);
  });
}

function renderIntroPage() {
  if (!data) return;

  const node = nodesById.get(state.selectedId);
  const prerequisiteNames = node.prerequisites.map(getNodeName);
  const enabledNames = node.enabled.map(getNodeName);

  introPage.innerHTML = `
    <button id="backToTree" class="back-button" type="button">Back</button>
    <div class="meta-row">
      ${node.tags.map((tag) => `<span class="chip ${tag === "Mathematics" ? "math" : ""}">${tag}</span>`).join("")}
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
    startNetworkBackground();
  } else {
    stopNetworkBackground();
    renderIntroPage();
  }
}

function render() {
  renderNodeList();
  renderView();
}

async function init() {
  try {
    data = await loadKnowledgeData();
    nodesById = new Map(data.nodes.map((node) => [node.id, node]));
    render();
  } catch (error) {
    showLoadError(error);
  }
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

graphViewport.addEventListener("pointerdown", (event) => {
  if (!event.isPrimary || event.button !== 0) return;

  graphTransform.isDragging = true;
  graphTransform.dragStartX = event.clientX;
  graphTransform.dragStartY = event.clientY;
  graphTransform.originX = graphTransform.x;
  graphTransform.originY = graphTransform.y;
  graphTransform.dragDistance = 0;
  graphTransform.suppressClick = false;
  graphPanel.classList.add("is-dragging");
  graphViewport.setPointerCapture(event.pointerId);
});

graphViewport.addEventListener("pointermove", (event) => {
  if (!graphTransform.isDragging) return;

  const deltaX = event.clientX - graphTransform.dragStartX;
  const deltaY = event.clientY - graphTransform.dragStartY;
  graphTransform.dragDistance = Math.max(
    graphTransform.dragDistance,
    Math.hypot(deltaX, deltaY)
  );

  if (graphTransform.dragDistance > 3) event.preventDefault();

  graphTransform.x = graphTransform.originX + deltaX;
  graphTransform.y = graphTransform.originY + deltaY;
  applyGraphTransform();
});

function endGraphDrag(event) {
  if (!graphTransform.isDragging) return;

  graphTransform.isDragging = false;
  graphTransform.suppressClick = graphTransform.dragDistance > 4;
  graphPanel.classList.remove("is-dragging");

  if (graphViewport.hasPointerCapture(event.pointerId)) {
    graphViewport.releasePointerCapture(event.pointerId);
  }

  window.setTimeout(() => {
    graphTransform.suppressClick = false;
  }, 0);
}

graphViewport.addEventListener("pointerup", endGraphDrag);
graphViewport.addEventListener("pointercancel", endGraphDrag);

graphPanel.addEventListener(
  "wheel",
  (event) => {
    if (state.view !== "tree" || event.target.closest(".graph-toolbar")) return;

    event.preventDefault();
    const point = getGraphPanelPoint(event.clientX, event.clientY);
    const deltaMultiplier = event.deltaMode === 1 ? 18 : 1;
    const zoomFactor = Math.exp(-event.deltaY * deltaMultiplier * 0.0016);
    zoomGraphAt(point.x, point.y, zoomFactor);
  },
  { passive: false }
);

zoomInButton.addEventListener("click", () => zoomGraphFromCenter(1.18));
zoomOutButton.addEventListener("click", () => zoomGraphFromCenter(1 / 1.18));
zoomResetButton.addEventListener("click", resetGraphTransform);

window.addEventListener("resize", () => {
  if (state.view !== "tree") return;

  renderGraph();
  resizeNetworkBackground();
  drawNetworkBackground();
});

function handleMotionPreferenceChange() {
  stopNetworkBackground();

  if (state.view === "tree") startNetworkBackground();
}

if (reducedMotionQuery.addEventListener) {
  reducedMotionQuery.addEventListener("change", handleMotionPreferenceChange);
} else {
  reducedMotionQuery.addListener(handleMotionPreferenceChange);
}

init();
