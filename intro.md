# Human Technology Tree
**Human Technology Tree** is a knowledge platform that maps the development of human science and technology through a clear, interactive tree structure. It records major scientific concepts, technological inventions, and their relationships, helping users understand how ideas connect, evolve, and lead to new breakthroughs.

The platform also allows users to explore related fields and identify prior knowledge, inventions, or skills that may support their current research projects or inspire future innovation.

# Purpose
**Human Technology Tree** aims to make scientific and technological knowledge easier to explore, understand, and apply by organising inventions, concepts, and skills into a clear interactive structure.

1. **Provide a convenient reference for extensive research**
   The platform helps users quickly review key inventions, concepts, and their relationships across different scientific and technological fields.

2. **Suggest next steps for self-learning**
   By showing how knowledge and skills are connected, the platform can guide users toward the next topics, tools, or concepts they should learn.

3. **Reveal connections between different fields**
   The tree structure helps users discover how ideas from one field may influence or support progress in another, encouraging interdisciplinary thinking.

4. **Support innovation and research planning**
   Users can identify existing knowledge, missing links, and possible breakthrough directions before starting or continuing a research project.

5. **Make complex knowledge more accessible**
   Instead of presenting information as isolated articles, the platform visualises knowledge as a connected system, making it easier for learners and researchers to navigate.


# Technology Involved
The current prototype is a no-build static app built with HTML, CSS, and modular JavaScript.

Supporting project infrastructure currently includes:
1. Node.js validation scripts for knowledge data and static app smoke checks
2. A framework-neutral JSON export for future framework work
3. Planning notes for the Next.js + React migration path and computer-systems knowledge expansion

The planned framework target is a Next.js + React application. The migration path is documented in `data/nextjs-react-migration-plan.md`, and the computer-hardware learning expansion is outlined in `data/computer-systems-skill-tree.md`.

# Project Structure
The project currently has five major components:

Knowledge database - Contains the machine learning seed knowledge map and related relationship data.
Schema:
1. id
2. Name
3. Tags
4. Description
5. Importance
6. References
7. Status

Relationship graph - Relationship records define prerequisite, influence, application, and alternative-path edges between nodes.

Static demo - `index.html`, `styles.css`, and `src/` modules render the current searchable sidebar, 2D tree, 3D cone view, and node detail experience.

Validation scripts - `tests/data-validation/` and `tests/smoke/` verify data integrity, framework-neutral export sync, and required static app structure.

Planning artifacts - `data/nextjs-react-migration-plan.md` and `data/computer-systems-skill-tree.md` capture the next safe framework milestone and the broader hardware-skills research direction.

# Development Guideline
See [PROJECT_DEVELOPMENT_GUIDELINE.md](PROJECT_DEVELOPMENT_GUIDELINE.md) for the MVP-first product, content, visualization, and contribution guideline.
