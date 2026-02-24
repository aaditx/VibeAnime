"use client";

import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: string;
}

export default class VideoPlayerErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error: error.message };
    }

    componentDidCatch(error: Error) {
        console.error("[VideoPlayer] Crashed:", error);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div
                    className="relative w-full bg-[#0d0d0f] border border-[#1e1e1e] flex flex-col items-center justify-center gap-4"
                    style={{ aspectRatio: "16/9" }}
                >
                    <AlertTriangle className="w-10 h-10 text-amber-500/60" />
                    <div className="text-center">
                        <p className="text-white font-bold text-sm">Player crashed</p>
                        <p className="text-[#555] text-xs mt-1">{this.state.error ?? "An unexpected error occurred"}</p>
                    </div>
                    <button
                        onClick={() => this.setState({ hasError: false })}
                        className="flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-[#e8002d] hover:bg-[#c8001d] text-white px-4 py-2 transition-colors"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Reload Player
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
