let data = null;

const state = {
  selectedId: null,
  view: "tree",
  filter: "all",
  query: ""
};

const nodeList = document.querySelector("#nodeList");
const viewSwitcher = document.querySelector("#viewSwitcher");
const viewButtons = Array.from(document.querySelectorAll(".view-button"));
const treeView = document.querySelector("#treeView");
const coneView = document.querySelector("#coneView");
const coneStage = document.querySelector("#coneStage");
const coneDomainLegend = document.querySelector("#coneDomainLegend");
const coneRelationshipLegend = document.querySelector("#coneRelationshipLegend");
const coneLayerLabel = document.querySelector("#coneLayerLabel");
const coneLayerDownButton = document.querySelector("#coneLayerDown");
const coneLayerUpButton = document.querySelector("#coneLayerUp");
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
const nodeSelectionDelayMs = 280;
let pendingNodeSelectionTimer = null;
let coneGraph = null;

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

function clearPendingNodeSelection() {
  if (!pendingNodeSelectionTimer) return;

  window.clearTimeout(pendingNodeSelectionTimer);
  pendingNodeSelectionTimer = null;
}

function shouldSuppressGraphClick() {
  if (!graphTransform.suppressClick) return false;

  graphTransform.suppressClick = false;
  return true;
}

function renderGraph() {
  window.HttRenderers.renderGraph({
    data,
    state,
    graphViewport,
    graphNodes,
    edgeLayer,
    onOpenNode: openIntro,
    onSelectNode: scheduleGraphNodeSelection,
    shouldSuppressClick: shouldSuppressGraphClick
  });
}

function ensureConeGraph() {
  if (coneGraph) return true;

  if (!window.HttExplorationCone3D) {
    coneStage.innerHTML = '<p class="cone-loading">Loading 3D cone renderer...</p>';
    return false;
  }

  coneStage.innerHTML = "";
  coneGraph = window.HttExplorationCone3D.create({
    container: coneStage,
    data,
    domainLegend: coneDomainLegend,
    layerLabel: coneLayerLabel,
    onClearSelection: clearNodeSelection,
    onOpenNode: openIntro,
    onSelectNode: scheduleConeNodeSelection,
    reducedMotionQuery,
    relationshipLegend: coneRelationshipLegend,
    state
  });

  return true;
}

function renderConeGraph() {
  if (!data || !ensureConeGraph()) return;

  coneGraph.render(data, state);
  coneGraph.activate();
}

function stopConeGraph() {
  if (coneGraph) coneGraph.deactivate();
}

function renderIntroPage() {
  window.HttRenderers.renderIntroPage({
    data,
    state,
    introPage,
    onBackToTree: showTree
  });
}

function renderNodeList() {
  window.HttRenderers.renderNodeList({
    data,
    state,
    nodeList,
    onOpenNode: openIntro,
    onSelectNode: scheduleNodeSelection
  });
}

function getCurrentGraphView() {
  return state.view === "cone" ? "cone" : "tree";
}

function selectNode(id, view = getCurrentGraphView()) {
  state.selectedId = id;
  state.view = view;
  render();
}

function clearNodeSelection() {
  clearPendingNodeSelection();
  if (!state.selectedId || (state.view !== "tree" && state.view !== "cone")) return;

  state.selectedId = null;
  render();
}

function scheduleNodeSelection(id) {
  clearPendingNodeSelection();
  pendingNodeSelectionTimer = window.setTimeout(() => {
    pendingNodeSelectionTimer = null;
    selectNode(id);
  }, nodeSelectionDelayMs);
}

function isOutsideFocusedSubgraph(id) {
  if (!state.selectedId || !window.HttKnowledgeGraph) return false;

  return !window.HttKnowledgeGraph.getFocusedSubgraphIds(data, state.selectedId).has(id);
}

function scheduleGraphNodeSelection(id) {
  clearPendingNodeSelection();
  pendingNodeSelectionTimer = window.setTimeout(() => {
    pendingNodeSelectionTimer = null;
    if (isOutsideFocusedSubgraph(id)) {
      clearNodeSelection();
      return;
    }

    selectNode(id, "tree");
  }, nodeSelectionDelayMs);
}

function scheduleConeNodeSelection(id) {
  clearPendingNodeSelection();
  pendingNodeSelectionTimer = window.setTimeout(() => {
    pendingNodeSelectionTimer = null;
    selectNode(id, "cone");
  }, nodeSelectionDelayMs);
}

function openIntro(id) {
  clearPendingNodeSelection();
  state.selectedId = id;
  state.previousView = getCurrentGraphView();
  state.view = "intro";
  render();
}

function showTree() {
  state.view = state.previousView || "tree";
  render();
}

function renderView() {
  const showingTree = state.view === "tree";
  const showingCone = state.view === "cone";
  const showingIntro = state.view === "intro";

  viewSwitcher.hidden = showingIntro;
  viewButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === getCurrentGraphView());
  });

  treeView.classList.toggle("is-active", showingTree);
  treeView.hidden = !showingTree;
  coneView.classList.toggle("is-active", showingCone);
  coneView.hidden = !showingCone;
  introPage.hidden = !showingIntro;

  if (showingTree) {
    stopConeGraph();
    renderGraph();
    startNetworkBackground();
    return;
  }

  stopNetworkBackground();

  if (showingCone) {
    renderConeGraph();
    return;
  }

  if (showingIntro) {
    stopConeGraph();
    renderIntroPage();
  }
}

function render() {
  renderNodeList();
  renderView();
}

function validateLoadedData(knowledgeData) {
  if (!window.HttKnowledgeValidation) return;

  const result = window.HttKnowledgeValidation.validateKnowledgeData(knowledgeData);
  if (!result.valid) {
    throw new Error(`Knowledge data validation failed:\n${result.errors.join("\n")}`);
  }
}

function init() {
  try {
    if (!window.machineLearningKnowledge) {
      throw new Error("src/data/machine-learning-knowledge.js loaded without knowledge data.");
    }

    data = window.machineLearningKnowledge;
    validateLoadedData(data);
    render();
  } catch (error) {
    window.HttRenderers.showLoadError({
      error,
      nodeList,
      graphNodes,
      edgeLayer
    });
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

viewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.view = button.dataset.view;
    if (state.view === "tree") resetGraphTransform();
    render();
  });
});

graphViewport.addEventListener("pointerdown", (event) => {
  if (!event.isPrimary || event.button !== 0) return;
  if (event.target.closest(".graph-node")) return;

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

graphViewport.addEventListener("click", (event) => {
  if (event.target.closest(".graph-node")) return;
  if (shouldSuppressGraphClick()) return;

  clearNodeSelection();
});

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
coneLayerDownButton.addEventListener("click", () => coneGraph?.focusLayer(-1));
coneLayerUpButton.addEventListener("click", () => coneGraph?.focusLayer(1));

window.addEventListener("resize", () => {
  if (state.view === "cone") {
    coneGraph?.resize();
    return;
  }

  if (state.view !== "tree") return;

  renderGraph();
  resizeNetworkBackground();
  drawNetworkBackground();
});

window.addEventListener("htt:cone3d-ready", () => {
  if (state.view === "cone") renderView();
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
