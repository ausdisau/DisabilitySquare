import { Sidebar } from "./Sidebar";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useSidebarState } from "@/hooks/use-sidebar-state";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { AccessibilityPanel } from "./AccessibilityPanel";
import { KeyboardShortcuts } from "./KeyboardShortcuts";

export function Layout({ children }: { children: React.ReactNode }) {
  const { isExpanded } = useSidebarState();

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      <Sidebar />
      
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-card sticky top-0 z-40">
        <h1 className="font-display text-xl text-primary font-bold">DisabilitySquare</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu" data-testid="button-mobile-menu">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>

      <main 
        id="main-content" 
        role="main"
        className={cn(
          "transition-all duration-300",
          isExpanded ? "md:pl-64" : "md:pl-16"
        )}
      >
        <div className="container mx-auto p-4 md:p-8 lg:p-12 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>

      <AccessibilityPanel />
      <KeyboardShortcuts />
      
      <div 
        id="announcer" 
        role="status" 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      />
    </div>
  );
}
