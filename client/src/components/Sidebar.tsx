import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useMyPoints } from "@/hooks/use-valorization";
import { useSidebarState } from "@/hooks/use-sidebar-state";
import { 
  Home, 
  Users, 
  Gamepad2, 
  User, 
  LogOut, 
  Trophy,
  Star,
  Puzzle,
  ChevronLeft,
  ChevronRight,
  Spline,
  BookOpen,
  Building2,
  BookMarked,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { data: myPoints } = useMyPoints();
  const { isExpanded, toggleSidebar } = useSidebarState();

  const navItems = [
    { href: "/", label: "Village Square", icon: Home },
    { href: "/groups", label: "Groups", icon: Users },
    { href: "/spoons", label: "Spoon Tracker", icon: Spline },
    { href: "/journal", label: "Health Journal", icon: BookOpen },
    { href: "/providers", label: "Services", icon: Building2 },
    { href: "/resources", label: "Resources", icon: BookMarked },
    { href: "/jobs", label: "Jobs", icon: Briefcase },
    { href: "/recognition", label: "Recognition", icon: Trophy },
    { href: "/games", label: "Games", icon: Gamepad2 },
    { href: "/extensions", label: "Extensions", icon: Puzzle },
    { href: "/profile", label: "My Profile", icon: User },
  ];

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-card border-r border-border shadow-xl flex flex-col z-50 hidden md:flex transition-all duration-300",
        isExpanded ? "w-64" : "w-16"
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div 
        className={cn(
          "border-b border-border/50",
          isExpanded ? "p-4" : "p-2"
        )}
      >
        <div className={cn("flex items-center", isExpanded ? "gap-3" : "justify-center")}>
          <img 
            src="/logo.png" 
            alt="DisabilitySquare Logo" 
            className={cn("transition-all duration-300", isExpanded ? "h-12 w-auto" : "h-10 w-10 object-contain")}
          />
          {isExpanded && (
            <div className="flex-1 flex items-center justify-between">
              <div>
                <h1 className="font-display text-xl text-primary font-bold">DisabilitySquare</h1>
                <p className="text-xs text-muted-foreground">Our Virtual Village</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                aria-label="Collapse sidebar"
                data-testid="button-toggle-sidebar"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          )}
          {!isExpanded && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              aria-label="Expand sidebar"
              data-testid="button-toggle-sidebar-collapsed"
              className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="h-3 w-3" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>

      <nav className={cn("flex-1 space-y-2 overflow-y-auto", isExpanded ? "p-4" : "p-2")} aria-label="Site navigation">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const navContent = (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center rounded-xl transition-all duration-200 cursor-pointer group",
                  isExpanded ? "gap-3 px-4 py-3" : "justify-center p-3",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "hover:bg-secondary text-foreground hover:translate-x-1"
                )}
                data-testid={`link-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon 
                  className={cn(
                    "h-6 w-6 shrink-0", 
                    isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
                  )} 
                  aria-hidden="true"
                />
                {isExpanded && <span className="font-medium text-lg">{item.label}</span>}
              </div>
            </Link>
          );

          if (!isExpanded) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  {navContent}
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return navContent;
        })}
      </nav>

      <div className={cn("border-t border-border/50 space-y-4", isExpanded ? "p-4" : "p-2")}>
        {myPoints && (
          <Link href="/recognition">
            {isExpanded ? (
              <div 
                className="bg-gradient-to-r from-primary/10 to-accent/10 p-3 rounded-lg cursor-pointer hover:from-primary/20 hover:to-accent/20 transition-colors" 
                data-testid="card-my-points"
                role="status"
                aria-label={`You have ${myPoints.totalPoints} points at level ${myPoints.level}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" aria-hidden="true" />
                    <span className="font-medium">My Points</span>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-primary text-lg" data-testid="text-my-points">{myPoints.totalPoints}</p>
                    <p className="text-xs text-muted-foreground">Level {myPoints.level}</p>
                  </div>
                </div>
              </div>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="bg-gradient-to-r from-primary/10 to-accent/10 p-3 rounded-lg cursor-pointer hover:from-primary/20 hover:to-accent/20 transition-colors flex justify-center" 
                    data-testid="card-my-points"
                  >
                    <Star className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {myPoints.totalPoints} pts - Level {myPoints.level}
                </TooltipContent>
              </Tooltip>
            )}
          </Link>
        )}

        <div className={cn("bg-muted/30 rounded-lg", isExpanded ? "p-3" : "p-2")}>
          {isExpanded ? (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold shrink-0"
                  aria-hidden="true"
                >
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div className="overflow-hidden">
                  <p className="font-medium truncate">{user?.firstName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
              <Button 
                variant="destructive" 
                className="w-full justify-start gap-2"
                onClick={() => logout()}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign Out
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold cursor-pointer"
                    aria-hidden="true"
                  >
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {user?.firstName} {user?.lastName}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="icon"
                    onClick={() => logout()}
                    data-testid="button-logout"
                    aria-label="Sign out"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Sign Out</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
