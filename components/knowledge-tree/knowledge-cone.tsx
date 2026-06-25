"use client";

import {
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import {
  computeConeLayout,
  getRelatedIds,
  getRelationshipColor,
  type ConeCamera,
  type ConeLayout,
  type ConePosition
} from "@/lib/knowledge/graph";
import type {
  KnowledgeData,
  KnowledgeNode,
  KnowledgeRelationship,
  RelationshipType
} from "@/lib/knowledge/types";

interface BackgroundParticle {
  alpha: number;
  phase: number;
  radius: number;
  vx: number;
  vy: number;
  x: number;
  y: number;
}

interface HitTarget {
  id: string;
  radius: number;
  x: number;
  y: number;
}

interface ProjectedPoint {
  depth: number;
  radius: number;
  scale: number;
  screenX: number;
  screenY: number;
}

interface ProjectedNode {
  domain: string;
  id: string;
  node: KnowledgeNode;
  projected: ProjectedPoint;
}

interface ConePointerState {
  axis: "horizontal" | "vertical" | null;
  distance: number;
  dragging: boolean;
  pointerId: number;
  startOffsetY: number;
  startX: number;
  startY: number;
  startYaw: number;
}

const relationshipLabels: Record<RelationshipType, string> = {
  "alternative-path": "Alternative path",
  application: "Application",
  influence: "Influence",
  prerequisite: "Prerequisite"
};

const relationshipTypes: RelationshipType[] = [
  "prerequisite",
  "application",
  "influence",
  "alternative-path"
];

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function randomBetween(minimum: number, maximum: number) {
  return minimum + Math.random() * (maximum - minimum);
}

function drawRoundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
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

function colorWithAlpha(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);
  const blue = value & 255;
  const green = (value >> 8) & 255;
  const red = (value >> 16) & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

class ConeCanvasRenderer {
  readonly camera: ConeCamera = {
    pitch: -0.38,
    viewOffsetY: 0,
    yaw: 0.78,
    zoom: 1
  };

  private backgroundParticles: BackgroundParticle[] = [];
  private height = 1;
  private hitTargets: HitTarget[] = [];
  private lastFrameTimestamp = 0;
  private pixelRatio = 1;
  private reducedMotion = false;
  private selectedId: string | null = null;
  private width = 1;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly context: CanvasRenderingContext2D,
    private readonly data: KnowledgeData,
    private readonly layout: ConeLayout,
    private readonly nodeIndex: Map<string, KnowledgeNode>
  ) {}

  setSelectedId(selectedId: string | null) {
    this.selectedId = selectedId;
    this.renderFrame();
  }

  setReducedMotion(reducedMotion: boolean) {
    this.reducedMotion = reducedMotion;
    this.lastFrameTimestamp = 0;
    this.renderFrame();
  }

  resize(width: number, height: number, pixelRatio: number) {
    if (width < 1 || height < 1) return;

    const sizeChanged = width !== this.width || height !== this.height;
    this.width = Math.round(width);
    this.height = Math.round(height);
    this.pixelRatio = Math.min(pixelRatio || 1, 2);
    this.canvas.width = Math.round(this.width * this.pixelRatio);
    this.canvas.height = Math.round(this.height * this.pixelRatio);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.context.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
    if (sizeChanged || !this.backgroundParticles.length) this.seedBackgroundParticles();
    this.camera.viewOffsetY = this.clampViewOffsetY(this.camera.viewOffsetY);
    this.renderFrame();
  }

  renderFrame(timestamp = typeof performance === "undefined" ? 0 : performance.now()) {
    const deltaSeconds = this.lastFrameTimestamp
      ? Math.min((timestamp - this.lastFrameTimestamp) / 1000, 0.05)
      : 0;
    const relatedIds = this.selectedId
      ? getRelatedIds(this.data, this.selectedId)
      : new Set<string>();

    this.lastFrameTimestamp = timestamp;
    if (!this.reducedMotion) this.updateBackgroundParticles(deltaSeconds);
    this.context.clearRect(0, 0, this.width, this.height);
    this.drawBackground(timestamp);

    const projectedNodes: ProjectedNode[] = [];
    this.layout.positions.forEach((position, id) => {
      const node = this.nodeIndex.get(id);
      if (!node) return;
      projectedNodes.push({
        domain: this.layout.nodeDomains.get(id) ?? "Other",
        id,
        node,
        projected: this.projectPoint(position)
      });
    });

    this.drawRings();
    this.drawEdges(relatedIds);
    this.drawNodes(projectedNodes, relatedIds);
    this.drawLabels(projectedNodes, relatedIds);
    this.canvas.dataset.cameraYaw = this.camera.yaw.toFixed(4);
    this.canvas.dataset.cameraOffsetY = this.camera.viewOffsetY.toFixed(1);
    this.canvas.dataset.cameraZoom = this.camera.zoom.toFixed(4);
  }

  clampViewOffsetY(value: number) {
    const { maximum, minimum } = this.getVerticalPanBounds();
    return clamp(value, minimum, maximum);
  }

  pickNode(clientX: number, clientY: number) {
    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    for (let index = this.hitTargets.length - 1; index >= 0; index -= 1) {
      const target = this.hitTargets[index];
      if (Math.hypot(x - target.x, y - target.y) <= target.radius) return target.id;
    }
    return null;
  }

  resetFrameClock() {
    this.lastFrameTimestamp = 0;
  }

  private createBackgroundParticle(): BackgroundParticle {
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

  private seedBackgroundParticles() {
    const count = Math.round(Math.min(92, Math.max(44, (this.width * this.height) / 11000)));
    this.backgroundParticles = Array.from({ length: count }, () =>
      this.createBackgroundParticle()
    );
  }

  private updateBackgroundParticles(deltaSeconds: number) {
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

  private projectPoint(
    point: Pick<ConePosition, "x" | "y" | "z">,
    viewOffsetY = this.camera.viewOffsetY
  ): ProjectedPoint {
    const cosYaw = Math.cos(this.camera.yaw);
    const sinYaw = Math.sin(this.camera.yaw);
    const x = point.x * cosYaw - point.z * sinYaw;
    const yawDepth = point.x * sinYaw + point.z * cosYaw;
    const cosPitch = Math.cos(this.camera.pitch);
    const sinPitch = Math.sin(this.camera.pitch);
    const y = point.y * cosPitch - yawDepth * sinPitch;
    const depth = point.y * sinPitch + yawDepth * cosPitch;
    const perspective = 19 / (19 + depth);
    const scale = Math.min(this.width, this.height) * 0.062 * this.camera.zoom * perspective;

    return {
      depth,
      radius: clamp(7.5 * this.camera.zoom * perspective, 4.5, 15),
      scale,
      screenX: this.width / 2 + x * scale,
      screenY: this.height / 2 + viewOffsetY - y * scale
    };
  }

  private getVerticalPanBounds() {
    const fallbackLimit = this.height * 1.15;
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
      return { maximum: fallbackLimit, minimum: -fallbackLimit };
    }

    return {
      maximum: Math.max(fallbackLimit, edgePadding - minY),
      minimum: Math.min(-fallbackLimit, this.height - edgePadding - maxY)
    };
  }

  private drawBackground(timestamp: number) {
    const gradient = this.context.createRadialGradient(
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
    this.context.fillStyle = gradient;
    this.context.fillRect(0, 0, this.width, this.height);
    this.drawParticleBackground(timestamp);
  }

  private drawParticleBackground(timestamp: number) {
    const linkDistance = Math.min(150, Math.max(96, this.width * 0.16));
    this.context.save();
    this.context.globalCompositeOperation = "lighter";

    for (let index = 0; index < this.backgroundParticles.length; index += 1) {
      for (let nextIndex = index + 1; nextIndex < this.backgroundParticles.length; nextIndex += 1) {
        const current = this.backgroundParticles[index];
        const next = this.backgroundParticles[nextIndex];
        const distance = Math.hypot(current.x - next.x, current.y - next.y);
        if (distance > linkDistance) continue;

        const opacity = Math.pow(1 - distance / linkDistance, 2) * 0.2;
        this.context.beginPath();
        this.context.moveTo(current.x, current.y);
        this.context.lineTo(next.x, next.y);
        this.context.strokeStyle = `rgba(180, 234, 255, ${opacity})`;
        this.context.lineWidth = 1;
        this.context.stroke();
      }
    }

    this.backgroundParticles.forEach((particle) => {
      const pulse = 0.72 + Math.sin(timestamp * 0.002 + particle.phase) * 0.28;
      this.context.beginPath();
      this.context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.context.fillStyle = `rgba(236, 250, 255, ${particle.alpha * pulse})`;
      this.context.shadowBlur = 10;
      this.context.shadowColor = "rgba(103, 232, 249, 0.55)";
      this.context.fill();
    });
    this.context.restore();
  }

  private drawRings() {
    this.layout.layers.forEach((layer) => {
      const firstPosition = this.layout.positions.get(layer[0]);
      if (!firstPosition) return;

      const points: ProjectedPoint[] = [];
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

      this.context.beginPath();
      points.forEach((point, index) => {
        if (index === 0) this.context.moveTo(point.screenX, point.screenY);
        else this.context.lineTo(point.screenX, point.screenY);
      });
      this.context.strokeStyle = "rgba(125, 211, 252, 0.16)";
      this.context.lineWidth = 1;
      this.context.stroke();
    });
  }

  private drawEdges(relatedIds: Set<string>) {
    const edges: Array<{
      relationship: KnowledgeRelationship;
      source: ProjectedPoint;
      target: ProjectedPoint;
    }> = [];

    this.layout.relationships.forEach((relationship) => {
      const source = this.layout.positions.get(relationship.source);
      const target = this.layout.positions.get(relationship.target);
      if (!source || !target) return;
      edges.push({
        relationship,
        source: this.projectPoint(source),
        target: this.projectPoint(target)
      });
    });

    edges
      .sort((left, right) =>
        left.source.depth + left.target.depth - right.source.depth - right.target.depth
      )
      .forEach(({ relationship, source, target }) => {
        const linked =
          relationship.source === this.selectedId || relationship.target === this.selectedId;
        const focused =
          !this.selectedId ||
          (relatedIds.has(relationship.source) && relatedIds.has(relationship.target));
        const opacity = linked ? 0.95 : focused ? 0.34 : 0.08;

        this.context.beginPath();
        this.context.moveTo(source.screenX, source.screenY);
        this.context.lineTo(target.screenX, target.screenY);
        this.context.strokeStyle = colorWithAlpha(
          getRelationshipColor(relationship.type),
          opacity
        );
        this.context.lineWidth = linked ? 2.5 : 1.25;
        this.context.stroke();
      });
  }

  private drawNodes(projectedNodes: ProjectedNode[], relatedIds: Set<string>) {
    this.hitTargets = [];
    projectedNodes
      .sort((left, right) => left.projected.depth - right.projected.depth)
      .forEach(({ domain, id, projected }) => {
        const selected = id === this.selectedId;
        const related = Boolean(this.selectedId && relatedIds.has(id));
        const opacity = !this.selectedId || selected || related ? 1 : 0.22;
        const radius = projected.radius * (selected ? 1.6 : related ? 1.22 : 1);
        const color = this.layout.domainColors.get(domain) ?? "#cbd5e1";

        this.context.save();
        this.context.globalAlpha = opacity;
        this.context.beginPath();
        this.context.arc(projected.screenX, projected.screenY, radius + 4, 0, Math.PI * 2);
        this.context.fillStyle = selected
          ? "rgba(251, 191, 36, 0.32)"
          : "rgba(103, 232, 249, 0.13)";
        this.context.fill();
        this.context.beginPath();
        this.context.arc(projected.screenX, projected.screenY, radius, 0, Math.PI * 2);
        this.context.fillStyle = color;
        this.context.fill();
        this.context.lineWidth = selected ? 3 : 1.4;
        this.context.strokeStyle = selected ? "#fde68a" : "rgba(226, 232, 240, 0.72)";
        this.context.stroke();
        this.context.restore();

        this.hitTargets.push({
          id,
          radius: radius + 6,
          x: projected.screenX,
          y: projected.screenY
        });
      });
  }

  private drawLabels(projectedNodes: ProjectedNode[], relatedIds: Set<string>) {
    projectedNodes
      .filter(({ id }) => Boolean(this.selectedId && relatedIds.has(id)))
      .sort((left, right) => left.projected.depth - right.projected.depth)
      .forEach(({ id, node, projected }) => {
        const selected = id === this.selectedId;
        const label = node.name;
        this.context.font = `${selected ? 800 : 700} 12px Inter, system-ui, sans-serif`;
        const width = Math.ceil(this.context.measureText(label).width) + 16;
        const height = 24;
        const x = projected.screenX - width / 2;
        const y = projected.screenY - projected.radius - 32;

        drawRoundRect(this.context, x, y, width, height, 8);
        this.context.fillStyle = selected
          ? "rgba(120, 53, 15, 0.88)"
          : "rgba(2, 8, 23, 0.78)";
        this.context.fill();
        this.context.strokeStyle = selected
          ? "rgba(251, 191, 36, 0.76)"
          : "rgba(125, 211, 252, 0.36)";
        this.context.stroke();
        this.context.fillStyle = "#f8fafc";
        this.context.textAlign = "center";
        this.context.textBaseline = "middle";
        this.context.fillText(label, projected.screenX, y + height / 2);
      });
  }
}

export function KnowledgeCone({
  active,
  data,
  selectedId,
  onClear,
  onOpen,
  onSelect
}: {
  active: boolean;
  data: KnowledgeData;
  selectedId: string | null;
  onClear: () => void;
  onOpen: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<ConeCanvasRenderer | null>(null);
  const pointerRef = useRef<ConePointerState | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const layout = useMemo(() => computeConeLayout(data), [data]);
  const nodeIndex = useMemo(
    () => new Map(data.nodes.map((node) => [node.id, node])),
    [data.nodes]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !stage || !context) return;

    const renderer = new ConeCanvasRenderer(canvas, context, data, layout, nodeIndex);
    rendererRef.current = renderer;
    const resize = () => {
      const rect = stage.getBoundingClientRect();
      renderer.resize(rect.width, rect.height, window.devicePixelRatio);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(stage);
    resize();

    return () => {
      observer.disconnect();
      rendererRef.current = null;
    };
  }, [data, layout, nodeIndex]);

  useEffect(() => {
    rendererRef.current?.setSelectedId(selectedId);
  }, [selectedId]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    rendererRef.current?.setReducedMotion(reducedMotion);
  }, [reducedMotion]);

  useEffect(() => {
    const renderer = rendererRef.current;
    const stage = stageRef.current;
    if (!active || !renderer || !stage) return;

    const rect = stage.getBoundingClientRect();
    renderer.resize(rect.width, rect.height, window.devicePixelRatio);
    renderer.resetFrameClock();
    renderer.renderFrame();
    if (reducedMotion) return;

    let frame = 0;
    const tick = (timestamp: number) => {
      renderer.renderFrame(timestamp);
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [active, reducedMotion]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const renderer = rendererRef.current;
    if (!active || !renderer || !event.isPrimary || event.button !== 0) return;

    pointerRef.current = {
      axis: null,
      distance: 0,
      dragging: true,
      pointerId: event.pointerId,
      startOffsetY: renderer.camera.viewOffsetY,
      startX: event.clientX,
      startY: event.clientY,
      startYaw: renderer.camera.yaw
    };
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const pointer = pointerRef.current;
    const renderer = rendererRef.current;
    if (!pointer?.dragging || !renderer || pointer.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - pointer.startX;
    const deltaY = event.clientY - pointer.startY;
    pointer.distance = Math.max(pointer.distance, Math.hypot(deltaX, deltaY));
    event.preventDefault();

    if (!pointer.axis && pointer.distance > 6) {
      pointer.axis = Math.abs(deltaX) > Math.abs(deltaY) ? "horizontal" : "vertical";
    }
    if (pointer.axis === "horizontal") {
      renderer.camera.yaw = pointer.startYaw + deltaX * 0.008;
    } else if (pointer.axis === "vertical") {
      renderer.camera.viewOffsetY = renderer.clampViewOffsetY(pointer.startOffsetY + deltaY);
    }
    renderer.renderFrame();
  };

  const endDrag = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const pointer = pointerRef.current;
    if (!pointer || pointer.pointerId !== event.pointerId) return;

    pointer.dragging = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const pointer = pointerRef.current;
    const renderer = rendererRef.current;
    if (!renderer || (pointer?.distance ?? 0) > 5) return;

    const id = renderer.pickNode(event.clientX, event.clientY);
    if (id) onSelect(id);
    else onClear();
  };

  const handleDoubleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const id = rendererRef.current?.pickNode(event.clientX, event.clientY);
    if (id) onOpen(id);
  };

  const handleWheel = (event: ReactWheelEvent<HTMLCanvasElement>) => {
    const renderer = rendererRef.current;
    if (!active || !renderer) return;

    event.preventDefault();
    const deltaMultiplier = event.deltaMode === 1 ? 18 : 1;
    if (event.ctrlKey || event.metaKey) {
      renderer.camera.zoom = clamp(
        renderer.camera.zoom * Math.exp(-event.deltaY * deltaMultiplier * 0.0014),
        0.48,
        2.8
      );
      renderer.camera.viewOffsetY = renderer.clampViewOffsetY(renderer.camera.viewOffsetY);
    } else {
      renderer.camera.viewOffsetY = renderer.clampViewOffsetY(
        renderer.camera.viewOffsetY - event.deltaY * deltaMultiplier
      );
    }
    renderer.renderFrame();
  };

  return (
    <section className="graph-panel cone-panel" aria-label="3D cone dependency graph">
      <div className="cone-stage" ref={stageRef}>
        <canvas
          aria-label="Interactive 3D cone tree"
          className="cone-canvas"
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          onPointerCancel={endDrag}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onWheel={handleWheel}
          ref={canvasRef}
        />
      </div>
      <div className="cone-toolbar">
        <strong>Explore in 3D</strong>
        <span>Drag to rotate or pan · Scroll to move · Ctrl/⌘ + scroll to zoom</span>
      </div>
      <div className="cone-legend" aria-label="3D cone legend">
        <div>
          <strong>Domains</strong>
          <div className="cone-legend-row">
            {[...layout.domainColors].map(([domain, color]) => (
              <span className="cone-legend-item" key={domain}>
                <i style={{ background: color }} />{domain}
              </span>
            ))}
          </div>
        </div>
        <div>
          <strong>Relationships</strong>
          <div className="cone-legend-row">
            {relationshipTypes.map((type) => (
              <span className="cone-legend-item relationship" key={type}>
                <i style={{ background: getRelationshipColor(type) }} />
                {relationshipLabels[type]}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
