/**
 * Catches Recharts/runtime errors so summary + table remain usable.
 */

import { Component } from "react";

export default class ChartErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    // Intentionally quiet — VizShell summary/table remain the fallback.
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <p className="text-sm text-slate-500 py-6 text-center">
            Chart could not be displayed. Use the summary and data table below.
          </p>
        )
      );
    }
    return this.props.children;
  }
}
