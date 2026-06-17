# Knowledge Database Entry Template

Use this template when adding future knowledge to `src/data/machine-learning-knowledge.js`.

The database is relationship-authoritative. Do not add `prerequisites` or `enabled` fields to node objects. Add relationships instead, then run validation.

## 1. Current Knowledge Node

Add a full node when the idea should appear in the searchable list, graph, and detail page.

```js
{
  id: "new-concept-id",
  name: "New Concept Name",
  tags: ["Field", "Subfield"],
  description:
    "One or two concise sentences explaining what the concept is and what problem it helps solve.",
  importance:
    "One or two concise sentences explaining why this concept matters historically, scientifically, or practically.",
  references: [
    {
      title: "Reference title",
      url: "https://example.com/reference",
      type: "Book, Paper, Course, Documentation, Video series, or Interactive explainer"
    }
  ],
  status: "draft"
}
```

Allowed statuses:

- `draft`
- `reviewed`
- `verified`
- `incomplete`
- `uncertain`

## 2. Future Knowledge Node

Add a future node only when a relationship points to an idea that should be shown as an enabled idea but is not ready to become a full graph node yet.

```js
{
  id: "future-concept-id",
  name: "Future Concept Name"
}
```

## 3. Relationship Entry

Relationships are the source of truth for prerequisites and enabled ideas.

Direction rule: `source` supports, enables, influences, or is used by `target`.

```js
{
  source: "supporting-concept-id",
  target: "dependent-or-enabled-concept-id",
  type: "prerequisite",
  note: "A short explanation of why this relationship exists."
}
```

Allowed relationship types:

- `prerequisite`: The source is required before the target can be understood, invented, or used.
- `influence`: The source helped shape the target but is not strictly required.
- `application`: The source is used inside the target or makes the target practical.
- `alternative-path`: The source provides another route toward similar understanding or capability.

Examples:

```js
{
  source: "linear-algebra",
  target: "neural-networks",
  type: "prerequisite",
  note: "Layer computations are built from vector and matrix operations."
}
```

```js
{
  source: "decision-trees",
  target: "ensemble-methods",
  type: "application",
  note: "Decision trees are commonly combined into stronger ensemble methods."
}
```

## 4. Contributor Checklist

Before submitting a database change:

1. Add full concepts to `nodes`.
2. Add not-yet-modeled target concepts to `futureNodes`.
3. Add relationships for every prerequisite, influence, application, or alternative path.
4. Keep relationship notes specific and factual.
5. Use stable lowercase kebab-case IDs.
6. Include at least one reliable reference for every full node.
7. Run validation:

```sh
npm run validate:data
```

The validator will fail if node IDs are duplicated, required fields are missing, relationship targets are unknown, relationship types are invalid, URLs are malformed, node-level `prerequisites` or `enabled` fields are present, or prerequisite cycles are introduced.
