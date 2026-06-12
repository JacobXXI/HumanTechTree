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
The website is built using the React framework, with Docusaurus as the site generator, and additional React libraries such as:
1. React Three Fiber for 3D layout
2. MUI Tree View for simple side-tree widgets

# Project Structure
The project has three major components:

Knowledge database - Contains a table of inventions.
Schema:
1. id
2. Name
3. Prerequisites (inventions required beforehand)
4. Tag (e.g. Math, Algorithm, Data Science, Dimension Reduction)
5. Description (including introductory text and external reference links)

Tree layout - See "img/2DTree.jpg" and "img/3DTree.jpg" for detailed structure. Ask if you have any questions.

Introduction page - Includes the brief introduction text and references to detailed descriptions, such as academic papers, videos, or other resources.

# Development Guideline
See [PROJECT_DEVELOPMENT_GUIDELINE.md](PROJECT_DEVELOPMENT_GUIDELINE.md) for the MVP-first product, content, visualization, and contribution guideline.
