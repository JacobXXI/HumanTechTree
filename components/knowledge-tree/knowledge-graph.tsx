import { computeLayers, getFocusedSubgraphIds, getRelationshipColor, getRenderableRelationships } from "@/lib/knowledge/graph";
import type { KnowledgeData } from "@/lib/knowledge/types";

export function KnowledgeGraph({
  data,
  selectedId,
  onSelect
}: {
  data: KnowledgeData;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const relationships = getRenderableRelationships(data);
  const layers = computeLayers(data.nodes, relationships);
  const nodeIndex = new Map(data.nodes.map((node) => [node.id, node]));
  const focused = selectedId ? getFocusedSubgraphIds(data, selectedId) : null;
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

  return (
    <section className="graph-panel" aria-label="2D dependency graph">
      <div className="graph-toolbar">
        <span><i className="legend-dot prerequisite" />Prerequisite</span>
        <span><i className="legend-dot application" />Application</span>
      </div>
      <div className="react-graph" style={{ width, height }}>
        <svg className="edge-layer" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
          {relationships.map((relationship, index) => {
            const source = positions.get(relationship.source);
            const target = positions.get(relationship.target);
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
        {layers.flat().map((id) => {
          const node = nodeIndex.get(id)!;
          const position = positions.get(id)!;
          return (
            <button
              className={[
                "graph-node",
                id === selectedId ? "is-selected" : "",
                focused?.has(id) && id !== selectedId ? "is-related" : "",
                focused && !focused.has(id) ? "is-dimmed" : ""
              ].filter(Boolean).join(" ")}
              key={id}
              onClick={() => onSelect(id)}
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
