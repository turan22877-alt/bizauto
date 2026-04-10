import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
          <div className="glass-panel max-w-md w-full p-8 text-center animate-scale-in">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="header-font text-xl font-bold text-stone-900 mb-2">
              Что-то пошло не так
            </h2>
            <p className="text-stone-600 mb-6">
              Произошла ошибка при загрузке приложения. Попробуйте обновить страницу.
            </p>
            {this.state.error && (
              <details className="text-left mb-6 p-4 bg-stone-100 rounded-lg text-sm">
                <summary className="cursor-pointer font-semibold text-stone-700 mb-2">
                  Детали ошибки
                </summary>
                <code className="text-red-600 break-all">
                  {this.state.error.toString()}
                </code>
              </details>
            )}
            <button
              onClick={this.handleReset}
              className="btn-primary inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Попробовать снова
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;