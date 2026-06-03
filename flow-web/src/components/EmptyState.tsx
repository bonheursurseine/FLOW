interface EmptyStateProps {
  description: string;
  title: string;
}

export function EmptyState({ description, title }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <p className="status-label">A venir</p>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
