import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(currentDirectory, "..", "..");

function fail(message) {
  console.error(message);
  process.exit(1);
}

function expect(condition, message) {
  if (!condition) fail(message);
}

const packageJson = JSON.parse(
  await readFile(path.join(repositoryRoot, "package.json"), "utf8")
);
const nextConfig = await readFile(path.join(repositoryRoot, "next.config.ts"), "utf8");
const homePage = await readFile(path.join(repositoryRoot, "app", "page.tsx"), "utf8");
const knowledgeTreePage = await readFile(
  path.join(repositoryRoot, "components", "knowledge-tree", "knowledge-tree-page.tsx"),
  "utf8"
);
const graphComponent = await readFile(
  path.join(repositoryRoot, "components", "knowledge-tree", "knowledge-graph.tsx"),
  "utf8"
);

for (const relativePath of [
  ".nojekyll",
  "app/layout.tsx",
  "app/page.tsx",
  "app/intro/page.tsx",
  "app/globals.css",
  "app/base.css",
  "components/knowledge-tree/knowledge-cone.tsx",
  "components/knowledge-tree/knowledge-detail-panel.tsx",
  "components/knowledge-tree/knowledge-filters.tsx",
  "components/knowledge-tree/knowledge-graph.tsx",
  "components/knowledge-tree/knowledge-sidebar.tsx",
  "components/knowledge-tree/knowledge-tree-page.tsx",
  "data/machine-learning-knowledge.js",
  "lib/knowledge/data.ts",
  "lib/knowledge/graph.ts",
  "lib/knowledge/selectors.ts",
  "lib/knowledge/types.ts",
  "lib/knowledge/validation.ts",
  "tsconfig.json"
]) {
  await access(path.join(repositoryRoot, relativePath)).catch(() => {
    fail(`Required Next.js app asset is missing: ${relativePath}`);
  });
}

expect(
  packageJson.dependencies?.next &&
    packageJson.dependencies?.react &&
    packageJson.dependencies?.["react-dom"],
  "package.json must declare next, react, and react-dom dependencies."
);

for (const scriptName of ["dev", "build", "start", "validate:data", "validate:app", "validate:docs", "test"]) {
  expect(packageJson.scripts?.[scriptName], `package.json is missing the "${scriptName}" script.`);
}

expect(/output:\s*"export"/.test(nextConfig), 'next.config.ts must keep `output: "export"`.');
expect(/basePath:\s*isStaticDeploy\s*\?/.test(nextConfig), "next.config.ts must configure a production basePath.");
expect(/assetPrefix:\s*isStaticDeploy\s*\?/.test(nextConfig), "next.config.ts must configure a production assetPrefix.");
expect(/trailingSlash:\s*true/.test(nextConfig), "next.config.ts must enable trailingSlash for static hosting.");

expect(
  /validateKnowledgeData\(knowledgeData\)/.test(homePage),
  "app/page.tsx must validate the dataset before rendering."
);
expect(
  /visualizationMode/.test(knowledgeTreePage),
  "KnowledgeTreePage must keep the 2D and 3D view state."
);
expect(
  /network-background/.test(graphComponent),
  "KnowledgeGraph must render the panel-sized particle canvas."
);

console.log("Next.js app smoke validation passed.");
