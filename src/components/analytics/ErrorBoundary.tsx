import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileWarning, RefreshCcw } from "lucide-react";
import { ErrorTrackingService } from "@/lib/errorTracking";

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
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    ErrorTrackingService.captureException(error, {
      componentStack: errorInfo.componentStack,
      location: "ErrorBoundary",
    });
  }

  private handleRefresh = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md border-red-500/20 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto bg-red-100 dark:bg-red-900/30 p-3 rounded-full mb-4 w-fit">
                <FileWarning className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-muted-foreground">
                We apologize for the inconvenience. An unexpected error has
                occurred.
              </p>

              {import.meta.env.DEV && this.state.error && (
                <div className="bg-muted p-2 rounded text-xs text-left overflow-auto max-h-32 my-4">
                  <code>{this.state.error.message}</code>
                </div>
              )}

              <div className="flex justify-center gap-4">
                <Button
                  onClick={() =>
                    this.setState({ hasError: false, error: null })
                  }
                  variant="outline"
                >
                  Try Again
                </Button>
                <Button onClick={this.handleRefresh}>
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
