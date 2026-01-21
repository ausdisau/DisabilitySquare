import { Sidebar } from "./Sidebar";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar as MobileSidebarContent } from "./Sidebar"; // Reusing the component logic
import { useAccessibility } from "./AccessbilityProvider";
import { Button } from "./ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const { highContrast } = useAccessibility();

  return (
    <div className={`min-h-screen ${highContrast ? 'dark' : ''} bg-background transition-colors duration-300`}>
      <Sidebar />
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-card sticky top-0 z-40">
        <h1 className="font-display text-xl text-primary font-bold">DisabilitySquare</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>

      <main className="md:pl-64 transition-all duration-300">
        <div className="container mx-auto p-4 md:p-8 lg:p-12 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
