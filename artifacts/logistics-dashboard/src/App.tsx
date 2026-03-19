import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Dashboard from "./pages/dashboard";
import Shipments from "./pages/shipments";
import Fleet from "./pages/fleet";
import Inventory from "./pages/inventory";
import Analytics from "./pages/analytics";
import Yard from "./pages/yard";
import Fragmentation from "./pages/fragmentation";
import Verification from "./pages/verification";
import Workforce from "./pages/workforce";
import NotFound from "./pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/shipments" component={Shipments} />
      <Route path="/fleet" component={Fleet} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/yard" component={Yard} />
      <Route path="/fragmentation" component={Fragmentation} />
      <Route path="/verification" component={Verification} />
      <Route path="/workforce" component={Workforce} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
