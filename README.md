# Human Technology Tree

This repository contains an MVP demo for the Human Technology Tree idea described in `PROJECT_DEVELOPMENT_GUIDELINE.md`.

## Demo

Open `demo/index.html` in a browser to try the machine learning knowledge demo. It includes:

- 10 reviewed machine learning knowledge nodes.
- A searchable and filterable side navigator.
- A full-pane 2D prerequisite graph.
- A knowledge introduction page opened from either the sidebar or the tree.
- Descriptions, prerequisites, enabled ideas, tags, difficulty, status, and references for each node.

The seed data lives in `data/machine-learning-knowledge.js` so the same source can later drive a Docusaurus or React implementation.

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
