# Human Technology Tree

This repository contains an MVP demo for the Human Technology Tree idea described in `PROJECT_DEVELOPMENT_GUIDELINE.md`.

## Demo

Open `index.html` in a browser to try the machine learning knowledge demo, or run a local server from the repository root:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000/`. It includes:

- 10 reviewed machine learning knowledge nodes.
- A searchable and filterable side navigator.
- A full-pane 2D prerequisite graph.
- A knowledge introduction page opened from either the sidebar or the tree.
- Descriptions, derived prerequisites, derived enabled ideas, tags, status, and references for each node.

The seed data lives in `src/data/machine-learning-knowledge.js` so the same source can later drive a Docusaurus or React implementation. Relationship records are the source of truth for prerequisites and enabled ideas.

## Project Structure

The demo is split into focused modules:

```text
src/
  app.js
  data/
    machine-learning-knowledge.js
  graph/
    knowledge-graph.js
  ui/
    renderers.js
  validation/
    knowledge-data-validation.js
tests/
  data-validation/
    validate-knowledge-data.mjs
```

This keeps content data, graph logic, UI rendering, validation, and application wiring separate while preserving the no-build static demo.

## Validation

Run the knowledge data validation before expanding or editing the seed database:

```sh
npm run validate:data
```

The validator checks required fields, duplicate IDs, relationship endpoints, allowed statuses and relationship types, reference URLs, duplicate relationships, and prerequisite cycles.

## GitHub Pages Deployment

This repository is ready to publish with GitHub Pages using the static files at the repository root.

Before deploying, run:

```sh
npm test
```

In GitHub, open `Settings -> Pages`, then set:

- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/ (root)`

After GitHub Pages finishes publishing, the project will be available at:

```text
https://jacobxxi.github.io/HumanTechTree/
```

## Knowledge Nodes

The first demo covers:

1. Linear Algebra
2. Probability Theory
3. Calculus
4. Statistics
5. Optimization
6. Gradient Descent
7. Supervised Learning
8. Decision Trees
9. Neural Networks
10. Backpropagation

## Next Steps

The guideline recommends evolving this into a Docusaurus site with React-driven interactive views. A practical next step is to move the demo data into a schema-validated JSON file and render it through Docusaurus pages and reusable React components.
