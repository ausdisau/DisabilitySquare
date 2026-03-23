import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useMyPoints } from "@/hooks/use-valorization";
import {
  Home, Users, Gamepad2, User, Trophy, Puzzle,
  Spline, BookOpen, Building2, BookMarked, Briefcase, Bus, Star, HeartHandshake, MessageCircle,
} from "lucide-react";
import { CreatePostDialog } from "./CreatePostDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { href: "/", label: "Village Square", icon: Home },
  { href: "/connect", label: "Peer Connect", icon: HeartHandshake },
  { href: "/forums", label: "Forums", icon: MessageCircle },
  { href: "/groups", label: "Groups", icon: Users },
  { href: "/spoons", label: "Spoon Tracker", icon: Spline },
  { href: "/journal", label: "Health Journal", icon: BookOpen },
  { href: "/providers", label: "Services", icon: Building2 },
  { href: "/resources", label: "Resources", icon: BookMarked },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/transport", label: "Transport", icon: Bus },
  { href: "/recognition", label: "Recognition", icon: Trophy },
  { href: "/games", label: "Games", icon: Gamepad2 },
  { href: "/extensions", label: "Extensions", icon: Puzzle },
  { href: "/profile", label: "My Profile", icon: User },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { data: myPoints } = useMyPoints();

  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase();
  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Member";

  return (
    <nav role="navigation" aria-label="Main navigation" className="w-full flex flex-col h-full py-4 px-3">
      <div className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`sm-nav-link ${isActive ? "active" : ""}`}
                data-testid={`link-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon
                  className={`sm-nav-icon h-5 w-5 shrink-0 ${isActive ? "text-primary" : "text-foreground/70"}`}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-4 px-1">
        <CreatePostDialog />
      </div>

      <div className="sm-divider mt-4" />

      <Link href="/profile">
        <div
          className="flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-muted cursor-pointer transition-colors"
          data-testid="link-user-profile"
          aria-label={`Go to ${fullName}'s profile`}
        >
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={user?.profileImageUrl || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
              {initials || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{fullName}</p>
            {myPoints && (
              <p className="text-xs text-muted-foreground" data-testid="text-my-points">
                <Star className="h-3 w-3 inline mr-0.5 text-accent" aria-hidden="true" />
                {myPoints.totalPoints} pts · Lv {myPoints.level}
              </p>
            )}
          </div>
        </div>
      </Link>
    </nav>
  );
}
