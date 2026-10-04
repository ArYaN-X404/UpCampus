'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('UpCampus Caught UI Error:', error, errorInfo);
  }

  private handleHardReset = () => {
    try {
      localStorage.removeItem('upcampus_posts_v2');
      localStorage.removeItem('upcampus_events_v2');
      localStorage.removeItem('upcampus_role_v2');
      localStorage.removeItem('upcampus_admin_v2');
    } catch {}
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-paleBlueGrey/25 text-center space-y-5 shadow-2xl relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-black text-softWhite">
                UI View Recovered
              </h2>
              <p className="text-xs text-paleBlueGrey leading-relaxed">
                A state transition was intercepted. Your session is protected and you can resume immediately.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => this.setState({ hasError: false })}
                className="flex-1 btn-fresh-green text-deepNavy font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Resume View</span>
              </button>

              <button
                onClick={this.handleHardReset}
                className="flex-1 bg-white/5 hover:bg-white/10 text-paleBlueGrey hover:text-softWhite font-bold py-2.5 rounded-xl text-xs border border-paleBlueGrey/20 transition-all"
              >
                Reset Demo Data
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
