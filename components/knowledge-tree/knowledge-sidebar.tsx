import { KnowledgeFilters } from "./knowledge-filters";
import type { KnowledgeNode } from "@/lib/knowledge/types";

interface KnowledgeSidebarProps {
  activeCategory: string;
  categoryOptions: Array<{
    count: number;
    label: string;
    value: string;
  }>;
  filteredNodeCount: number;
  matchingNodeCount: number;
  nodes: KnowledgeNode[];
  query: string;
  selectedId: string | null;
  onCategoryChange: (category: string) => void;
  onOpen: (id: string) => void;
  onQueryChange: (query: string) => void;
}

export function KnowledgeSidebar(props: KnowledgeSidebarProps) {
  const summary = props.query
    ? `${props.matchingNodeCount} of ${props.filteredNodeCount} visible nodes match`
    : `${props.filteredNodeCount} nodes visible in the tree`;

  return (
    <aside className="navigator" aria-label="Knowledge navigator">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">HT</span>
        <h1>Human Technology Tree</h1>
      </div>
      <label className="search-label" htmlFor="searchInput">Search knowledge</label>
      <input
        className="search-input"
        id="searchInput"
        onChange={(event) => props.onQueryChange(event.target.value)}
        placeholder="Search by name, tag, or text"
        type="search"
        value={props.query}
      />
      <p className="search-label" id="categoryFilterLabel">Tree category</p>
      <KnowledgeFilters
        activeCategory={props.activeCategory}
        labelId="categoryFilterLabel"
        onChange={props.onCategoryChange}
        options={props.categoryOptions}
      />
      <p className="filter-summary" role="status">{summary}</p>
      <nav className="node-list" aria-label="Knowledge nodes">
        {props.nodes.length ? (
          props.nodes.map((node) => (
            <button
              className={`node-button${node.id === props.selectedId ? " is-active" : ""}`}
              key={node.id}
              onClick={() => props.onOpen(node.id)}
              type="button"
            >
              <strong>{node.name}</strong>
              <span>{node.tags.slice(0, 2).join(" / ")}</span>
            </button>
          ))
        ) : (
          <p className="empty-state">No matching knowledge nodes.</p>
        )}
      </nav>
    </aside>
  );
}
