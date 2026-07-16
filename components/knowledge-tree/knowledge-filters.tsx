interface KnowledgeFiltersProps {
  activeCategory: string;
  categories: string[];
  onChange: (category: string) => void;
}

const labels: Record<string, string> = {
  "Computer Science": "CS",
  "Computing Systems": "Systems",
  "Data Science": "Data",
  Mathematics: "Math",
  Statistics: "Stats",
  "Machine Learning": "ML",
  "Deep Learning": "Deep",
  Other: "Other"
};

export function KnowledgeFilters({ activeCategory, categories, onChange }: KnowledgeFiltersProps) {
  return (
    <div className="filter-group" aria-label="Filter tree by category">
      {["all", ...categories].map((category) => (
        <button
          aria-label={category === "all" ? "All categories" : category}
          aria-pressed={category === activeCategory}
          className={`filter-button${category === activeCategory ? " is-active" : ""}`}
          key={category}
          onClick={() => onChange(category)}
          title={category === "all" ? "All categories" : category}
          type="button"
        >
          {category === "all" ? "All" : labels[category] ?? category}
        </button>
      ))}
    </div>
  );
}
