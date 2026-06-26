"use client";

import { useMemo, useState } from "react";

import { KnowledgeDetailPanel } from "./knowledge-detail-panel";
import { KnowledgeCone } from "./knowledge-cone";
import { KnowledgeGraph } from "./knowledge-graph";
import { KnowledgeSidebar } from "./knowledge-sidebar";
import { getAvailableTags, getNodeIndex, matchesNode } from "@/lib/knowledge/selectors";
import type { KnowledgeData, VisualizationMode } from "@/lib/knowledge/types";

const preferredFilters = ["Mathematics", "Statistics", "Machine Learning", "Deep Learning", "Optimization"];

export function KnowledgeTreePage({ data }: { data: KnowledgeData }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openDetailId, setOpenDetailId] = useState<string | null>(null);
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>("2d");
  const nodes = useMemo(
    () => data.nodes.filter((node) => matchesNode(node, query, filter)),
    [data.nodes, filter, query]
  );
  const availableTags = getAvailableTags(data);
  const filters = preferredFilters.filter((tag) => availableTags.includes(tag));
  const openNode = openDetailId ? getNodeIndex(data).get(openDetailId) : null;

  const openDetails = (id: string) => {
    setSelectedId(id);
    setOpenDetailId(id);
  };

  return (
    <main className="app-shell">
      <KnowledgeSidebar
        activeFilter={filter}
        filters={filters}
        nodes={nodes}
        onFilterChange={setFilter}
        onOpen={openDetails}
        onQueryChange={setQuery}
        query={query}
        selectedId={selectedId}
      />
      <section className="workspace" aria-label="Knowledge workspace">
        <div className="view-switcher" aria-label="Visualization view switcher">
          {(["2d", "3d"] as const).map((mode) => (
            <button
              aria-pressed={visualizationMode === mode}
              className={`view-button${visualizationMode === mode ? " is-active" : ""}`}
              key={mode}
              onClick={() => setVisualizationMode(mode)}
              type="button"
            >
              {mode.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="visualization-stack">
          <div className="tree-view" hidden={visualizationMode !== "2d"}>
            <KnowledgeGraph
              active={visualizationMode === "2d"}
              data={data}
              onClear={() => setSelectedId(null)}
              onOpen={openDetails}
              onSelect={setSelectedId}
              selectedId={selectedId}
            />
          </div>
          <div className="tree-view cone-view" hidden={visualizationMode !== "3d"}>
            <KnowledgeCone
              active={visualizationMode === "3d"}
              data={data}
              onClear={() => setSelectedId(null)}
              onOpen={openDetails}
              onSelect={setSelectedId}
              selectedId={selectedId}
            />
          </div>
        </div>
        {openNode ? (
          <KnowledgeDetailPanel data={data} node={openNode} onClose={() => setOpenDetailId(null)} />
        ) : null}
      </section>
    </main>
  );
}
