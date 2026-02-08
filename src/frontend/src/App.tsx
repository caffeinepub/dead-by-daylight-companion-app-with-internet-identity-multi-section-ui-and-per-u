import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import AppLayout from './components/AppLayout';
import CharactersPage from './pages/CharactersPage';
import PerksPage from './pages/PerksPage';
import BuildPlannerPage from './pages/BuildPlannerPage';
import MatchTrackerPage from './pages/MatchTrackerPage';
import NewsPage from './pages/NewsPage';
import WikiPage from './pages/WikiPage';
import ProfilePage from './pages/ProfilePage';
import { Toaster } from '@/components/ui/sonner';

const rootRoute = createRootRoute({
  component: () => (
    <>
      <AppLayout>
        <Outlet />
      </AppLayout>
      <Toaster />
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: CharactersPage,
});

const charactersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/characters',
  component: CharactersPage,
});

const perksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/perks',
  component: PerksPage,
});

const buildPlannerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/builds',
  component: BuildPlannerPage,
});

const matchTrackerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/matches',
  component: MatchTrackerPage,
});

const newsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/news',
  component: NewsPage,
});

const wikiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/wiki',
  component: WikiPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  charactersRoute,
  perksRoute,
  buildPlannerRoute,
  matchTrackerRoute,
  newsRoute,
  wikiRoute,
  profileRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
