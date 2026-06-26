import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(currentDirectory, "..", "..");
const introRoutePath = path.join(repositoryRoot, "app", "intro", "page.tsx");
const readmePath = path.join(repositoryRoot, "README.md");

const [introRoute, readme] = await Promise.all([
  readFile(introRoutePath, "utf8"),
  readFile(readmePath, "utf8")
]);

function fail(message) {
  console.error(message);
  process.exit(1);
}

function expectMatch(content, expression, message) {
  if (!expression.test(content)) {
    fail(message);
  }
}

function expectNoMatch(content, expression, message) {
  if (expression.test(content)) {
    fail(message);
  }
}

expectMatch(
  introRoute,
  /Explore the tree/i,
  'app/intro/page.tsx must keep a clear call to action back to the knowledge tree.'
);

expectMatch(
  introRoute,
  /machine learning/i,
  'app/intro/page.tsx must describe the machine learning focus of the current dataset.'
);

expectMatch(
  readme,
  /Next\.js and React application/i,
  'README.md must describe the current stack as a Next.js and React application.'
);

expectMatch(
  readme,
  /npm run validate:docs/i,
  'README.md must document the docs validation check.'
);

expectMatch(
  readme,
  /npm run build/i,
  'README.md must document the production build step.'
);

expectNoMatch(
  readme,
  /index\.html/i,
  'README.md must not describe the removed static entrypoint.'
);

console.log("Project messaging validation passed.");
