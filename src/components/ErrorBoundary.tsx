import React, { Component, ErrorInfo } from 'react';

interface Props {
  children: React.ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8FAFB] flex items-center justify-center p-8">
          <div className="max-w-lg w-full bg-white rounded-3xl border border-red-100 shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💥</span>
            </div>
            <h2 className="text-xl font-black text-black mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-500 mb-4">
              {this.props.fallbackMessage || "The dashboard encountered an error. This usually happens when profile data is missing or a database policy is blocking access."}
            </p>
            <div className="bg-red-50 rounded-xl p-4 text-left mb-6 max-h-40 overflow-y-auto">
              <p className="text-xs font-mono text-red-600 break-all">
                {this.state.error?.message || 'Unknown error'}
              </p>
              {this.state.error?.stack && (
                <pre className="text-[10px] font-mono text-red-400 mt-2 whitespace-pre-wrap break-all">
                  {this.state.error.stack.split('\n').slice(0, 5).join('\n')}
                </pre>
              )}
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Reload Page
              </button>
              <button
                onClick={() => { window.location.href = '/login'; }}
                className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
