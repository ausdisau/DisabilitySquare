import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useAccessibility } from "@/components/AccessbilityProvider";
import { 
  Home, 
  Users, 
  Gamepad2, 
  User, 
  LogOut, 
  Eye, 
  Type 
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

  const navItems = [
    { href: "/", label: "Village Square", icon: Home },
    { href: "/groups", label: "Groups", icon: Users },
    { href: "/games", label: "Games", icon: Gamepad2 },
    { href: "/profile", label: "My Profile", icon: User },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border shadow-xl flex flex-col z-50 hidden md:flex">
      <div className="p-6 border-b border-border/50">
        <h1 className="font-display text-2xl text-primary font-bold">DisabilitySquare</h1>
        <p className="text-sm text-muted-foreground mt-1">Our Virtual Village</p>
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
            <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3">
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
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </aside>
  );
}
