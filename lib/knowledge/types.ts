export type KnowledgeStatus =
  | "draft"
  | "reviewed"
  | "verified"
  | "incomplete"
  | "uncertain";

export type RelationshipType =
  | "prerequisite"
  | "influence"
  | "application"
  | "alternative-path";

export interface KnowledgeReference {
  title: string;
  url: string;
  type: string;
}

export interface KnowledgeNode {
  id: string;
  name: string;
  tags: string[];
  description: string;
  importance: string;
  references: KnowledgeReference[];
  status: KnowledgeStatus;
}

export interface FutureNode {
  id: string;
  name: string;
}

export interface KnowledgeRelationship {
  source: string;
  target: string;
  type: RelationshipType;
  note: string;
}

export interface KnowledgeData {
  nodes: KnowledgeNode[];
  futureNodes: FutureNode[];
  relationships: KnowledgeRelationship[];
}
