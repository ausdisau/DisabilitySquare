import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useMyPoints } from "@/hooks/use-valorization";
import {
  Home, Users, Gamepad2, User, Trophy, Puzzle,
  Spline, BookOpen, Building2, BookMarked, Briefcase, Bus, HeartHandshake, MessageCircle, Shield,
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
];

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { data: myPoints } = useMyPoints();

  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase();
  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Member";

  return (
    <nav role="navigation" aria-label="Main navigation" className="w-full flex flex-col h-full py-3 px-3">

      {/* Profile panel — identity first, Bebo/MySpace style */}
      {user && (
        <Link href="/profile">
          <div
            className="sm-profile-panel cursor-pointer hover:opacity-95 transition-opacity mb-2"
            data-testid="link-user-profile"
            aria-label={`Go to ${fullName}'s profile`}
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 shrink-0 ring-2 ring-white/40">
                <AvatarImage src={user?.profileImageUrl || undefined} />
                <AvatarFallback className="bg-white/20 text-white text-sm font-bold">
                  {initials || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate leading-tight">{fullName}</p>
                <p className="text-[11px] text-white/70 mt-0.5">Community Member</p>
              </div>
            </div>
            {myPoints && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/20">
                <div className="flex-1 text-center">
                  <p className="text-base font-bold text-white" data-testid="text-my-points">{myPoints.totalPoints}</p>
                  <p className="text-[10px] text-white/60 uppercase tracking-wide">Points</p>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="flex-1 text-center">
                  <p className="text-base font-bold text-white">Lv {myPoints.level}</p>
                  <p className="text-[10px] text-white/60 uppercase tracking-wide">Level</p>
                </div>
              </div>
            )}
          </div>
        </Link>
      )}

      {/* Post button */}
      <div className="mb-3 px-1">
        <CreatePostDialog />
      </div>

      <div className="sm-divider mb-1" />

      {/* Navigation items */}
      <div className="flex-1 space-y-0.5 overflow-y-auto">
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
                  className={`sm-nav-icon h-4.5 w-4.5 shrink-0`}
                  style={{ height: "18px", width: "18px" }}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}

        {/* Profile link */}
        <Link href="/profile">
          <div
            className={`sm-nav-link ${location === "/profile" ? "active" : ""}`}
            data-testid="link-nav-my-profile"
            aria-current={location === "/profile" ? "page" : undefined}
          >
            <User style={{ height: "18px", width: "18px" }} className="sm-nav-icon shrink-0" aria-hidden="true" />
            <span>My Profile</span>
          </div>
        </Link>
      </div>

      <div className="sm-divider mt-2" />

      {/* Safety & Legal */}
      <div className="mt-1 space-y-0.5">
        <Link href="/safety">
          <div
            className={`sm-nav-link text-xs ${location === "/safety" ? "active" : ""}`}
            style={{ padding: "7px 14px", fontSize: "12px" }}
            data-testid="link-nav-safety-centre"
          >
            <Shield style={{ height: "15px", width: "15px" }} className="shrink-0" aria-hidden="true" />
            <span>Safety Centre</span>
          </div>
        </Link>
        <div className="flex gap-4 px-3 py-1">
          <Link href="/terms">
            <span className="text-[11px] text-muted-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-nav-terms">
              Terms
            </span>
          </Link>
          <Link href="/privacy">
            <span className="text-[11px] text-muted-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-nav-privacy">
              Privacy
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
