import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import SiteShell from "./components/SiteShell";
import { ThemeProvider } from "./contexts/ThemeContext";
import Details from "./pages/Details";
import Home from "./pages/Home";
import Player from "./pages/Player";
import Search from "./pages/Search";

function Router() {
  return <SiteShell><Switch><Route path="/" component={Home} /><Route path="/search" component={Search} /><Route path="/anime/:id" component={Details} /><Route path="/watch/:id" component={Player} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch></SiteShell>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
