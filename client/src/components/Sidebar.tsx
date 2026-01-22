import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useAccessibility } from "@/components/AccessbilityProvider";
import { useMyPoints } from "@/hooks/use-valorization";
import { 
  Home, 
  Users, 
  Gamepad2, 
  User, 
  LogOut, 
  Eye, 
  Type,
  Trophy,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { highContrast, setHighContrast, fontSize, setFontSize } = useAccessibility();
  const { data: myPoints } = useMyPoints();

  const navItems = [
    { href: "/", label: "Village Square", icon: Home },
    { href: "/groups", label: "Groups", icon: Users },
    { href: "/recognition", label: "Recognition", icon: Trophy },
    { href: "/games", label: "Games", icon: Gamepad2 },
    { href: "/profile", label: "My Profile", icon: User },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border shadow-xl flex flex-col z-50 hidden md:flex">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="DisabilitySquare Logo" 
            className="h-12 w-auto"
          />
          <div>
            <h1 className="font-display text-xl text-primary font-bold">DisabilitySquare</h1>
            <p className="text-xs text-muted-foreground">Our Virtual Village</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group",
                location === item.href
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "hover:bg-secondary text-foreground hover:translate-x-1"
              )}
              data-testid={`link-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <item.icon className={cn("h-6 w-6", location === item.href ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
              <span className="font-medium text-lg">{item.label}</span>
            </div>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-border/50 space-y-4">
        {/* Accessibility Controls */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-start gap-3" data-testid="button-display-settings">
              <Eye className="h-5 w-5" />
              <span>Display Settings</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>Accessibility</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setHighContrast(!highContrast)}>
              <div className="flex items-center gap-2 w-full">
                <Eye className="h-4 w-4" />
                <span>High Contrast</span>
                <span className="ml-auto text-xs font-mono">{highContrast ? 'ON' : 'OFF'}</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Font Size</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setFontSize("normal")}>
              <Type className="h-4 w-4 mr-2" /> Normal
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFontSize("large")}>
              <Type className="h-5 w-5 mr-2" /> Large
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFontSize("extra-large")}>
              <Type className="h-6 w-6 mr-2" /> Extra Large
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Points Display */}
        {myPoints && (
          <Link href="/recognition">
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-3 rounded-lg cursor-pointer hover:from-primary/20 hover:to-accent/20 transition-colors" data-testid="card-my-points">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  <span className="font-medium">My Points</span>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-primary text-lg" data-testid="text-my-points">{myPoints.totalPoints}</p>
                  <p className="text-xs text-muted-foreground">Level {myPoints.level}</p>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* User Info & Logout */}
        <div className="bg-muted/30 p-3 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
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
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </aside>
  );
}
