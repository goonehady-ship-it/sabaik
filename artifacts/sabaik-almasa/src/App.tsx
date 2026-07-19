import { Route, Switch, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import Home from '@/pages/Home';
import Chat from '@/pages/Chat';
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminLogin from '@/pages/admin/Login';
import AdminRequests from '@/pages/admin/Requests';
import AdminConversations from '@/pages/admin/Conversations';
import NotFound from '@/pages/not-found';
import { useEffect } from 'react';
import { ServiceRequestProvider } from '@/context/ServiceRequestContext';
import { ServiceRequestModal } from '@/components/home/ServiceRequestModal';

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
      <Route path="/" component={Home} />
      <Route path="/chat" component={Chat} />
      <Route path="/admin/login" component={AdminLogin} />
      
      {/* Admin Routes wrapped in Layout */}
      <Route path="/admin/*?">
        <AdminLayout>
          <Switch>
            <Route path="/admin" component={AdminDashboard} />
            <Route path="/admin/requests" component={AdminRequests} />
            <Route path="/admin/conversations" component={AdminConversations} />
            {/* Additional admin routes would go here */}
            <Route component={() => <div className="p-8 text-center">صفحة الإدارة قيد التطوير</div>} />
          </Switch>
        </AdminLayout>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ServiceRequestProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <ServiceRequestModal />
          <Toaster />
        </ServiceRequestProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
