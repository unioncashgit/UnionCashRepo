import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import PasscodePage from "@/pages/passcode";
import SetupPasscodePage from "@/pages/setup-passcode";
import Dashboard from "@/pages/dashboard";
import PaymentPage from "@/pages/payment";
import CardPage from "@/pages/card";
import BudgetPage from "@/pages/budget";
import HistoryPage from "@/pages/history";
import AnalyticsPage from "@/pages/analytics";
import SecurityPage from "@/pages/security";
import SettingsPage from "@/pages/settings";
import NotFound from "@/pages/not-found";

function AuthenticatedRouter() {
  return (
    <Switch>
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/payment" component={PaymentPage} />
      <Route path="/card" component={CardPage} />
      <Route path="/budget" component={BudgetPage} />
      <Route path="/history" component={HistoryPage} />
      <Route path="/analytics" component={AnalyticsPage} />
      <Route path="/security" component={SecurityPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/">
        <Redirect to="/dashboard" />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedApp() {
  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-4 p-4 border-b border-border h-16 flex-shrink-0">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto bg-background">
            <AuthenticatedRouter />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AppContent() {
  const { user, isLoading, isAuthenticated, needsPasscode, needsPasscodeSetup } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const publicRoutes = ["/login", "/register"];
  const isPublicRoute = publicRoutes.includes(location);

  if (!user) {
    if (isPublicRoute) {
      return (
        <Switch>
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
        </Switch>
      );
    }
    return <LoginPage />;
  }

  if (needsPasscodeSetup) {
    if (location !== "/setup-passcode") {
      return <SetupPasscodePage />;
    }
    return (
      <Switch>
        <Route path="/setup-passcode" component={SetupPasscodePage} />
      </Switch>
    );
  }

  if (needsPasscode) {
    if (location !== "/passcode") {
      return <PasscodePage />;
    }
    return (
      <Switch>
        <Route path="/passcode" component={PasscodePage} />
      </Switch>
    );
  }

  if (isAuthenticated) {
    if (isPublicRoute || location === "/passcode" || location === "/setup-passcode") {
      return (
        <Switch>
          <Route path="/">
            <Redirect to="/dashboard" />
          </Route>
          <Route>
            <Redirect to="/dashboard" />
          </Route>
        </Switch>
      );
    }
    return <AuthenticatedApp />;
  }

  return <LoginPage />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="union-cash-theme">
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
