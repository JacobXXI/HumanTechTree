"use client";

import {
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react";

import {
  computeLayers,
  getFocusedSubgraphIds,
  getRelationshipColor,
  getRenderableRelationships
} from "@/lib/knowledge/graph";
import type { KnowledgeData } from "@/lib/knowledge/types";

const MIN_SCALE = 0.2;
const MAX_SCALE = 2.4;
const ZOOM_STEP = 1.18;

interface GraphCamera {
  autoFit: boolean;
  scale: number;
  x: number;
  y: number;
}

interface DragState {
  distance: number;
  originX: number;
  originY: number;
  pointerId: number;
  startX: number;
  startY: number;
}

interface BackgroundParticle {
  alpha: number;
  phase: number;
  radius: number;
  vx: number;
  vy: number;
  x: number;
  y: number;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function KnowledgeGraph({
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
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const suppressClickRef = useRef(false);
  const [dragging, setDragging] = useState(false);
  const [camera, setCamera] = useState<GraphCamera>({
    autoFit: true,
    scale: 1,
    x: 0,
    y: 0
  });
  const cameraRef = useRef(camera);

  const layout = useMemo(() => {
    const relationships = getRenderableRelationships(data);
    const layers = computeLayers(data.nodes, relationships);
    const width = Math.max(900, ...layers.map((layer) => layer.length * 190 + 80));
    const height = Math.max(680, layers.length * 150 + 100);
    const positions = new Map<string, { x: number; y: number }>();

    layers.forEach((layer, layerIndex) => {
      layer.forEach((id, index) => {
        positions.set(id, {
          x: ((index + 1) * width) / (layer.length + 1),
          y: height - 80 - layerIndex * ((height - 160) / Math.max(layers.length - 1, 1))
        });
      });
    });

    return {
      height,
      layers,
      nodeIndex: new Map(data.nodes.map((node) => [node.id, node])),
      positions,
      relationships,
      width
    };
  }, [data]);

  const focused = useMemo(
    () => (selectedId ? getFocusedSubgraphIds(data, selectedId) : null),
    [data, selectedId]
  );

  const updateCamera = useCallback((nextCamera: GraphCamera) => {
    cameraRef.current = nextCamera;
    setCamera(nextCamera);
  }, []);

  const fitGraph = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const inset = 24;
    const panelWidth = panel.clientWidth;
    const panelHeight = panel.clientHeight;
    if (!panelWidth || !panelHeight) return;

    const scale = clamp(
      Math.min(
        1,
        (panelWidth - inset * 2) / layout.width,
        (panelHeight - inset * 2) / layout.height
      ),
      MIN_SCALE,
      MAX_SCALE
    );

    updateCamera({
      autoFit: true,
      scale,
      x: Math.round((panelWidth - layout.width * scale) / 2),
      y: Math.round((panelHeight - layout.height * scale) / 2)
    });
  }, [layout.height, layout.width, updateCamera]);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const observer = new ResizeObserver(() => {
      if (cameraRef.current.autoFit) fitGraph();
    });
    observer.observe(panel);
    if (active && cameraRef.current.autoFit) fitGraph();

    return () => observer.disconnect();
  }, [active, fitGraph]);

  useLayoutEffect(() => {
    if (active && cameraRef.current.autoFit) fitGraph();
  }, [active, fitGraph]);

  useLayoutEffect(() => {
    if (!active) return;

    const canvas = backgroundCanvasRef.current;
    const panel = panelRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !panel || !context) return;

    const particles: BackgroundParticle[] = [];
    let animationFrame = 0;
    let height = 0;
    let lastTimestamp = performance.now();
    let pixelRatio = 1;
    let width = 0;

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const createParticle = (): BackgroundParticle => ({
      alpha: 0.16 + Math.random() * 0.2,
      phase: Math.random() * Math.PI * 2,
      radius: 1 + Math.random() * 1.8,
      vx: (Math.random() - 0.5) * 18,
      vy: (Math.random() - 0.5) * 12,
      x: Math.random() * width,
      y: Math.random() * height
    });

    const seedParticles = () => {
      const count = Math.round(Math.min(92, Math.max(44, (width * height) / 11000)));
      particles.length = 0;
      particles.push(...Array.from({ length: count }, createParticle));
    };

    const resizeCanvas = () => {
      const nextWidth = panel.clientWidth;
      const nextHeight = panel.clientHeight;
      if (!nextWidth || !nextHeight) return false;

      const nextPixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const sizeChanged =
        nextWidth !== width || nextHeight !== height || nextPixelRatio !== pixelRatio;

      width = nextWidth;
      height = nextHeight;
      pixelRatio = nextPixelRatio;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      if (sizeChanged || !particles.length) seedParticles();
      return true;
    };

    const updateParticles = (deltaSeconds: number) => {
      const margin = 18;
      particles.forEach((particle) => {
        particle.x += particle.vx * deltaSeconds;
        particle.y += particle.vy * deltaSeconds;

        if (particle.x < margin || particle.x > width - margin) {
          particle.vx *= -1;
          particle.x = Math.min(width - margin, Math.max(margin, particle.x));
        }

        if (particle.y < margin || particle.y > height - margin) {
          particle.vy *= -1;
          particle.y = Math.min(height - margin, Math.max(margin, particle.y));
        }
      });
    };

    const drawParticles = (timestamp: number) => {
      context.clearRect(0, 0, width, height);
      context.lineWidth = 1;

      for (let index = 0; index < particles.length; index += 1) {
        for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
          const current = particles[index];
          const next = particles[nextIndex];
          const distance = Math.hypot(current.x - next.x, current.y - next.y);
          if (distance > 148) continue;

          context.beginPath();
          context.moveTo(current.x, current.y);
          context.lineTo(next.x, next.y);
          context.strokeStyle = `rgba(125, 211, 252, ${0.12 * (1 - distance / 148)})`;
          context.stroke();
        }
      }

      particles.forEach((particle) => {
        const pulse = 0.72 + Math.sin(timestamp * 0.002 + particle.phase) * 0.28;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(236, 250, 255, ${particle.alpha * pulse})`;
        context.fill();
      });
    };

    const drawFrame = (timestamp: number) => {
      if (!resizeCanvas()) {
        animationFrame = window.requestAnimationFrame(drawFrame);
        return;
      }

      const deltaSeconds = Math.min(0.05, (timestamp - lastTimestamp) / 1000 || 0);
      lastTimestamp = timestamp;
      if (!reducedMotionQuery.matches) updateParticles(deltaSeconds);
      drawParticles(timestamp);
      animationFrame = window.requestAnimationFrame(drawFrame);
    };

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });

    resizeObserver.observe(panel);
    resizeCanvas();
    animationFrame = window.requestAnimationFrame(drawFrame);

    return () => {
      resizeObserver.disconnect();
      window.cancelAnimationFrame(animationFrame);
    };
  }, [active]);

  const zoomAt = useCallback(
    (panelX: number, panelY: number, factor: number) => {
      const current = cameraRef.current;
      const scale = clamp(current.scale * factor, MIN_SCALE, MAX_SCALE);
      if (scale === current.scale) return;

      const ratio = scale / current.scale;
      updateCamera({
        autoFit: false,
        scale,
        x: panelX - (panelX - current.x) * ratio,
        y: panelY - (panelY - current.y) * ratio
      });
    },
    [updateCamera]
  );

  const zoomFromCenter = (factor: number) => {
    const panel = panelRef.current;
    if (!panel) return;
    zoomAt(panel.clientWidth / 2, panel.clientHeight / 2, factor);
  };

  const shouldIgnorePointer = (target: EventTarget | null) =>
    target instanceof Element &&
    Boolean(target.closest(".graph-node, .graph-toolbar, .zoom-controls"));

  const handlePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (!active || !event.isPrimary || event.button !== 0 || shouldIgnorePointer(event.target)) {
      return;
    }

    const current = cameraRef.current;
    dragRef.current = {
      distance: 0,
      originX: current.x,
      originY: current.y,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY
    };
    suppressClickRef.current = false;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    drag.distance = Math.max(drag.distance, Math.hypot(deltaX, deltaY));
    if (drag.distance > 3) event.preventDefault();

    updateCamera({
      autoFit: false,
      scale: cameraRef.current.scale,
      x: drag.originX + deltaX,
      y: drag.originY + deltaY
    });
  };

  const endDrag = (event: ReactPointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    suppressClickRef.current = drag.distance > 4;
    dragRef.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
  };

  const handleWheel = (event: ReactWheelEvent<HTMLElement>) => {
    if (!active || shouldIgnorePointer(event.target)) return;

    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const deltaMultiplier = event.deltaMode === 1 ? 18 : 1;
    const factor = Math.exp(-event.deltaY * deltaMultiplier * 0.0016);
    zoomAt(event.clientX - rect.left, event.clientY - rect.top, factor);
  };

  const handleBackgroundClick = (event: React.MouseEvent<HTMLElement>) => {
    if (shouldIgnorePointer(event.target) || suppressClickRef.current) return;
    onClear();
  };

  return (
    <section
      aria-label="2D dependency graph"
      className={`graph-panel react-graph-panel${dragging ? " is-dragging" : ""}`}
      data-camera-scale={camera.scale.toFixed(4)}
      data-camera-x={camera.x.toFixed(1)}
      data-camera-y={camera.y.toFixed(1)}
      onClick={handleBackgroundClick}
      onPointerCancel={endDrag}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onWheel={handleWheel}
      ref={panelRef}
    >
      <canvas aria-hidden="true" className="network-background" ref={backgroundCanvasRef} />
      <div className="graph-toolbar">
        <span><i className="legend-dot prerequisite" />Prerequisite</span>
        <span><i className="legend-dot application" />Application</span>
      </div>
      <div className="zoom-controls" aria-label="Tree zoom controls">
        <button
          aria-label="Zoom out"
          className="zoom-button"
          onClick={() => zoomFromCenter(1 / ZOOM_STEP)}
          title="Zoom out"
          type="button"
        >
          −
        </button>
        <button
          aria-label="Fit graph to view"
          className="zoom-button zoom-value"
          onClick={fitGraph}
          title="Fit graph to view"
          type="button"
        >
          {Math.round(camera.scale * 100)}%
        </button>
        <button
          aria-label="Zoom in"
          className="zoom-button"
          onClick={() => zoomFromCenter(ZOOM_STEP)}
          title="Zoom in"
          type="button"
        >
          +
        </button>
      </div>
      <div
        className="react-graph"
        style={{
          height: layout.height,
          transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`,
          width: layout.width
        }}
      >
        <svg
          aria-hidden="true"
          className="edge-layer"
          height={layout.height}
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          width={layout.width}
        >
          {layout.relationships.map((relationship, index) => {
            const source = layout.positions.get(relationship.source);
            const target = layout.positions.get(relationship.target);
            if (!source || !target) return null;
            const emphasized =
              relationship.source === selectedId || relationship.target === selectedId;
            const visible =
              !focused || (focused.has(relationship.source) && focused.has(relationship.target));
            return (
              <path
                d={`M ${source.x} ${source.y - 28} C ${source.x} ${source.y - 78}, ${target.x} ${target.y + 78}, ${target.x} ${target.y + 28}`}
                fill="none"
                key={`${relationship.source}-${relationship.target}-${index}`}
                opacity={emphasized ? 0.95 : visible ? 0.5 : 0.12}
                stroke={getRelationshipColor(relationship.type)}
                strokeWidth={emphasized ? 3 : 1.6}
              />
            );
          })}
        </svg>
        {layout.layers.flat().map((id) => {
          const node = layout.nodeIndex.get(id)!;
          const position = layout.positions.get(id)!;
          return (
            <button
              className={[
                "graph-node",
                id === selectedId ? "is-selected" : "",
                focused?.has(id) && id !== selectedId ? "is-related" : "",
                focused && !focused.has(id) ? "is-dimmed" : ""
              ].filter(Boolean).join(" ")}
              key={id}
              onClick={(event) => {
                event.stopPropagation();
                onSelect(id);
              }}
              onDoubleClick={(event) => {
                event.stopPropagation();
                onOpen(id);
              }}
              style={{ left: position.x - 75, top: position.y - 29 }}
              type="button"
            >
              <strong>{node.name}</strong>
            </button>
          );
        })}
      </div>
    </section>
  );
}
