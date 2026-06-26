import type { KnowledgeData, KnowledgeNode } from "@/lib/knowledge/types";
import { getEnabledIds, getNodeName, getPrerequisiteIds } from "@/lib/knowledge/selectors";

export function KnowledgeDetailPanel({
  data,
  node,
  onClose
}: {
  data: KnowledgeData;
  node: KnowledgeNode;
  onClose: () => void;
}) {
  const prerequisites = getPrerequisiteIds(data, node.id).map((id) => getNodeName(data, id));
  const enabled = getEnabledIds(data, node.id).map((id) => getNodeName(data, id));

  return (
    <article className="detail-panel" aria-live="polite">
      <button className="back-button" onClick={onClose} type="button">Back to graph</button>
      <div className="meta-row">
        {node.tags.map((tag) => <span className="chip" key={tag}>{tag}</span>)}
        <span className="chip status">{node.status}</span>
      </div>
      <h2>{node.name}</h2>
      <p>{node.description}</p>
      <p><strong>Why it matters:</strong> {node.importance}</p>
      <p className="section-label">Prerequisites</p>
      <div className="chip-row">
        {(prerequisites.length ? prerequisites : ["Entry point"]).map((name) => (
          <span className="chip" key={name}>{name}</span>
        ))}
      </div>
      <p className="section-label">Enables</p>
      <div className="chip-row">
        {(enabled.length ? enabled : ["None listed"]).map((name) => (
          <span className="chip" key={name}>{name}</span>
        ))}
      </div>
      <p className="section-label">References</p>
      <div className="reference-list">
        {node.references.map((reference) => (
          <a className="link-button" href={reference.url} key={reference.url} rel="noreferrer" target="_blank">
            {reference.title} <span>{reference.type}</span>
          </a>
        ))}
      </div>
    </article>
  );
}
