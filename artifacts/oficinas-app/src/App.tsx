import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner'; // Using sonner as per instructions
import { TooltipProvider } from '@/components/ui/tooltip';
import { setBaseUrl } from '@workspace/api-client-react';

setBaseUrl('https://atividademongo.onrender.com');
import { Route, Switch, Router as WouterRouter } from 'wouter';

import { Shell } from "@/components/layout/Shell";
import Dashboard from "@/pages/Dashboard";
import OficinasList from "@/pages/oficinas/OficinasList";
import OficinaForm from "@/pages/oficinas/OficinaForm";
import OficinaDetails from "@/pages/oficinas/OficinaDetails";
import VeiculosList from "@/pages/veiculos/VeiculosList";
import VeiculoForm from "@/pages/veiculos/VeiculoForm";
import VeiculoDetails from "@/pages/veiculos/VeiculoDetails";
import NotFound from '@/pages/not-found';

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
    <Shell>
      <Switch>
        <Route path="/" component={Dashboard} />
        
        <Route path="/oficinas" component={OficinasList} />
        <Route path="/oficinas/nova" component={OficinaForm} />
        <Route path="/oficinas/:id" component={OficinaDetails} />
        <Route path="/oficinas/:id/editar" component={OficinaForm} />
        
        <Route path="/veiculos" component={VeiculosList} />
        <Route path="/veiculos/novo" component={VeiculoForm} />
        <Route path="/veiculos/:id" component={VeiculoDetails} />
        <Route path="/veiculos/:id/editar" component={VeiculoForm} />
        
        <Route component={NotFound} />
      </Switch>
    </Shell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster position="top-right" richColors />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;