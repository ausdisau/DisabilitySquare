import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePointsLeaderboard, useRecentAchievements, useAllBadges } from "@/hooks/use-valorization";
import { Trophy, Star, Award, Zap, Users, GraduationCap, Megaphone, HandHeart, UserPlus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const iconMap: Record<string, any> = {
  Trophy,
  Star,
  Award,
  Users,
  GraduationCap,
  Megaphone,
  HandHeart,
  UserPlus,
};

export default function Recognition() {
  const { data: leaderboard, isLoading: loadingLeaderboard } = usePointsLeaderboard(10);
  const { data: achievements, isLoading: loadingAchievements } = useRecentAchievements(15);
  const { data: allBadges, isLoading: loadingBadges } = useAllBadges();

  return (
    <Layout>
      <SEO 
        title="Community Recognition - DisabilitySquare" 
        description="Celebrate community members making meaningful connections and contributions"
      />

      <div className="space-y-8" data-testid="page-recognition">
        <div className="text-center">
          <h1 className="text-4xl font-display font-bold text-primary mb-2" data-testid="title-recognition">
            Community Recognition
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Celebrating genuine connections and valued contributions. Every interaction matters.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Community Leaders
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loadingLeaderboard ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                  </div>
                ) : (
                  <div className="divide-y">
                    {leaderboard?.map((entry: any, index: number) => (
                      <div 
                        key={entry.id} 
                        className="p-4 flex items-center gap-4"
                        data-testid={`row-leader-${index}`}
                      >
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                          ${index === 0 ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-400' : 
                            index === 1 ? 'bg-gray-100 text-gray-700' :
                            index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-muted text-muted-foreground'}
                        `}>
                          {index + 1}
                        </div>
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={entry.user?.profileImageUrl} />
                          <AvatarFallback className="bg-primary/20 text-primary font-bold">
                            {entry.user?.firstName?.[0]}{entry.user?.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium" data-testid={`text-leader-name-${index}`}>
                            {entry.user?.firstName} {entry.user?.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Level {entry.level}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-primary text-lg" data-testid={`text-leader-points-${index}`}>
                            {entry.totalPoints}
                          </p>
                          <p className="text-xs text-muted-foreground">points</p>
                        </div>
                      </div>
                    ))}
                    {leaderboard?.length === 0 && (
                      <div className="p-8 text-center text-muted-foreground">
                        No leaders yet. Start engaging to earn points!
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-accent" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loadingAchievements ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : (
                  <div className="divide-y max-h-96 overflow-y-auto">
                    {achievements?.map((achievement: any, index: number) => (
                      <div 
                        key={achievement.id} 
                        className="p-3 flex items-center gap-3"
                        data-testid={`row-achievement-${index}`}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={achievement.user?.profileImageUrl} />
                          <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                            {achievement.user?.firstName?.[0]}{achievement.user?.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">
                            <span className="font-medium">{achievement.user?.firstName}</span>
                            {" "}{achievement.description || `earned ${achievement.points} points`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(achievement.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        <Badge variant="secondary" className="font-mono">
                          +{achievement.points}
                        </Badge>
                      </div>
                    ))}
                    {achievements?.length === 0 && (
                      <div className="p-8 text-center text-muted-foreground">
                        No activity yet. Be the first to contribute!
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="bg-gradient-to-r from-accent/10 to-secondary/10">
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-accent" />
                  Available Badges
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {loadingBadges ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allBadges?.map((badge: any) => {
                      const IconComponent = iconMap[badge.icon] || Award;
                      return (
                        <div 
                          key={badge.id} 
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                          data-testid={`card-badge-${badge.id}`}
                        >
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${badge.color}20`, color: badge.color }}
                          >
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{badge.name}</p>
                            <p className="text-xs text-muted-foreground">{badge.description}</p>
                            <p className="text-xs text-primary mt-1">
                              {badge.pointsRequired} points required
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <Star className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-display text-lg font-bold mb-2">How It Works</h3>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">10</span>
                    <span>points for creating a post</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">5</span>
                    <span>points for commenting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">15</span>
                    <span>points for thoughtful comments (100+ chars)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">8</span>
                    <span>points when others engage with you</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">20</span>
                    <span>points for creating a group</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
