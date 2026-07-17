interface CategoryOption {
  count: number;
  label: string;
  value: string;
}

interface KnowledgeFiltersProps {
  activeCategory: string;
  id: string;
  onChange: (category: string) => void;
  options: CategoryOption[];
}

export function KnowledgeFilters({ activeCategory, id, onChange, options }: KnowledgeFiltersProps) {
  return (
    <div className="filter-select">
      <select
        aria-label="Filter tree by category"
        className="filter-select-input"
        id={id}
        onChange={(event) => onChange(event.target.value)}
        value={activeCategory}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label} ({option.count})
          </option>
        ))}
      </select>
    </div>
  );
}
