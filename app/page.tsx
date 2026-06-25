import { KnowledgeTreePage } from "@/components/knowledge-tree/knowledge-tree-page";
import { knowledgeData } from "@/lib/knowledge/data";
import { validateKnowledgeData } from "@/lib/knowledge/validation";

export default function HomePage() {
  const validation = validateKnowledgeData(knowledgeData);
  if (!validation.valid) throw new Error(validation.errors.join("\n"));

  return <KnowledgeTreePage data={knowledgeData} />;
}
