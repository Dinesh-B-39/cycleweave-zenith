import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background bg-grid-pattern">
      <div className="text-center glass-card p-12 max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/20 flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="mb-2 text-6xl font-black text-foreground">404</h1>
        <p className="mb-6 text-lg text-muted-foreground">
          Page not found. The route you're looking for doesn't exist.
        </p>
        <Button asChild className="gap-2">
          <a href="/">
            <Home className="w-4 h-4" />
            Return to Dashboard
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
