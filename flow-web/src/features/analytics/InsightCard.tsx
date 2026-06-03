import type { Insight } from '../../services/insightEngine';

interface InsightCardProps {
  insight: Insight;
}

export function InsightCard({ insight }: InsightCardProps) {
  return (
    <article className="insight-card">
      <div className="insight-card__meta">
        <span className="history-card__badge">{insight.category}</span>
        <span>{insight.supportingCount} points</span>
      </div>
      <strong>{insight.title}</strong>
      <p>{insight.message}</p>
    </article>
  );
}
