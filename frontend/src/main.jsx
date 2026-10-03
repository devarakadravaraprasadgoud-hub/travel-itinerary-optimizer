import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          maxWidth: '800px',
          margin: '2rem auto',
          background: '#1e1e2f',
          color: '#f87171',
          borderRadius: '0.75rem',
          fontFamily: 'monospace',
          border: '1px solid #ef4444'
        }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#fca5a5' }}>
            React Render Error Encountered
          </h2>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#0f0f17', padding: '1rem', borderRadius: '0.5rem', color: '#ffffff' }}>
            {this.state.error?.toString()}
          </pre>
          {this.state.errorInfo && (
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem', color: '#94a3b8', marginTop: '1rem' }}>
              {this.state.errorInfo.componentStack}
            </pre>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1.5rem',
              padding: '0.5rem 1rem',
              background: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Global window error listener
window.addEventListener('error', (event) => {
  console.error("Global window error:", event.error);
  const root = document.getElementById('root');
  if (root && root.innerHTML.trim() === '') {
    root.innerHTML = `
      <div style="padding: 2rem; color: #f87171; font-family: monospace; background: #181824; border: 1px solid #ef4444; border-radius: 8px; max-width: 700px; margin: 2rem auto;">
        <h3>Global JavaScript Error</h3>
        <p>${event.message}</p>
        <pre style="background: #0d0d15; padding: 1rem; border-radius: 4px; color: #fff;">${event.error?.stack || event.filename + ':' + event.lineno}</pre>
      </div>
    `;
  }
});

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
} else {
  console.error("Root element #root not found!");
}
