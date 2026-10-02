"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[SAPIENS ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[var(--background)] p-6">
          <div className="ui-panel max-w-md rounded-2xl p-6 text-center">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              {this.props.fallbackTitle ?? "Something went wrong"}
            </h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              The sky engine hit an unexpected error. You can reload and continue
              exploring.
            </p>
            <pre className="mt-3 max-h-24 overflow-auto rounded-lg bg-black/30 p-2 text-left text-[10px] text-zinc-400">
              {this.state.error.message}
            </pre>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg border border-[var(--accent-border)] bg-[var(--accent-muted)] px-4 py-2 text-sm text-[var(--text-primary)]"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
