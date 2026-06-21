# Human Technology Tree

This repository contains an MVP demo for the Human Technology Tree idea described in `PROJECT_DEVELOPMENT_GUIDELINE.md`.

## Demo

Open `index.html` in a browser to try the machine learning knowledge demo, or run a local server from the repository root:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000/`. It includes:

- 110 reviewed technology and machine learning knowledge nodes.
- 197 relationship records covering prerequisites, influences, applications, and alternative paths.
- A searchable side navigator with data-driven high-level tag filters.
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

## Knowledge Entry Template

Use `templates/knowledge-database-entry-template.md` when adding future nodes or relationships to the knowledge database.

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

## Knowledge Coverage

The demo now covers a curated machine learning map across:

- Mathematical and computing foundations.
- Data, preprocessing, leakage, feature work, and evaluation workflow.
- Learning theory, regularization, metrics, calibration, and model selection.
- Classical supervised algorithms, ensemble methods, probabilistic models, and semi-supervised learning.
- Unsupervised learning, clustering, dimensionality reduction, manifold methods, mixture models, and matrix factorization.
- Deep learning architecture and training concepts, including tensors, computational graphs, optimizers, CNNs, RNNs, attention, generative models, transfer learning, and foundation models.
- Applied areas such as NLP, computer vision, speech recognition, recommenders, information retrieval, and retrieval-augmented generation.
- Reinforcement learning foundations.
- MLOps and responsible AI topics, including pipelines, monitoring, efficient inference, fairness, interpretability, adversarial robustness, model cards, datasheets, and AI risk management.

## Next Steps

The guideline recommends evolving this into a Docusaurus site with React-driven interactive views. A practical next step is to move the demo data into a schema-validated JSON file and render it through Docusaurus pages and reusable React components.
