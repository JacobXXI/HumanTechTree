"use client";

import { useEffect, useMemo, useState } from "react";

import { KnowledgeDetailPanel } from "./knowledge-detail-panel";
import { KnowledgeCone } from "./knowledge-cone";
import { KnowledgeGraph } from "./knowledge-graph";
import { KnowledgeSidebar } from "./knowledge-sidebar";
import {
  getAvailableCategories,
  getNodeIndex,
  matchesCategory,
  matchesQuery
} from "@/lib/knowledge/selectors";
import type { KnowledgeData, VisualizationMode } from "@/lib/knowledge/types";

const preferredCategories = [
  "Mathematics",
  "Statistics",
  "Machine Learning",
  "Deep Learning",
  "Computer Science",
  "Computing Systems",
  "Data Science"
];

export function KnowledgeTreePage({ data }: { data: KnowledgeData }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openDetailId, setOpenDetailId] = useState<string | null>(null);
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>("2d");
  const nodeIndex = useMemo(() => getNodeIndex(data), [data]);
  const categoryNodes = useMemo(
    () => data.nodes.filter((node) => matchesCategory(node, category)),
    [category, data.nodes]
  );
  const visibleNodeIds = useMemo(
    () => new Set(categoryNodes.map((node) => node.id)),
    [categoryNodes]
  );
  const nodes = useMemo(
    () => categoryNodes.filter((node) => matchesQuery(node, query)),
    [categoryNodes, query]
  );
  const graphData = useMemo(
    () => ({
      ...data,
      nodes: categoryNodes,
      relationships: data.relationships.filter(
        (relationship) =>
          visibleNodeIds.has(relationship.source) && visibleNodeIds.has(relationship.target)
      )
    }),
    [categoryNodes, data, visibleNodeIds]
  );
  const availableCategories = getAvailableCategories(data);
  const categories = [
    ...preferredCategories.filter((item) => availableCategories.includes(item)),
    ...availableCategories.filter((item) => !preferredCategories.includes(item))
  ];
  const openNode = openDetailId ? nodeIndex.get(openDetailId) : null;

  useEffect(() => {
    if (selectedId && !visibleNodeIds.has(selectedId)) setSelectedId(null);
    if (openDetailId && !visibleNodeIds.has(openDetailId)) setOpenDetailId(null);
  }, [openDetailId, selectedId, visibleNodeIds]);

  const openDetails = (id: string) => {
    setSelectedId(id);
    setOpenDetailId(id);
  };

  return (
    <main className="app-shell">
      <KnowledgeSidebar
        activeCategory={category}
        categories={categories}
        nodes={nodes}
        onCategoryChange={setCategory}
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
              data={graphData}
              onClear={() => setSelectedId(null)}
              onOpen={openDetails}
              onSelect={setSelectedId}
              selectedId={selectedId}
            />
          </div>
          <div className="tree-view cone-view" hidden={visualizationMode !== "3d"}>
            <KnowledgeCone
              active={visualizationMode === "3d"}
              data={graphData}
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
