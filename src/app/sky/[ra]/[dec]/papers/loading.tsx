export default function LiteratureLoading() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center gap-4">
      <div
        className="w-8 h-8 rounded-full border border-[var(--accent-border)] border-t-[var(--accent)] animate-spin"
        aria-hidden
      />
      <p className="text-sm text-[var(--text-muted)] tracking-wide">
        Loading literature explorer…
      </p>
    </div>
  );
}
