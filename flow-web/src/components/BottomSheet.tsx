import type { PropsWithChildren, ReactNode } from 'react';

interface BottomSheetProps extends PropsWithChildren {
  footer?: ReactNode;
  onClose: () => void;
  open: boolean;
  title: string;
}

export function BottomSheet({ children, footer, onClose, open, title }: BottomSheetProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="bottom-sheet" role="presentation">
      <button
        aria-label="Fermer"
        className="bottom-sheet__backdrop"
        onClick={onClose}
        type="button"
      />
      <section aria-modal="true" className="bottom-sheet__panel" role="dialog" aria-label={title}>
        <header className="bottom-sheet__header">
          <div>
            <p className="eyebrow">Saisie</p>
            <h2>{title}</h2>
          </div>
          <button className="bottom-sheet__close" onClick={onClose} type="button">
            Fermer
          </button>
        </header>
        <div className="bottom-sheet__content">{children}</div>
        {footer ? <footer className="bottom-sheet__footer">{footer}</footer> : null}
      </section>
    </div>
  );
}
