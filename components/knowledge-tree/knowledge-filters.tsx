interface CategoryOption {
  count: number;
  label: string;
  value: string;
}

interface KnowledgeFiltersProps {
  activeCategory: string;
  labelId: string;
  onChange: (category: string) => void;
  options: CategoryOption[];
}

export function KnowledgeFilters({
  activeCategory,
  labelId,
  onChange,
  options
}: KnowledgeFiltersProps) {
  return (
    <div aria-labelledby={labelId} className="category-filter-list" role="radiogroup">
      {options.map((option) => {
        const active = option.value === activeCategory;
        return (
          <button
            aria-checked={active}
            className={`category-filter-button${active ? " is-active" : ""}`}
            key={option.value}
            onClick={() => onChange(option.value)}
            role="radio"
            type="button"
          >
            <span>{option.label}</span>
            <strong>{option.count}</strong>
          </button>
        );
      })}
    </div>
  );
}
