import type { PropsWithChildren, ReactNode } from 'react';

interface SectionCardProps extends PropsWithChildren {
  action?: ReactNode;
  eyebrow?: string;
  title: string;
}

export function SectionCard({ action, children, eyebrow, title }: SectionCardProps) {
  return (
    <section className="status-card section-card">
      <div className="section-card__header">
        <div>
          {eyebrow ? <p className="status-label">{eyebrow}</p> : null}
          <h2>{title}</h2>
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
