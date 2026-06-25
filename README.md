# Human Technology Tree

A Next.js and React application for exploring the dependencies between machine-learning and computing concepts.

## Development

```sh
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validation and production export

```sh
npm test
npm run build
```

The production build uses Next.js static export and writes the deployable site to `out/`.

## Project structure

```text
app/                         Next.js routes and global styles
components/knowledge-tree/   React tree, sidebar, details, and 3D canvas
data/                        Knowledge dataset
lib/knowledge/               Typed graph, selector, and validation logic
tests/data-validation/       Dataset validation
```

The knowledge relationships are the source of truth for prerequisites and enabled concepts.

## GitHub Pages

The application can be deployed to GitHub Pages from the generated `out/` directory. For a project site such as `username.github.io/HumanTechTree`, configure the repository name as the Next.js `basePath` and deploy with GitHub Actions.
