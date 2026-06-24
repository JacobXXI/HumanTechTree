# Next.js + React Migration Plan

This repository is currently a no-build static prototype. A safe migration path is to keep the current behavior as the reference implementation, then move the data model and UI into a Next.js application incrementally.

## Migration Goals

- Preserve the existing knowledge graph behavior while changing the delivery framework.
- Reuse the current modular split between data, graph logic, UI rendering, and validation.
- Prefer a small vertical slice in Next.js over a full rewrite in one pass.
- Keep content validation independent from the web framework.

## Recommended Target Stack

- Next.js with the App Router for page structure and static generation.
- React components for the sidebar, detail panel, search controls, filters, and graph container.
- Plain TypeScript modules for graph building, derived prerequisite logic, and data validation.
- A framework-agnostic knowledge dataset that can be imported by both tests and UI components.

## Proposed Target Structure

```text
app/
  layout.tsx
  page.tsx
  intro/page.tsx
components/
  knowledge-tree/
    knowledge-tree-page.tsx
    knowledge-sidebar.tsx
    knowledge-detail-panel.tsx
    knowledge-filters.tsx
lib/
  knowledge/
    graph.ts
    selectors.ts
    validation.ts
data/
  machine-learning-knowledge.json
public/
  img/
tests/
  data-validation/
  smoke/
```

## File Mapping From The Current Prototype

- `index.html` -> `app/page.tsx`
- `styles.css` -> `app/globals.css` plus component-level styles
- `src/app.js` -> `components/knowledge-tree/knowledge-tree-page.tsx`
- `src/graph/knowledge-graph.js` -> `lib/knowledge/graph.ts`
- `src/ui/renderers.js` -> `components/knowledge-tree/*`
- `src/validation/knowledge-data-validation.js` -> `lib/knowledge/validation.ts`
- `src/data/machine-learning-knowledge.js` -> `data/machine-learning-knowledge.json` or `data/machine-learning-knowledge.ts`

## Incremental Delivery Plan

1. Extract the knowledge dataset into a framework-neutral format and keep the current validation tests green.
2. Port graph helpers into plain modules with the same inputs and outputs as the static app.
3. Render the existing introduction page and node detail panel in Next.js with static seed data.
4. Move search, filters, and the 2D graph view into React components after content parity is reached.
5. Add deployment configuration only after the Next.js app can replace the current root `index.html`.

## Guardrails

- Do not mix framework migration with large content expansion in the same change set.
- Do not delete the static prototype until the Next.js version has feature parity for navigation, node details, and validation.
- Keep validation executable from `npm test` so data quality remains enforced during the transition.

## Good First Milestone

The lowest-risk first implementation step is to convert the current knowledge dataset into a framework-neutral data module, then render a read-only Next.js page from that source without changing the graph semantics.
