import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AccessibilityProvider } from "@/components/AccessibilityProvider";
import { AccessibilityPanel } from "@/components/AccessibilityPanel";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { AgeVerificationOnboarding } from "@/components/AgeVerificationOnboarding";

// Pages
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Groups from "@/pages/Groups";
import GroupDetails from "@/pages/GroupDetails";
import Games from "@/pages/Games";
import GameChess from "@/pages/GameChess";
import GameTetris from "@/pages/GameTetris";
import Profile from "@/pages/Profile";
import Recognition from "@/pages/Recognition";
import Extensions from "@/pages/Extensions";
import SpoonTracker from "@/pages/SpoonTracker";
import Journal from "@/pages/Journal";
import ServiceDirectory from "@/pages/ServiceDirectory";
import Resources from "@/pages/Resources";
import JobBoard from "@/pages/JobBoard";
import Transport from "@/pages/Transport";
import NotFound from "@/pages/not-found";

function PrivateRoute({ component: Component, ...rest }: any) {
  const { isAuthenticated, isLoading } = useAuth();
  
  const { data: authStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["/api/auth/status"],
    queryFn: async () => {
      const res = await fetch("/api/auth/status", { credentials: "include" });
      return res.json() as Promise<{ isAuthenticated: boolean; ageVerified: boolean }>;
    },
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
  });

  if (isLoading || (isAuthenticated && statusLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Landing />;
  }

  if (authStatus && !authStatus.ageVerified) {
    return (
      <AgeVerificationOnboarding 
        onVerified={() => {
          queryClient.invalidateQueries({ queryKey: ["/api/auth/status"] });
        }} 
      />
    );
  }

  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={props => <PrivateRoute component={Home} {...props} />} />
      <Route path="/groups" component={props => <PrivateRoute component={Groups} {...props} />} />
      <Route path="/groups/:id" component={props => <PrivateRoute component={GroupDetails} {...props} />} />
      <Route path="/games" component={props => <PrivateRoute component={Games} {...props} />} />
      <Route path="/games/chess" component={props => <PrivateRoute component={GameChess} {...props} />} />
      <Route path="/games/tetris" component={props => <PrivateRoute component={GameTetris} {...props} />} />
      <Route path="/recognition" component={props => <PrivateRoute component={Recognition} {...props} />} />
      <Route path="/extensions" component={props => <PrivateRoute component={Extensions} {...props} />} />
      <Route path="/profile" component={props => <PrivateRoute component={Profile} {...props} />} />
      <Route path="/spoons" component={props => <PrivateRoute component={SpoonTracker} {...props} />} />
      <Route path="/journal" component={props => <PrivateRoute component={Journal} {...props} />} />
      <Route path="/providers" component={props => <PrivateRoute component={ServiceDirectory} {...props} />} />
      <Route path="/resources" component={props => <PrivateRoute component={Resources} {...props} />} />
      <Route path="/jobs" component={props => <PrivateRoute component={JobBoard} {...props} />} />
      <Route path="/transport" component={Transport} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AccessibilityProvider>
          <Toaster />
          <Router />
        </AccessibilityProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
