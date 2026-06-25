import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(currentDirectory, "..", "..");
const introPath = path.join(repositoryRoot, "intro.md");
const readmePath = path.join(repositoryRoot, "README.md");

const [intro, readme] = await Promise.all([
  readFile(introPath, "utf8"),
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
  intro,
  /no-build static (app|prototype)/i,
  'intro.md must describe the current implementation as a no-build static app or prototype.'
);

expectMatch(
  intro,
  /HTML,\s*CSS,\s*and modular JavaScript/i,
  'intro.md must describe the current stack as HTML, CSS, and modular JavaScript.'
);

expectMatch(
  intro,
  /Next\.js \+ React migration path/i,
  'intro.md must reference the Next.js + React migration path.'
);

expectMatch(
  intro,
  /computer-hardware learning expansion|computer-systems-skill-tree\.md/i,
  'intro.md must reference the computer systems skills planning note.'
);

expectNoMatch(
  intro,
  /built using the React framework/i,
  'intro.md must not claim the current site is already built with React.'
);

expectNoMatch(
  intro,
  /Docusaurus as the site generator/i,
  'intro.md must not claim the current site is already built with Docusaurus.'
);

expectMatch(
  readme,
  /npm run validate:docs/i,
  'README.md must document the docs validation check.'
);

console.log("Project messaging validation passed.");
