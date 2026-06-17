# Human Technology Tree Design Guideline Review Report

Date: 2026-06-17

## 1. Executive Summary

The current Human Technology Tree prototype is a useful early MVP. It already demonstrates the core idea: a small machine learning knowledge database, searchable navigation, node detail pages, and a 2D prerequisite graph. This aligns well with the project guideline's emphasis on starting small, proving the knowledge model, and helping users trace prerequisites.

The main improvement areas are project structure, data validation, relationship semantics, and visualization depth. The current implementation is still a flat static prototype, while the guideline recommends a modular Docusaurus and React structure with reusable components, shared graph logic, validation, and eventually both 2D and 3D exploration modes.

The strongest next step is to preserve the prototype's simplicity while introducing clear module boundaries and validation. This will make the project easier to understand, safer to expand, and more manageable as the knowledge base grows from 10 nodes toward 50-100 nodes.

## 2. Reviewed Materials

This report is based on:

- `PROJECT_DEVELOPMENT_GUIDELINE.md`
- `README.md`
- `intro.md`
- `index.html`
- `styles.css`
- `app.js`
- `data/machine-learning-knowledge.js`
- `img/2DTree.jpg`
- `img/3DTree.jpg`

## 3. Current Implementation Snapshot

The project is currently organized as a small static web demo:

```text
/
  app.js
  data/
    machine-learning-knowledge.js
  img/
    2DTree.jpg
    3DTree.jpg
  index.html
  intro.md
  PROJECT_DEVELOPMENT_GUIDELINE.md
  README.md
  styles.css
```

Current strengths:

- The demo has a focused machine learning domain with 10 reviewed nodes.
- Each node includes a name, prerequisites, tags, description, importance, enabled ideas, references, and status.
- Users can search and filter nodes from the side navigator.
- The 2D graph supports node selection, zooming, panning, and relationship highlighting.
- The node detail view explains prerequisites, enabled ideas, tags, status, and references.
- The prototype is simple to open and understand.

Current limitations:

- Application logic, graph layout, rendering, state, and DOM events all live in one `app.js` file.
- Data is loaded through a global JavaScript object rather than a schema-validated data format.
- The side navigator is a flat list, not yet a true field or category tree.
- The project has image references for 2D and 3D tree ideas, but only the 2D interactive graph is implemented.
- There are no validation scripts or tests for node integrity, relationship correctness, duplicate IDs, broken references, or prerequisite cycles.

## 4. Guideline Alignment

| Guideline Area | Current Alignment | Notes |
| --- | --- | --- |
| MVP-first scope | Strong | The current demo is small, focused, and coherent. |
| Knowledge model | Partial to strong | Required fields are present, but schema validation is missing. |
| Node writing standard | Strong | Nodes are concise and reference-backed. |
| Explore a field journey | Partial | Search and filtering exist, but categories are not yet structured as a browsable field hierarchy. |
| Find prerequisites journey | Partial to strong | The 2D graph supports this, but relationship direction could be clearer. |
| Discover connections journey | Partial | Some application relationships are visible, but there is no 3D or cross-field exploration yet. |
| 2D dependency tree | Partial to strong | The graph works, but lacks arrowheads, edge labels, collapse controls, and relationship notes in the UI. |
| 3D exploration view | Missing | Not implemented yet. |
| Side tree navigator | Partial | Current navigator is searchable and filterable, but not yet a tree. |
| Modular project structure | Weak | The current flat structure is understandable for a demo, but will become hard to manage as features grow. |
| Content review process | Partial | Status fields exist, but there is no formal review or validation workflow. |
| Data growth strategy | Partial | The seed domain is coherent, but the project has not yet reached the recommended 20-50 node MVP seed size. |
| Testing and validation | Missing | No automated data or UI validation is currently present. |
| Technical direction | Partial | The README names Docusaurus and React as next steps, but the implementation is currently plain HTML, CSS, and JavaScript. |

## 5. Priority Improvements

### P1. Introduce a Modular Project Structure

The project should move gradually from a flat prototype into the modular structure described in the guideline. This does not need to be a full rewrite at once.

Recommended first modular split:

```text
src/
  data/
    machine-learning-knowledge.json
  graph/
    buildPrerequisiteGraph.js
    computeGraphLayout.js
    validateGraph.js
  ui/
    renderNodeList.js
    renderNodeDetail.js
    renderTreeGraph.js
  state/
    appState.js
```

Potential improvements:

- Move graph layout functions out of `app.js`.
- Move DOM rendering functions into focused UI modules.
- Move hard-coded future idea names into data or graph utilities.
- Keep data separate from rendering logic.
- Prepare this structure so it can later migrate into Docusaurus and React components.

Expected benefit:

- Contributors can understand where to edit data, graph logic, and interface behavior.
- The prototype can grow without turning `app.js` into a difficult maintenance point.

### P1. Add Data Schema Validation

The knowledge database is central to the project. Before expanding from 10 nodes to 20-50 nodes, the project should validate data automatically.

Validation should check:

- Every node has a unique `id`.
- Required fields are present.
- `prerequisites` and `enabled` values point to known node IDs or explicitly marked future nodes.
- Relationship `source` and `target` IDs are valid.
- Relationship types are limited to approved values.
- Prerequisite relationships do not contain cycles.
- Reference URLs are present and well-formed.
- Node statuses use the approved vocabulary.

Potential implementation:

- Convert `data/machine-learning-knowledge.js` into JSON or TypeScript data.
- Add a small validation script under `tests/data-validation/`.
- Run validation before expanding the database.

Expected benefit:

- The project can grow safely without hidden broken links or inconsistent relationship data.

### P1. Define One Source of Truth for Relationships

The current data stores both `node.prerequisites` and a separate `relationships` list. This is readable, but it creates a risk that the two sources drift apart.

Potential improvements:

- Use `relationships` as the authoritative source and derive prerequisites/enabled lists from it.
- Or keep `prerequisites` and `enabled` on nodes, but generate relationship records from them.
- Add validation that verifies both representations match if both are kept.

Expected benefit:

- The 2D tree, node detail page, and future 3D view will always agree about how concepts are connected.

### P2. Improve 2D Relationship Clarity

The current 2D graph is visually engaging and interactive, but relationship direction and type could be clearer.

Potential improvements:

- Add arrowheads to edges to show direction.
- Add hover or focus states that reveal relationship notes.
- Use different line styles for prerequisite, application, influence, and alternative path.
- Keep selected-node highlighting, but also show incoming and outgoing connections differently.
- Add a compact legend that explains relationship types in plain language.
- Add collapse or focus controls before the graph grows beyond 50 nodes.

Expected benefit:

- Users can more quickly answer "what supports this?" and "what does this enable?"

### P2. Upgrade the Side Navigator into a True Tree

The guideline calls for a side tree or category navigator. The current sidebar is useful, but it is a filtered list rather than a structured tree.

Potential improvements:

- Group nodes by field, subfield, or tag.
- Show counts for each group.
- Allow expanding and collapsing categories.
- Preserve the user's selected node when moving between list, tree, and detail views.
- Add a status filter for reviewed, incomplete, and uncertain nodes.

Expected benefit:

- Users can browse the knowledge base even when they do not know the exact term to search for.

### P2. Add Content Review Metadata

The current nodes use `status: "reviewed"`, which is a good start. As the database grows, review state should become more informative.

Potential improvements:

- Add `reviewedBy`, `lastReviewed`, or `reviewNotes` when appropriate.
- Mark uncertain relationships at the relationship level, not only at the node level.
- Add a short explanation for why a relationship is a strict prerequisite or a looser influence.
- Add a contributor checklist for new node batches.

Expected benefit:

- The platform becomes more trustworthy and easier to review collaboratively.

### P2. Expand the Seed Database Carefully

The guideline recommends 20-50 nodes for a meaningful first domain. The current 10-node machine learning seed is coherent, but still small.

Potential additions:

- Loss Functions
- Linear Regression
- Logistic Regression
- Regularization
- Bias-Variance Tradeoff
- Cross Validation
- Feature Engineering
- Ensemble Methods
- Random Forests
- Gradient Boosting
- Representation Learning
- Deep Learning

Expected benefit:

- The graph will better test the MVP's ability to handle realistic density and branching.

### P3. Plan the 3D Exploration View After Data Stabilizes

The 3D exploration view is not implemented yet. It should wait until the schema, relationship types, and 2D graph behavior are more stable.

Potential improvements:

- Use the same prepared graph data as the 2D view.
- Group nodes by field, tag, or relationship strength.
- Make selected nodes and direct relationships obvious.
- Keep labels sparse by default, with labels appearing on focus or hover.
- Avoid making the 3D view purely decorative.

Expected benefit:

- The 3D view can support discovery without undermining the clarity of the prerequisite model.

### P3. Add Testing and Validation Scenarios

The guideline includes clear validation scenarios. These should become repeatable checks.

Potential improvements:

- Add data validation tests.
- Add smoke tests for loading the demo.
- Add UI checks for search, filtering, node selection, and back navigation.
- Add visual checks for graph readability at desktop and mobile widths.
- Add reduced-motion verification for animation-heavy areas.

Expected benefit:

- Future contributors can improve the project without accidentally breaking the core demo.

## 6. Suggested Near-Term Roadmap

### Step 1: Stabilize Data

- Convert the knowledge data into a schema-friendly format.
- Add validation for IDs, references, statuses, and relationship types.
- Decide whether relationships or node fields are the source of truth.

### Step 2: Split the Prototype into Modules

- Extract graph-building and layout code.
- Extract rendering functions.
- Keep the current static demo working while improving structure.

### Step 3: Improve 2D Graph Semantics

- Add arrowheads and edge type styling.
- Expose relationship notes.
- Show incoming and outgoing links clearly for the selected node.

### Step 4: Add More Nodes

- Grow the machine learning seed from 10 nodes to 20-30 nodes.
- Use the added density to test layout, filtering, and node detail readability.

### Step 5: Move Toward Docusaurus and React

- Once the data and graph contracts are stable, migrate UI pieces into React components.
- Use Docusaurus for documentation pages and project structure.
- Keep the knowledge data as the shared source for pages and visualizations.

## 7. Recommended Definition of Done for the Next Milestone

The next milestone should be considered complete when:

- The knowledge data passes automated validation.
- The project has a clear `src/` structure with separate data, graph, UI, and state modules.
- The 2D graph shows relationship direction and type clearly.
- The side navigator supports grouped browsing.
- The seed database contains at least 20 reviewed nodes.
- A user can search, filter, select a node, inspect prerequisites, and return to the graph without losing orientation.

## 8. Conclusion

The project is on the right path. The current demo is intentionally small and already proves the basic value of connected knowledge exploration. The most important improvement is not to add every feature immediately, but to make the foundation stronger: modular structure, validated data, clearer relationship semantics, and a more scalable navigation model.

Once those foundations are in place, the project will be ready for a richer 2D tree, careful domain expansion, and eventually a useful 3D exploration view.
