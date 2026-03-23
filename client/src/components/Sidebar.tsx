import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useMyPoints } from "@/hooks/use-valorization";
import {
  Home, Users, Gamepad2, User, Trophy, Puzzle,
  Spline, BookOpen, Building2, BookMarked, Briefcase, Bus, Star, HeartHandshake, MessageCircle,
} from "lucide-react";

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

  return (
    <nav role="navigation" aria-label="Main navigation" className="w-full">
      {/* My Profile Box */}
      <div className="retro-box">
        <div className="retro-box-header">
          <User className="h-3 w-3" aria-hidden="true" />
          My Profile
        </div>
        <div className="retro-box-content">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="h-9 w-9 rounded-sm bg-[#1B4B8A] flex items-center justify-center text-white text-xs font-bold shrink-0 border border-[#0e2f5a]"
              aria-hidden="true"
            >
              {initials || "?"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-[#1B4B8A] truncate leading-tight">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>

          {myPoints && (
            <Link href="/recognition">
              <div
                className="text-[11px] border border-[#c8d0dc] bg-[#f6f8fb] p-1.5 mb-2 cursor-pointer hover:bg-[#eef2f8]"
                data-testid="card-my-points"
                role="status"
                aria-label={`${myPoints.totalPoints} points, Level ${myPoints.level}`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[#1B4B8A]">
                    <Star className="h-3 w-3" aria-hidden="true" />
                    Points
                  </span>
                  <span className="font-mono font-bold text-[#E07830]" data-testid="text-my-points">
                    {myPoints.totalPoints}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-gray-500">Level</span>
                  <span className="font-bold text-[#2A9D8F]">{myPoints.level}</span>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Navigation Box */}
      <div className="retro-box">
        <div className="retro-box-header">
          <Home className="h-3 w-3" aria-hidden="true" />
          Navigation
        </div>
        <div>
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`retro-nav-link-sidebar ${isActive ? "active" : ""}`}
                  data-testid={`link-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <item.icon className="h-3 w-3 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* About Box */}
      <div className="retro-box">
        <div className="retro-box-header">About</div>
        <div className="retro-box-content">
          <p className="text-[10px] text-gray-600 leading-relaxed">
            DisabilitySquare is a safe, accessible community for people with disabilities. No algorithms — just people.
          </p>
          <div className="retro-divider" />
          <p className="text-[10px] text-gray-500">
            🇦🇺 Australian eSafety compliant · 16+ · WCAG AAA
          </p>
        </div>
      </div>
    </nav>
  );
}
