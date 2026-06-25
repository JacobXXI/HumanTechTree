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
