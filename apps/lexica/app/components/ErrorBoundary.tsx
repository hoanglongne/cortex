'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('[ErrorBoundary]', error, info.componentStack);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="flex flex-col items-center justify-center min-h-75 px-8 text-center">
                    <AlertTriangle className="w-16 h-16 text-warning mb-4" />
                    <h2 className="text-xl font-bold text-ink mb-2">Có lỗi xảy ra</h2>
                    <p className="text-sm text-muted mb-6 max-w-sm">
                        {this.state.error?.message || 'Đã xảy ra lỗi không mong muốn.'}
                    </p>
                    <button
                        onClick={this.handleReset}
                        className="px-6 py-3 bg-accent hover:bg-accent-strong rounded-xl font-bold text-on-accent transition-colors flex items-center gap-2"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Thử lại
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
