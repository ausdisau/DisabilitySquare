import { Sidebar } from "./Sidebar";
import { Menu, Search } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { AccessibilityPanel } from "./AccessibilityPanel";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { CreatePostDialog } from "./CreatePostDialog";
import { Footer } from "./Footer";

function TopBar() {
  const { user } = useAuth();

  return (
    <header className="sm-topbar" role="banner">
      <div className="flex items-center gap-3 w-[240px] shrink-0">
        <img src="/logo.png" alt="DisabilitySquare Logo" className="h-7 w-7 object-contain" />
        <Link href="/">
          <span className="font-bold text-white text-base tracking-wide hover:text-white/80 cursor-pointer hidden sm:inline">
            DisabilitySquare
          </span>
        </Link>
      </div>

      <div className="flex-1 flex justify-center px-4 max-w-xl mx-auto">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search the village…"
            className="w-full pl-9 pr-4 py-2 text-sm bg-white/15 border border-white/20 rounded-full text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 transition-all"
            aria-label="Search DisabilitySquare"
            data-testid="input-search"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 w-[240px] justify-end shrink-0">
        {user && (
          <div className="hidden sm:block">
            <CreatePostDialog />
          </div>
        )}

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-white hover:bg-white/20"
                aria-label="Open navigation menu"
                data-testid="button-mobile-menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 pt-14">
              <Sidebar />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <TopBar />

      <div className="flex justify-center" style={{ paddingTop: "56px" }}>
        <div className="hidden md:flex flex-col sticky top-14 h-[calc(100vh-56px)] overflow-y-auto shrink-0" style={{ width: "240px" }}>
          <Sidebar />
        </div>

        <main
          id="main-content"
          role="main"
          className="flex-1 min-w-0 max-w-[900px]"
        >
          <div className="px-4 py-4 pb-16 animate-in fade-in duration-300">
            {children}
          </div>
        </main>

        <div className="hidden xl:block shrink-0" style={{ width: "240px" }} />
      </div>

      <AccessibilityPanel />
      <KeyboardShortcuts />

      <div
        id="announcer"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      <Footer />
    </div>
  );
}
