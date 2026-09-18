"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCcw, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";

interface SectionErrorBoundaryProps {
  children: ReactNode;
  title?: string;
  fallback?: ReactNode;
  onReset?: () => void;
  resetKeys?: unknown[];
}

interface SectionErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  copied: boolean;
}

export class SectionErrorBoundary extends Component<
  SectionErrorBoundaryProps,
  SectionErrorBoundaryState
> {
  constructor(props: SectionErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      copied: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<SectionErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    console.error(
      `[Section Error in "${this.props.title || "Dashboard Widget"}"]`,
      error,
      errorInfo,
    );
  }

  componentDidUpdate(prevProps: SectionErrorBoundaryProps): void {
    if (this.state.hasError && this.props.resetKeys) {
      const hasChanged = this.props.resetKeys.some(
        (key, index) => key !== (prevProps.resetKeys ? prevProps.resetKeys[index] : undefined),
      );
      if (hasChanged) {
        this.resetError();
      }
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      copied: false,
    });
    this.props.onReset?.();
  };

  handleCopy = (): void => {
    const errorText = `${this.state.error?.message || "Unknown error"}\n${this.state.errorInfo?.componentStack || ""}`;
    navigator.clipboard.writeText(errorText);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2000);
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const sectionTitle = this.props.title || "This Dashboard Section";

      return (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 dark:border-red-500/20 dark:bg-red-950/20 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Failed to render {sectionTitle}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {this.state.error?.message || "An unexpected rendering error occurred."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={this.resetError}
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-1.5 font-mono text-xs font-bold text-zinc-800 uppercase shadow-xs transition-colors hover:border-black/20 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                <span>Retry</span>
              </button>

              <button
                type="button"
                onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
                title="Toggle technical details"
              >
                <span>Details</span>
                {this.state.showDetails ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          {this.state.showDetails && (
            <div className="mt-4 pt-3 border-t border-red-500/10 dark:border-red-500/15 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase font-bold text-zinc-400">
                  Error Stack
                </span>
                <button
                  type="button"
                  onClick={this.handleCopy}
                  className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white cursor-pointer"
                >
                  {this.state.copied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-500" />
                      <span className="text-emerald-500">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy error</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="max-h-36 overflow-auto rounded-lg bg-zinc-950 p-3 font-mono text-[11px] text-red-300 dark:bg-black/60">
                {this.state.error?.stack || this.state.error?.message}
                {this.state.errorInfo?.componentStack}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
