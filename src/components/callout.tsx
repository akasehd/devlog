const labels = { note: "Note", tip: "Tip", warning: "Warning" } as const;

export function Callout({ type = "note", title, children }: { type?: keyof typeof labels; title?: string; children: React.ReactNode }) {
  return (
    <aside className={`callout callout-${type}`} role="note">
      <strong>{title ?? labels[type]}</strong>
      <div>{children}</div>
    </aside>
  );
}
