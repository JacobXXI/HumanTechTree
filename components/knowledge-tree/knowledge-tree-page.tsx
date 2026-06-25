"use client";

import { useMemo, useState } from "react";

import { KnowledgeDetailPanel } from "./knowledge-detail-panel";
import { KnowledgeGraph } from "./knowledge-graph";
import { KnowledgeSidebar } from "./knowledge-sidebar";
import { getAvailableTags, getNodeIndex, matchesNode } from "@/lib/knowledge/selectors";
import type { KnowledgeData } from "@/lib/knowledge/types";

const preferredFilters = ["Mathematics", "Statistics", "Machine Learning", "Deep Learning", "Optimization"];

export function KnowledgeTreePage({ data }: { data: KnowledgeData }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const nodes = useMemo(
    () => data.nodes.filter((node) => matchesNode(node, query, filter)),
    [data.nodes, filter, query]
  );
  const availableTags = getAvailableTags(data);
  const filters = preferredFilters.filter((tag) => availableTags.includes(tag));
  const selectedNode = selectedId ? getNodeIndex(data).get(selectedId) : null;

  return (
    <main className="app-shell">
      <KnowledgeSidebar
        activeFilter={filter}
        filters={filters}
        nodes={nodes}
        onFilterChange={setFilter}
        onQueryChange={setQuery}
        onSelect={setSelectedId}
        query={query}
        selectedId={selectedId}
      />
      <section className="workspace" aria-label="Knowledge workspace">
        <KnowledgeGraph data={data} onSelect={setSelectedId} selectedId={selectedId} />
        {selectedNode ? (
          <KnowledgeDetailPanel data={data} node={selectedNode} onClose={() => setSelectedId(null)} />
        ) : null}
      </section>
    </main>
  );
}
