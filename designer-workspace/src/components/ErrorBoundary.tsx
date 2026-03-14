import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-black p-4 text-center">
          <div className="text-6xl mb-4">💥</div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">出错了</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
            {this.state.error?.message || '发生了未知错误'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = '/';
            }}
            className="px-6 py-3 bg-[#4cb2e6] text-white rounded-xl font-bold hover:bg-[#3ba1d5] transition-colors"
          >
            返回首页
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
