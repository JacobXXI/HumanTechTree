(function (root, factory) {
  const renderers = factory(root.HttKnowledgeGraph);

  if (typeof module === "object" && module.exports) {
    module.exports = renderers;
  }

  if (root) {
    root.HttRenderers = renderers;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function (KnowledgeGraph) {
  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function matchesNode(node, state) {
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

  function showLoadError({ error, nodeList, graphNodes, edgeLayer }) {
    console.error(error);
    nodeList.innerHTML = "";

    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent =
      "Unable to load knowledge data. Check src/data/machine-learning-knowledge.js and validation output.";
    nodeList.append(empty);

    graphNodes.innerHTML = "";
    edgeLayer.innerHTML = "";
  }

  function getLayerStats(data, normalizedPositions) {
    const layerCounts = new Map();

    data.nodes.forEach((node) => {
      const spot = normalizedPositions.get(node.id);
      if (!spot) return;

      const key = spot.y.toFixed(6);
      layerCounts.set(key, (layerCounts.get(key) || 0) + 1);
    });

    return {
      layerCount: Math.max(layerCounts.size, 1),
      maxLayerSize: Math.max(...layerCounts.values(), 1)
    };
  }

  function getGraphContentSize({
    data,
    normalizedPositions,
    nodeWidth,
    nodeHeight,
    panelWidth,
    panelHeight,
    paddingX,
    paddingTop,
    paddingBottom
  }) {
    const { layerCount, maxLayerSize } = getLayerStats(data, normalizedPositions);
    const horizontalGap = panelWidth < 620 ? 42 : 72;
    const verticalGap = panelHeight < 620 ? 76 : 104;
    const minNormalizedGap =
      maxLayerSize > 1 ? Math.min(0.24, 0.86 / (maxLayerSize - 1)) : 1;
    const requiredUsableWidth =
      maxLayerSize > 1
        ? Math.ceil((nodeWidth + horizontalGap) / minNormalizedGap)
        : nodeWidth + horizontalGap * 2;
    const requiredUsableHeight =
      layerCount > 1 ? (layerCount - 1) * (nodeHeight + verticalGap) : nodeHeight;

    return {
      height: Math.max(
        panelHeight,
        Math.ceil(requiredUsableHeight + nodeHeight + paddingTop + paddingBottom)
      ),
      width: Math.max(
        panelWidth,
        Math.ceil(requiredUsableWidth + nodeWidth + paddingX * 2)
      )
    };
  }

  function renderNodeList({ data, state, nodeList, onOpenNode, onSelectNode }) {
    if (!data) return;

    const filteredNodes = data.nodes.filter((node) => matchesNode(node, state));
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
        <strong>${escapeHtml(node.name)}</strong>
        <span>${escapeHtml(node.tags.slice(0, 2).join(" / "))}</span>
      `;
      button.addEventListener("click", (event) => {
        if (event.detail > 1) return;
        onSelectNode(node.id);
      });
      button.addEventListener("dblclick", () => onOpenNode(node.id));
      nodeList.append(button);
    });
  }

  function renderGraph({
    data,
    state,
    graphViewport,
    graphNodes,
    edgeLayer,
    onOpenNode,
    onSelectNode,
    shouldSuppressClick
  }) {
    if (!data) return;

    const focusedIds = state.selectedId
      ? KnowledgeGraph.getFocusedSubgraphIds(data, state.selectedId)
      : KnowledgeGraph.getNodeIds(data);
    const displayNodes = data.nodes;
    const displayRelationships = KnowledgeGraph.getRenderableRelationships(data);
    const selectedRelated = state.selectedId ? focusedIds : new Set();
    const panelWidth = graphViewport.parentElement?.clientWidth || graphNodes.clientWidth || 900;
    const panelHeight = graphViewport.parentElement?.clientHeight || graphNodes.clientHeight || 520;
    const nodeWidth = panelWidth < 620 ? 116 : 150;
    const nodeHeight = 58;
    const paddingX = 18;
    const paddingTop = 56;
    const paddingBottom = 36;
    const normalizedPositions = KnowledgeGraph.computeNormalizedPositions(
      displayNodes,
      displayRelationships
    );
    const { width, height } = getGraphContentSize({
      data: { nodes: displayNodes },
      normalizedPositions,
      nodeWidth,
      nodeHeight,
      panelWidth,
      panelHeight,
      paddingX,
      paddingTop,
      paddingBottom
    });
    const usableWidth = width - nodeWidth - paddingX * 2;
    const usableHeight = height - nodeHeight - paddingTop - paddingBottom;
    const positions = new Map();

    graphViewport.style.width = `${width}px`;
    graphViewport.style.height = `${height}px`;
    graphNodes.innerHTML = "";
    edgeLayer.innerHTML = "";
    edgeLayer.setAttribute("viewBox", `0 0 ${width} ${height}`);
    edgeLayer.innerHTML = "<defs></defs>";

    displayNodes.forEach((node) => {
      const spot = normalizedPositions.get(node.id);
      const x = paddingX + spot.x * usableWidth;
      const y = paddingTop + spot.y * usableHeight;
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
      button.innerHTML = `<strong>${escapeHtml(node.name)}</strong>`;
      button.addEventListener("click", (event) => {
        if (shouldSuppressClick()) {
          event.preventDefault();
          return;
        }

        if (event.detail > 1) return;
        onSelectNode(node.id);
      });
      button.addEventListener("dblclick", (event) => {
        if (shouldSuppressClick()) {
          event.preventDefault();
          return;
        }

        onOpenNode(node.id);
      });
      graphNodes.append(button);
    });

    displayRelationships.forEach((relationship) => {
      const source = positions.get(relationship.source);
      const target = positions.get(relationship.target);
      if (!source || !target) return;

      const selectedEdge =
        relationship.source === state.selectedId || relationship.target === state.selectedId;
      const isFocusedEdge =
        !state.selectedId ||
        (focusedIds.has(relationship.source) && focusedIds.has(relationship.target));
      const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const verticalDistance = Math.abs(target.bottom - source.top);
      const curve = Math.max(36, verticalDistance * 0.42);
      const horizontalBend = (target.cx - source.cx) * 0.12;
      line.setAttribute(
        "d",
        `M ${source.cx} ${source.top} C ${source.cx + horizontalBend} ${source.top - curve}, ${target.cx - horizontalBend} ${target.bottom + curve}, ${target.cx} ${target.bottom}`
      );
      line.setAttribute("fill", "none");
      line.setAttribute("stroke", KnowledgeGraph.getRelationshipColor(relationship.type));
      line.setAttribute("stroke-width", selectedEdge ? "3" : "1.6");
      line.setAttribute("opacity", selectedEdge ? "0.95" : isFocusedEdge ? "0.48" : "0.24");
      edgeLayer.append(line);
    });
  }

  function renderIntroPage({ data, state, introPage, onBackToTree }) {
    if (!data) return;

    const node = KnowledgeGraph.getNodeIndex(data).get(state.selectedId);
    const prerequisiteNames = KnowledgeGraph.getPrerequisiteIds(data, state.selectedId).map((id) =>
      KnowledgeGraph.getNodeName(data, id)
    );
    const enabledNames = KnowledgeGraph.getEnabledIds(data, state.selectedId).map((id) =>
      KnowledgeGraph.getNodeName(data, id)
    );

    introPage.innerHTML = `
      <button id="backToTree" class="back-button" type="button">Back</button>
      <div class="meta-row">
        ${node.tags
          .map(
            (tag) =>
              `<span class="chip ${tag === "Mathematics" ? "math" : ""}">${escapeHtml(tag)}</span>`
          )
          .join("")}
        <span class="chip status">${escapeHtml(node.status)}</span>
      </div>
      <h2>${escapeHtml(node.name)}</h2>
      <p>${escapeHtml(node.description)}</p>
      <p><strong>Why it matters:</strong> ${escapeHtml(node.importance)}</p>
      <p class="section-label">Prerequisites</p>
      <div class="chip-row">
        ${
          prerequisiteNames.length
            ? prerequisiteNames.map((name) => `<span class="chip">${escapeHtml(name)}</span>`).join("")
            : '<span class="chip">Entry point</span>'
        }
      </div>
      <p class="section-label">Enables</p>
      <div class="chip-row">
        ${
          enabledNames.length
            ? enabledNames.map((name) => `<span class="chip">${escapeHtml(name)}</span>`).join("")
            : '<span class="chip">None listed</span>'
        }
      </div>
      <p class="section-label">References</p>
      <div class="reference-list">
        ${node.references
          .map(
            (reference) =>
              `<a class="link-button" href="${escapeHtml(reference.url)}" target="_blank" rel="noreferrer">${escapeHtml(reference.title)}</a>`
          )
          .join("")}
      </div>
    `;
    document.querySelector("#backToTree").addEventListener("click", onBackToTree);
  }

  return {
    renderGraph,
    renderIntroPage,
    renderNodeList,
    showLoadError
  };
});
