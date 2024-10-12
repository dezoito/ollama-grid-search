import { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            padding: "20px",
            backgroundColor: "#ffeeee",
            border: "1px solid #ff0000",
            borderRadius: "5px",
            margin: "20px",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <h2 style={{ color: "#cc0000" }}>Oops! Something went wrong.</h2>
          <details style={{ whiteSpace: "pre-wrap", marginTop: "10px" }}>
            <summary style={{ cursor: "pointer", color: "#cc0000" }}>
              <strong>Error Details</strong>
            </summary>
            <p style={{ marginTop: "10px", color: "#cc0000" }}>
              <strong>Error:</strong> {this.state.error.toString()}
            </p>
            {this.state.errorInfo && (
              <p style={{ marginTop: "10px", color: "#cc0000" }}>
                <strong>Component Stack:</strong>{" "}
                {this.state.errorInfo.componentStack}
              </p>
            )}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
