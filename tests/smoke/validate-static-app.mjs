import { access, readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const currentDirectory = path.dirname(fileURLToPath(import.meta.url))
const repositoryRoot = path.resolve(currentDirectory, "..", "..")
const indexPath = path.join(repositoryRoot, "index.html")
const html = await readFile(indexPath, "utf8")

const requiredScriptSources = [
  "src/data/machine-learning-knowledge.js",
  "src/graph/knowledge-graph.js",
  "src/validation/knowledge-data-validation.js",
  "src/ui/renderers.js",
  "src/visualizations/exploration-cone-3d.js",
  "src/app.js"
]

const requiredIds = [
  "searchInput",
  "nodeList",
  "viewSwitcher",
  "treeView",
  "coneView",
  "coneStage",
  "graphViewport",
  "edgeLayer",
  "graphNodes",
  "introPage",
  "zoomIn",
  "zoomOut",
  "zoomReset"
]

function fail(message) {
  console.error(message)
  process.exit(1)
}

function expect(condition, message) {
  if (!condition) fail(message)
}

function getScriptSources(documentHtml) {
  return [...documentHtml.matchAll(/<script\s+[^>]*src="([^"]+)"[^>]*><\/script>/g)].map(
    (match) => match[1]
  )
}

function hasElementId(documentHtml, id) {
  return new RegExp(`id="${id}"`).test(documentHtml)
}

expect(
  /<link\s+[^>]*rel="stylesheet"[^>]*href="styles\.css"[^>]*>/i.test(html),
  "index.html must load styles.css."
)

expect(
  /class="filter-group"/.test(html),
  'index.html must include the ".filter-group" container used by the filters.'
)

expect(
  [...html.matchAll(/class="view-button[^"]*"\s+data-view="([^"]+)"/g)].map((match) => match[1])
    .join(",") === "tree,cone",
  'index.html must include tree and cone view buttons with stable data-view values.'
)

requiredIds.forEach((id) => {
  expect(hasElementId(html, id), `index.html is missing required element #${id}.`)
})

const actualScriptSources = getScriptSources(html)

expect(
  JSON.stringify(actualScriptSources) === JSON.stringify(requiredScriptSources),
  [
    "index.html script order does not match the expected application boot order.",
    `Expected: ${requiredScriptSources.join(", ")}`,
    `Actual: ${actualScriptSources.join(", ")}`
  ].join("\n")
)

for (const relativePath of ["styles.css", ...requiredScriptSources]) {
  await access(path.join(repositoryRoot, relativePath)).catch(() => {
    fail(`Referenced asset is missing: ${relativePath}`)
  })
}

console.log("Static app smoke validation passed.")
