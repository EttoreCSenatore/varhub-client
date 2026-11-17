import { Component } from 'react';

// A crash in one page (for example a WebGL failure) should not blank the whole app.
export default class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error(error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="container py-5 text-center">
        <h2>Something went wrong</h2>
        <p className="text-muted">Please reload the page. If it keeps happening, try another browser.</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Reload</button>
      </div>
    );
  }
}
