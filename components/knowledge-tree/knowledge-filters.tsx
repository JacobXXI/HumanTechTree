interface KnowledgeFiltersProps {
  activeFilter: string;
  filters: string[];
  onChange: (filter: string) => void;
}

const labels: Record<string, string> = {
  Mathematics: "Math",
  Statistics: "Stats",
  "Machine Learning": "ML",
  "Deep Learning": "Deep",
  Optimization: "Optim"
};

export function KnowledgeFilters({ activeFilter, filters, onChange }: KnowledgeFiltersProps) {
  return (
    <div className="filter-group" aria-label="Filter by tag">
      {["all", ...filters].map((filter) => (
        <button
          className={`filter-button${filter === activeFilter ? " is-active" : ""}`}
          key={filter}
          onClick={() => onChange(filter)}
          type="button"
        >
          {filter === "all" ? "All" : labels[filter] ?? filter}
        </button>
      ))}
    </div>
  );
}
