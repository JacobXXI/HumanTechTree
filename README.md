# Human Technology Tree

A Next.js and React application for exploring the dependencies between machine-learning and computing concepts.

## Development

```sh
npm install
npm run dev
```

Open `http://localhost:3000`.

The current app includes:

- 110 reviewed technology and machine learning knowledge nodes.
- 197 relationship records covering prerequisites, influences, applications, and alternative paths.
- A searchable side navigator with data-driven high-level category filters.
- A full-pane 2D prerequisite graph and a 3D cone view.
- A knowledge introduction page opened from either the sidebar or the tree.
- Descriptions, derived prerequisites, derived enabled ideas, tags, status, and references for each node.

The seed data source of truth lives in `data/machine-learning-knowledge.js`. A framework-neutral export is checked in at `data/machine-learning-knowledge.json`, and relationship records remain the source of truth for prerequisites and enabled ideas.

## Validation and production export

```sh
npm test
npm run export:framework-data
npm run build
```

This runs:

- `npm run validate:data` for knowledge content integrity and framework-export sync.
- `npm run validate:app` for the Next.js app structure and export configuration.
- `npm run validate:docs` for README and intro-route messaging consistency.

The production build uses Next.js static export and writes the deployable site to `out/`.

## Project structure

```text
app/                         Next.js routes and global styles
components/knowledge-tree/   React tree, sidebar, detail panel, 2D graph, and 3D canvas
data/                        Knowledge dataset and planning notes
lib/knowledge/               Typed graph, selector, and validation logic
tests/                       Data, app-structure, and docs validation
```

## Planning and research assets

- `data/nextjs-react-migration-plan.md` records the migration plan that led to the current framework structure.
- `data/computer-systems-skill-tree.md` maps a future hardware and computer-engineering learning track.

## GitHub Pages

The production export is configured for this repository's GitHub Pages project path. Build the app, then publish the generated `out/` directory with GitHub Actions or another static host.
