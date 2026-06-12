# Human Technology Tree Project Development Guideline

## 1. Project Purpose

**Human Technology Tree** is an MVP-first knowledge platform for researchers, self-educators, and innovation-minded learners. It maps the development of human science and technology as a connected system of concepts, inventions, skills, and research directions.

The goal is not to create another encyclopedia. The platform should help users answer practical questions:

- What ideas made this invention or concept possible?
- What should I learn before studying this topic?
- What later technologies or research areas did this idea enable?
- How are ideas in different fields connected?
- Where might missing links or future breakthroughs exist?

The first version should be small, coherent, and useful. It should prove the knowledge model and exploration experience before trying to cover all science and technology.

## 2. Target Audience

The primary audience is researchers and self-educators. They may be technical, but the product should not assume that every user is a software engineer or domain specialist.

The platform should support:

- Learners planning a self-study path.
- Researchers reviewing background knowledge before starting a project.
- Innovators looking for cross-field inspiration.
- Contributors who want to add or review knowledge nodes.
- Curious users who want to understand how major ideas evolved.

Writing, navigation, and visualizations should be clear enough for intelligent non-specialists while still linking to deeper technical or academic sources.

## 3. MVP Product Scope

The MVP should focus on one or two representative domains, such as mathematics, algorithms, data science, computing, physics, or engineering. Starting small is important because the value of the platform depends on relationship quality, not raw item count.

The MVP should include:

- An introduction page explaining the project purpose.
- A small curated knowledge database.
- A searchable or browsable list of knowledge nodes.
- A 2D dependency tree for prerequisite relationships.
- A 3D exploratory tree or graph for clusters and cross-field connections.
- A side tree or category navigator for fast movement between fields.
- Node detail pages or panels containing explanation, prerequisites, enabled ideas, tags, and references.

Out of scope for the first version:

- Full coverage of all scientific and technological history.
- User accounts, personalization, or complex social features.
- Automated recommendation systems.
- Advanced editorial workflows.
- Large-scale ontology management.

These can be added later after the core database and exploration model are proven.

## 4. Knowledge Model

Each item in the database should be modeled as a **knowledge node**. A node may represent an invention, scientific concept, mathematical tool, research method, practical skill, or technological system.

Recommended fields:

| Field | Purpose |
| --- | --- |
| `id` | Stable unique identifier used by the system and links. |
| `name` | Human-readable node title. |
| `prerequisites` | Concepts, inventions, or skills required before this node. |
| `tags` | Subject areas such as Math, Algorithm, Physics, Data Science, Biology, Engineering, or Dimension Reduction. |
| `description` | Concise explanation of what the node is. |
| `importance` | Why the node matters historically, scientifically, or practically. |
| `enabled` | Later concepts, inventions, or research areas made possible by this node. |
| `references` | Papers, books, videos, articles, or primary sources. |
| `difficulty` | Optional level such as beginner, intermediate, or advanced. |
| `status` | Draft, reviewed, verified, incomplete, or uncertain. |

The MVP should use simple relationship types:

- **Prerequisite**: A must be understood, invented, or available before B.
- **Influence**: A helped inspire or shape B but is not strictly required.
- **Application**: A is used inside B or makes B practical.
- **Alternative path**: Different routes can lead to similar understanding or capability.

Relationship quality matters. A weak but interesting connection should be marked as influence, not prerequisite. Uncertain links should be visible as uncertain rather than silently treated as fact.

## 5. Node Writing Standard

Each node should be useful on its own and more useful when connected to other nodes. Keep writing concise, factual, and accessible.

Every node should answer:

- What is it?
- What problem did it solve?
- What did it depend on?
- What did it make possible?
- Where is it used today?
- What should someone learn next?

Avoid turning nodes into long standalone articles. The platform's strength is connected understanding, so explanations should be brief and supported by references.

Reference quality should favor:

- Primary papers when available.
- High-quality textbooks or academic resources.
- Reputable educational videos.
- Well-maintained public explainers.
- Historical sources where relevant.

Each node should clearly distinguish verified facts from interpretation. If a relationship is debated or approximate, mark it as uncertain and explain why.

## 6. User Experience Principles

The platform should support three core journeys.

### Explore a Field

A user chooses a field such as algorithms, physics, mathematics, or data science. They should see a clear structure of major ideas and be able to move from broad categories to specific nodes.

Expected behavior:

- Categories are easy to browse.
- Related nodes are grouped visually.
- Selecting a node reveals its explanation and references.
- Users can move back to the field overview without losing orientation.

### Find Prerequisites

A user selects a topic they want to learn or research. The platform should reveal what supports that topic and help the user trace backward through required knowledge.

Expected behavior:

- Prerequisites are visible and ordered where possible.
- Strict prerequisites are visually distinct from loose influences.
- Missing or incomplete nodes are marked clearly.
- The user can follow a learning path backward from an advanced topic.

### Discover Connections

A user explores cross-field links and notices how ideas from one domain support another.

Expected behavior:

- The 3D view highlights clusters and distant relationships.
- Cross-field edges are visible without overwhelming the graph.
- Tags or colors help users understand why nodes are grouped.
- The view encourages exploration but still supports focused inspection.

## 7. Visualization Guidelines

### 2D Dependency Tree

The 2D tree should prioritize clarity, ordering, and dependency logic.

Use it for:

- Showing direct prerequisites.
- Explaining learning paths.
- Comparing nearby concepts.
- Making dependency chains easy to follow.

Design expectations:

- Nodes should be readable at normal zoom.
- Edges should make direction clear.
- Incomplete nodes should be visually distinct.
- Users should not lose context when selecting or expanding nodes.
- Dense areas should be collapsible or filterable.

### 3D Exploration View

The 3D view should prioritize exploration, clustering, and cross-field relationships.

Use it for:

- Showing broad knowledge landscapes.
- Revealing interdisciplinary links.
- Grouping nodes by field, tag, or relationship strength.
- Helping users notice unexpected connections.

Design expectations:

- The 3D view must be useful, not decorative.
- Users should be able to zoom, rotate, select, and focus nodes.
- Labels should not create visual clutter.
- Colors should represent meaningful categories or relationship types.
- The selected node and its direct relationships should be easy to identify.

### Side Tree or Category Navigator

The side tree should prioritize fast navigation.

Use it for:

- Browsing fields and subfields.
- Jumping to a node or cluster.
- Filtering the main view.
- Showing a compact outline of the database.

## 8. Recommended Development Phases

### Phase 1: Foundation

Goals:

- Establish the project structure.
- Create the introduction page.
- Define the knowledge node schema.
- Add a small seed database.
- Build a basic node browser.
- Establish content and contribution standards.

Acceptance criteria:

- A user can open the site and understand the project purpose.
- A user can browse the first set of knowledge nodes.
- Each node has a name, tags, description, prerequisites, enabled ideas, and references.
- Incomplete or draft nodes are clearly marked.

### Phase 2: 2D Tree MVP

Goals:

- Build the 2D prerequisite tree.
- Allow users to select nodes and inspect details.
- Support filtering by tag, field, difficulty, or status.
- Represent missing or uncertain relationships clearly.

Acceptance criteria:

- A user can follow prerequisites backward from an advanced topic.
- Relationship direction is understandable.
- Selecting a node updates the detail view.
- The tree remains usable with at least 50 knowledge nodes.

### Phase 3: 3D Exploration MVP

Goals:

- Build the 3D spatial relationship view.
- Group nodes by field or tag.
- Show prerequisite, influence, and application relationships.
- Support zoom, rotate, select, and focus interactions.

Acceptance criteria:

- A user can identify clusters by domain.
- A user can select a node and see its direct connections.
- Cross-field links are discoverable.
- The visualization remains understandable rather than purely decorative.

### Phase 4: Learning and Research Tools

Goals:

- Add "what should I learn before this?" paths.
- Add "what can this lead to?" paths.
- Add comparison between related fields.
- Add saved paths or research planning notes if needed.

Acceptance criteria:

- A user can generate or follow a learning path for a selected topic.
- A user can identify downstream ideas enabled by a node.
- The platform helps users plan research or self-study.

### Phase 5: Review and Expansion

Goals:

- Expand the database by domain.
- Improve reference quality.
- Add editorial review workflows.
- Add contributor guidance.
- Introduce data versioning if the knowledge base grows significantly.

Acceptance criteria:

- New nodes can be reviewed for accuracy and relationship quality.
- Contributors understand what makes a good node.
- The database can grow without making the tree unreadable.

## 9. Content Review Process

Every new or edited node should be reviewed for:

- Clear description.
- Accurate prerequisites.
- Correct relationship types.
- Useful references.
- Appropriate tags.
- Reasonable difficulty level.
- Honest status marking.

Suggested node statuses:

- `draft`: Added but not reviewed.
- `reviewed`: Checked for clarity and basic correctness.
- `verified`: Supported by reliable references.
- `incomplete`: Known to be missing important information.
- `uncertain`: Contains relationships or claims that need further checking.

Do not hide uncertainty. Marking uncertainty is better than presenting weak knowledge as settled fact.

## 10. Data Growth Strategy

The knowledge database should grow by coherent domains rather than random isolated entries.

Recommended expansion order:

1. Select a domain or subdomain.
2. Identify 20-50 important nodes.
3. Define major prerequisite chains.
4. Add references for each node.
5. Review relationships for strictness and usefulness.
6. Add cross-field links only when they are meaningful.
7. Test whether the 2D and 3D views remain understandable.

Good early domains include:

- Mathematics foundations.
- Algorithms and computer science.
- Data science and machine learning.
- Physics and engineering fundamentals.
- Scientific instruments and measurement.

## 11. Quality Guidelines

The platform should remain:

- **Clear**: Users can understand what they are looking at.
- **Connected**: Nodes show meaningful relationships.
- **Trustworthy**: Claims and links are supported by references.
- **Expandable**: New domains can be added without redesigning the system.
- **Accessible**: Explanations are useful to non-specialists.
- **Research-oriented**: The platform helps users plan learning or investigation.

Avoid:

- Adding many nodes with shallow or missing relationships.
- Treating all links as prerequisites.
- Using the 3D view as decoration without practical navigation value.
- Burying users in long articles when they need relationship clarity.
- Mixing verified knowledge and speculation without labels.

## 12. Testing and Validation Scenarios

The MVP should be validated against these scenarios:

- A user opens the introduction page and understands the project purpose.
- A user browses the database by tag or category.
- A user selects a node and sees description, prerequisites, enabled concepts, and references.
- A user follows prerequisites backward from an advanced topic.
- A user uses the 2D tree without losing orientation.
- A user uses the 3D tree to discover related clusters.
- A user can tell the difference between strict prerequisites and weaker influences.
- A user can identify incomplete nodes, missing references, or uncertain relationships.
- The platform remains usable with at least 50-100 knowledge nodes.

## 13. Recommended Technical Direction

The current intended stack is:

- **Docusaurus** for the site generator and documentation structure.
- **React** for interactive views.
- **React Three Fiber** for the 3D exploration layout.
- **MUI Tree View** for simple side-tree navigation.

The technical implementation should serve the product goals. Keep the first version simple:

- Use a plain structured data file or small set of files for the seed database.
- Prefer readable schemas over premature database complexity.
- Keep node pages and visualizations driven from the same source data.
- Add validation before the database becomes large.
- Avoid custom graph logic unless existing libraries become insufficient.

## 14. Contribution Guidelines

Contributors should add knowledge in small, reviewable batches.

A good contribution should:

- Add or improve a coherent group of related nodes.
- Include references.
- Explain why each relationship exists.
- Mark uncertain claims honestly.
- Use consistent tags.
- Keep descriptions concise and readable.

Reviewers should ask:

- Is this node useful to a learner or researcher?
- Are prerequisites too strict, too loose, or missing?
- Are references strong enough?
- Does this improve the tree structure?
- Will this make the visualization clearer or noisier?

## 15. Near-Term Next Steps

Recommended next tasks:

1. Create the Docusaurus project scaffold.
2. Add the introduction page from `intro.md`.
3. Define the first version of the knowledge node schema.
4. Create a seed database with 20-50 nodes from one domain.
5. Build a simple database browser.
6. Build the first 2D dependency tree.
7. Add the 3D exploration view after the core data model is stable.

The guiding principle is: make a small, reliable knowledge tree first, then expand it carefully.
