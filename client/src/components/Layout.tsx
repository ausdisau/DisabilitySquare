import { Sidebar } from "./Sidebar";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { AccessibilityPanel } from "./AccessibilityPanel";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

function TopBar() {
  const { user, logout } = useAuth();

  return (
    <header className="retro-topbar" role="banner">
      <div className="flex items-center gap-2 flex-1">
        <img src="/logo.png" alt="DisabilitySquare Logo" className="h-7 w-7 object-contain" />
        <Link href="/">
          <span className="font-bold text-white text-sm tracking-wide hover:text-orange-200 cursor-pointer">
            DisabilitySquare
          </span>
        </Link>
        <span className="text-blue-200 text-xs ml-1 hidden sm:inline">— Our Virtual Village</span>
      </div>

      <div className="flex items-center gap-3 text-xs">
        {user && (
          <>
            <span className="text-blue-200 hidden sm:inline">
              Welcome,{" "}
              <span className="text-white font-semibold">
                {user.firstName || "Member"}
              </span>
            </span>
            <span className="text-blue-300 hidden sm:inline">|</span>
            <button
              onClick={() => logout()}
              className="retro-nav-link"
              data-testid="button-topbar-logout"
              aria-label="Sign out"
            >
              Sign Out
            </button>
          </>
        )}
      </div>

      <div className="md:hidden ml-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/10"
              aria-label="Open navigation menu"
              data-testid="button-mobile-menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-52 pt-10">
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background transition-colors duration-300" style={{ fontFamily: "Verdana, Arial, sans-serif" }}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <TopBar />

      <div className="flex" style={{ paddingTop: "40px" }}>
        <div className="hidden md:block sticky top-10 h-[calc(100vh-40px)] overflow-y-auto shrink-0 border-r border-[#b0b8c8] bg-[#F5F2ED]" style={{ width: "200px" }}>
          <Sidebar />
        </div>

        <main
          id="main-content"
          role="main"
          className="flex-1 min-w-0"
        >
          <div className="max-w-5xl mx-auto p-3 md:p-4 pb-16 animate-in fade-in duration-300">
            {children}
          </div>
        </main>
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
    </div>
  );
}
