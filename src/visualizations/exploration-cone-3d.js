(function (root) {
  const relationshipLabels = {
    "alternative-path": "Alternative path",
    application: "Application",
    influence: "Influence",
    prerequisite: "Prerequisite"
  };

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  function randomBetween(minimum, maximum) {
    return minimum + Math.random() * (maximum - minimum);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function createLegendItem(color, label, className = "cone-legend-item") {
    const item = document.createElement("span");
    item.className = className;
    item.innerHTML = `<i style="background:${color}"></i>${escapeHtml(label)}`;
    return item;
  }

  function drawRoundRect(context, x, y, width, height, radius) {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
  }

  function hexToRgb(hex) {
    const normalized = hex.replace("#", "");
    const value = Number.parseInt(normalized, 16);

    return {
      b: value & 255,
      g: (value >> 8) & 255,
      r: (value >> 16) & 255
    };
  }

  function colorWithAlpha(hex, alpha) {
    const color = hexToRgb(hex);
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
  }

  class ExplorationCone3D {
    constructor({
      container,
      data,
      domainLegend,
      onClearSelection,
      onOpenNode,
      onSelectNode,
      reducedMotionQuery,
      relationshipLegend,
      state
    }) {
      this.container = container;
      this.data = data;
      this.domainLegend = domainLegend;
      this.onClearSelection = onClearSelection;
      this.onOpenNode = onOpenNode;
      this.onSelectNode = onSelectNode;
      this.reducedMotionQuery = reducedMotionQuery;
      this.relationshipLegend = relationshipLegend;
      this.state = state;
      this.active = false;
      this.animationFrame = null;
      this.backgroundParticles = [];
      this.height = 1;
      this.hitTargets = [];
      this.lastFrameTimestamp = 0;
      this.layout = null;
      this.pointer = {
        dragAxis: null,
        dragging: false,
        startViewOffsetY: 0,
        startX: 0,
        startY: 0,
        startYaw: 0
      };
      this.cameraPitch = -0.38;
      this.pixelRatio = 1;
      this.viewOffsetY = 0;
      this.width = 1;
      this.yaw = 0.78;
      this.zoom = 1;

      this.canvas = document.createElement("canvas");
      this.canvas.className = "cone-canvas";
      this.context = this.canvas.getContext("2d");
      this.container.append(this.canvas);
      this.addEventListeners();
      this.render(data, state);
    }

    addEventListeners() {
      this.canvas.addEventListener("pointerdown", (event) => {
        if (!event.isPrimary || event.button !== 0) return;

        this.pointer.dragging = true;
        this.pointer.startX = event.clientX;
        this.pointer.startY = event.clientY;
        this.pointer.startYaw = this.yaw;
        this.pointer.startViewOffsetY = this.viewOffsetY;
        this.pointer.dragAxis = null;
        event.preventDefault();
        this.canvas.setPointerCapture(event.pointerId);
      });

      this.canvas.addEventListener("pointermove", (event) => {
        if (!this.pointer.dragging) return;

        const deltaX = event.clientX - this.pointer.startX;
        const deltaY = event.clientY - this.pointer.startY;
        const distance = Math.hypot(deltaX, deltaY);
        event.preventDefault();

        if (!this.pointer.dragAxis && distance > 6) {
          this.pointer.dragAxis = Math.abs(deltaX) > Math.abs(deltaY) ? "horizontal" : "vertical";
        }

        if (this.pointer.dragAxis === "horizontal") {
          this.yaw = this.pointer.startYaw + deltaX * 0.008;
        } else if (this.pointer.dragAxis === "vertical") {
          this.viewOffsetY = this.clampViewOffsetY(this.pointer.startViewOffsetY + deltaY);
        }

        this.renderFrame();
      });

      this.canvas.addEventListener("pointerup", (event) => this.endDrag(event));
      this.canvas.addEventListener("pointercancel", (event) => this.endDrag(event));

      this.canvas.addEventListener("click", (event) => {
        const dragDistance = Math.hypot(
          event.clientX - this.pointer.startX,
          event.clientY - this.pointer.startY
        );
        if (dragDistance > 5) return;

        const target = this.pickNode(event);
        if (target) {
          this.onSelectNode(target.id);
          return;
        }

        this.onClearSelection();
      });

      this.canvas.addEventListener("dblclick", (event) => {
        const target = this.pickNode(event);
        if (target) this.onOpenNode(target.id);
      });

      this.canvas.addEventListener(
        "wheel",
        (event) => {
          event.preventDefault();
          const deltaMultiplier = event.deltaMode === 1 ? 18 : 1;

          if (event.ctrlKey || event.metaKey) {
            this.zoom = clamp(
              this.zoom * Math.exp(-event.deltaY * deltaMultiplier * 0.0014),
              0.48,
              2.8
            );
            this.viewOffsetY = this.clampViewOffsetY(this.viewOffsetY);
          } else {
            this.viewOffsetY = this.clampViewOffsetY(
              this.viewOffsetY - event.deltaY * deltaMultiplier
            );
          }

          this.renderFrame();
        },
        { passive: false }
      );
    }

    endDrag(event) {
      if (!this.pointer.dragging) return;

      this.pointer.dragging = false;
      if (this.canvas.hasPointerCapture(event.pointerId)) {
        this.canvas.releasePointerCapture(event.pointerId);
      }
    }

    render(data, state) {
      this.data = data;
      this.state = state;
      this.layout = root.HttKnowledgeGraph.computeConeLayout(data);
      this.renderLegends();
      this.resize();
      this.applySelection();
      this.renderFrame();
    }

    renderLegends() {
      this.domainLegend.innerHTML = "";
      this.layout.domainColors.forEach((color, domain) => {
        this.domainLegend.append(createLegendItem(color, domain));
      });

      this.relationshipLegend.innerHTML = "";
      ["prerequisite", "application", "influence", "alternative-path"].forEach((type) => {
        this.relationshipLegend.append(
          createLegendItem(
            root.HttKnowledgeGraph.getRelationshipColor(type),
            relationshipLabels[type],
            "cone-legend-item relationship"
          )
        );
      });
    }

    applySelection() {
      if (this.state.selectedId) {
        this.focusNode(this.state.selectedId, false);
      }
    }

    resize() {
      const rect = this.container.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      const pixelRatio = Math.min(root.devicePixelRatio || 1, 2);
      const sizeChanged = width !== this.width || height !== this.height;

      this.width = width;
      this.height = height;
      this.pixelRatio = pixelRatio;
      this.canvas.width = Math.round(this.width * this.pixelRatio);
      this.canvas.height = Math.round(this.height * this.pixelRatio);
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;
      this.context.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
      if (sizeChanged || !this.backgroundParticles.length) this.seedBackgroundParticles();
      this.viewOffsetY = this.clampViewOffsetY(this.viewOffsetY);
      this.renderFrame();
    }

    createBackgroundParticle() {
      const angle = randomBetween(0, Math.PI * 2);
      const speed = randomBetween(14, 34);

      return {
        alpha: randomBetween(0.48, 0.9),
        phase: randomBetween(0, Math.PI * 2),
        radius: randomBetween(1.2, 2.4),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        x: randomBetween(0, this.width),
        y: randomBetween(0, this.height)
      };
    }

    seedBackgroundParticles() {
      const particleCount = Math.round(
        Math.min(92, Math.max(44, (this.width * this.height) / 11000))
      );

      this.backgroundParticles = Array.from({ length: particleCount }, () =>
        this.createBackgroundParticle()
      );
    }

    updateBackgroundParticles(deltaSeconds) {
      const margin = 10;

      this.backgroundParticles.forEach((particle) => {
        particle.x += particle.vx * deltaSeconds;
        particle.y += particle.vy * deltaSeconds;

        if (particle.x < margin || particle.x > this.width - margin) {
          particle.vx *= -1;
          particle.x = Math.min(this.width - margin, Math.max(margin, particle.x));
        }

        if (particle.y < margin || particle.y > this.height - margin) {
          particle.vy *= -1;
          particle.y = Math.min(this.height - margin, Math.max(margin, particle.y));
        }
      });
    }

    getVerticalPanBounds() {
      const fallbackLimit = this.height * 1.15;

      if (!this.layout?.positions?.size) {
        return {
          maximum: fallbackLimit,
          minimum: -fallbackLimit
        };
      }

      const edgePadding = clamp(this.height * 0.12, 56, 120);
      let minY = Infinity;
      let maxY = -Infinity;

      this.layout.positions.forEach((position) => {
        const projected = this.projectPoint(position, 0);
        const outerRadius = projected.radius + 40;

        minY = Math.min(minY, projected.screenY - outerRadius);
        maxY = Math.max(maxY, projected.screenY + outerRadius);
      });

      if (!Number.isFinite(minY) || !Number.isFinite(maxY)) {
        return {
          maximum: fallbackLimit,
          minimum: -fallbackLimit
        };
      }

      return {
        maximum: Math.max(fallbackLimit, edgePadding - minY),
        minimum: Math.min(-fallbackLimit, this.height - edgePadding - maxY)
      };
    }

    clampViewOffsetY(value) {
      const { maximum, minimum } = this.getVerticalPanBounds();
      return clamp(value, minimum, maximum);
    }

    projectPoint(point, viewOffsetY = this.viewOffsetY) {
      const y = point.y;
      const cosYaw = Math.cos(this.yaw);
      const sinYaw = Math.sin(this.yaw);
      const x1 = point.x * cosYaw - point.z * sinYaw;
      const z1 = point.x * sinYaw + point.z * cosYaw;
      const cosPitch = Math.cos(this.cameraPitch);
      const sinPitch = Math.sin(this.cameraPitch);
      const y2 = y * cosPitch - z1 * sinPitch;
      const z2 = y * sinPitch + z1 * cosPitch;
      const distance = 19;
      const perspective = distance / (distance + z2);
      const scale = Math.min(this.width, this.height) * 0.062 * this.zoom * perspective;

      return {
        depth: z2,
        radius: clamp(7.5 * this.zoom * perspective, 4.5, 15),
        screenX: this.width / 2 + x1 * scale,
        screenY: this.height / 2 + viewOffsetY - y2 * scale,
        scale
      };
    }

    getRelatedIds() {
      return this.state.selectedId
        ? root.HttKnowledgeGraph.getRelatedIds(this.data, this.state.selectedId)
        : new Set();
    }

    renderFrame(timestamp = root.performance?.now?.() || 0) {
      if (!this.context || !this.layout) return;

      const context = this.context;
      const deltaSeconds = this.lastFrameTimestamp
        ? Math.min((timestamp - this.lastFrameTimestamp) / 1000, 0.05)
        : 0;
      const relatedIds = this.getRelatedIds();
      const selectedId = this.state.selectedId;
      const nodeIndex = root.HttKnowledgeGraph.getNodeIndex(this.data);
      const projectedNodes = [];

      this.lastFrameTimestamp = timestamp;
      if (!this.reducedMotionQuery.matches) this.updateBackgroundParticles(deltaSeconds);

      context.clearRect(0, 0, this.width, this.height);
      this.drawBackground(context, timestamp);

      this.layout.positions.forEach((position, id) => {
        projectedNodes.push({
          domain: this.layout.nodeDomains.get(id),
          id,
          node: nodeIndex.get(id),
          position,
          projected: this.projectPoint(position)
        });
      });

      this.drawRings(context);
      this.drawEdges(context, relatedIds, selectedId);
      this.drawNodes(context, projectedNodes, relatedIds, selectedId);
      this.drawLabels(context, projectedNodes, relatedIds, selectedId);
    }

    drawBackground(context, timestamp) {
      const gradient = context.createRadialGradient(
        this.width * 0.5,
        this.height * 0.45,
        0,
        this.width * 0.5,
        this.height * 0.45,
        Math.max(this.width, this.height) * 0.65
      );
      gradient.addColorStop(0, "rgba(14, 165, 233, 0.24)");
      gradient.addColorStop(0.45, "rgba(8, 47, 73, 0.62)");
      gradient.addColorStop(1, "rgba(3, 7, 18, 0.96)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, this.width, this.height);

      this.drawParticleBackground(context, timestamp);
    }

    drawParticleBackground(context, timestamp) {
      const linkDistance = Math.min(150, Math.max(96, this.width * 0.16));

      context.save();
      context.globalCompositeOperation = "lighter";

      for (let index = 0; index < this.backgroundParticles.length; index += 1) {
        for (
          let nextIndex = index + 1;
          nextIndex < this.backgroundParticles.length;
          nextIndex += 1
        ) {
          const current = this.backgroundParticles[index];
          const next = this.backgroundParticles[nextIndex];
          const distance = Math.hypot(current.x - next.x, current.y - next.y);

          if (distance > linkDistance) continue;

          const opacity = Math.pow(1 - distance / linkDistance, 2) * 0.2;
          context.beginPath();
          context.moveTo(current.x, current.y);
          context.lineTo(next.x, next.y);
          context.strokeStyle = `rgba(180, 234, 255, ${opacity})`;
          context.lineWidth = 1;
          context.stroke();
        }
      }

      this.backgroundParticles.forEach((particle) => {
        const pulse = 0.72 + Math.sin(timestamp * 0.002 + particle.phase) * 0.28;

        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(236, 250, 255, ${particle.alpha * pulse})`;
        context.shadowBlur = 10;
        context.shadowColor = "rgba(103, 232, 249, 0.55)";
        context.fill();
      });

      context.restore();
    }

    drawRings(context) {
      this.layout.layers.forEach((layer, index) => {
        const firstPosition = this.layout.positions.get(layer[0]);
        if (!firstPosition) return;

        const points = [];
        for (let step = 0; step <= 96; step += 1) {
          const angle = (Math.PI * 2 * step) / 96;
          points.push(
            this.projectPoint({
              x: Math.cos(angle) * firstPosition.radius,
              y: firstPosition.y,
              z: Math.sin(angle) * firstPosition.radius
            })
          );
        }

        context.beginPath();
        points.forEach((point, pointIndex) => {
          if (pointIndex === 0) context.moveTo(point.screenX, point.screenY);
          else context.lineTo(point.screenX, point.screenY);
        });
        context.strokeStyle = "rgba(125, 211, 252, 0.16)";
        context.lineWidth = 1;
        context.stroke();
      });
    }

    drawEdges(context, relatedIds, selectedId) {
      const edges = this.layout.relationships
        .map((relationship) => {
          const source = this.layout.positions.get(relationship.source);
          const target = this.layout.positions.get(relationship.target);
          if (!source || !target) return null;

          return {
            relationship,
            source: this.projectPoint(source),
            target: this.projectPoint(target)
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.source.depth + a.target.depth - b.source.depth - b.target.depth);

      edges.forEach(({ relationship, source, target }) => {
        const linked =
          relationship.source === selectedId ||
          relationship.target === selectedId;
        const focused =
          !selectedId ||
          (relatedIds.has(relationship.source) && relatedIds.has(relationship.target));
        const opacity = linked ? 0.95 : focused ? 0.34 : 0.08;

        context.beginPath();
        context.moveTo(source.screenX, source.screenY);
        context.lineTo(target.screenX, target.screenY);
        context.strokeStyle = colorWithAlpha(
          root.HttKnowledgeGraph.getRelationshipColor(relationship.type),
          opacity
        );
        context.lineWidth = linked ? 2.5 : 1.25;
        context.stroke();
      });
    }

    drawNodes(context, projectedNodes, relatedIds, selectedId) {
      this.hitTargets = [];
      projectedNodes
        .sort((a, b) => a.projected.depth - b.projected.depth)
        .forEach(({ domain, id, projected }) => {
          const selected = id === selectedId;
          const related = selectedId && relatedIds.has(id);
          const opacity = !selectedId || selected || related ? 1 : 0.22;
          const radius = projected.radius * (selected ? 1.6 : related ? 1.22 : 1);
          const color = this.layout.domainColors.get(domain) || "#cbd5e1";

          context.save();
          context.globalAlpha = opacity;
          context.beginPath();
          context.arc(projected.screenX, projected.screenY, radius + 4, 0, Math.PI * 2);
          context.fillStyle = selected
            ? "rgba(251, 191, 36, 0.32)"
            : "rgba(103, 232, 249, 0.13)";
          context.fill();
          context.beginPath();
          context.arc(projected.screenX, projected.screenY, radius, 0, Math.PI * 2);
          context.fillStyle = color;
          context.fill();
          context.lineWidth = selected ? 3 : 1.4;
          context.strokeStyle = selected ? "#fde68a" : "rgba(226, 232, 240, 0.72)";
          context.stroke();
          context.restore();

          this.hitTargets.push({
            id,
            radius: radius + 6,
            x: projected.screenX,
            y: projected.screenY
          });
        });
    }

    drawLabels(context, projectedNodes, relatedIds, selectedId) {
      projectedNodes
        .filter(({ id }) => selectedId && relatedIds.has(id))
        .sort((a, b) => a.projected.depth - b.projected.depth)
        .forEach(({ id, node, projected }) => {
          const isSelected = id === selectedId;
          const label = node.name;
          context.font = `${isSelected ? 800 : 700} 12px Inter, system-ui, sans-serif`;
          const width = Math.ceil(context.measureText(label).width) + 16;
          const height = 24;
          const x = projected.screenX - width / 2;
          const y = projected.screenY - projected.radius - 32;

          drawRoundRect(context, x, y, width, height, 8);
          context.fillStyle = isSelected
            ? "rgba(120, 53, 15, 0.88)"
            : "rgba(2, 8, 23, 0.78)";
          context.fill();
          context.strokeStyle = isSelected
            ? "rgba(251, 191, 36, 0.76)"
            : "rgba(125, 211, 252, 0.36)";
          context.stroke();
          context.fillStyle = "#f8fafc";
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillText(label, projected.screenX, y + height / 2);
        });
    }

    pickNode(event) {
      const rect = this.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      for (let index = this.hitTargets.length - 1; index >= 0; index -= 1) {
        const target = this.hitTargets[index];
        if (Math.hypot(x - target.x, y - target.y) <= target.radius) return target;
      }

      return null;
    }

    focusNode(id, shouldRender = true) {
      const position = this.layout?.positions.get(id);
      if (!position) return;

      if (shouldRender) this.renderFrame();
    }

    activate() {
      this.active = true;
      this.resize();

      if (this.animationFrame || this.reducedMotionQuery.matches) return;

      const tick = (timestamp) => {
        if (!this.active) {
          this.animationFrame = null;
          return;
        }

        this.renderFrame(timestamp);
        this.animationFrame = root.requestAnimationFrame(tick);
      };

      this.animationFrame = root.requestAnimationFrame(tick);
    }

    deactivate() {
      this.active = false;
      if (this.animationFrame) {
        root.cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
      }
      this.lastFrameTimestamp = 0;
    }
  }

  root.HttExplorationCone3D = {
    create(options) {
      return new ExplorationCone3D(options);
    }
  };

  root.dispatchEvent(new CustomEvent("htt:cone3d-ready"));
})(window);
