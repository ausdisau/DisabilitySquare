import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { useProfile, useUpdateProfile } from "@/hooks/use-profiles";
import { useMyPoints, useMyBadges } from "@/hooks/use-valorization";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Star, Award, Trophy, Users, GraduationCap, Megaphone, HandHeart, UserPlus, Heart, MessageSquare, ShieldCheck } from "lucide-react";

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

export default function Profile() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile(user?.id);
  const { data: myPoints } = useMyPoints();
  const { data: myBadges } = useMyBadges();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();
  
  const form = useForm({
    defaultValues: {
      bio: "",
      location: "",
      diagnosis: "",
      healthPrompts: {
        wishPeopleKnew: "",
        goodDayLooksLike: "",
        supportLooksLike: "",
      }
    }
  });

  useEffect(() => {
    if (profile) {
      const prompts = profile.healthPrompts || {};
      form.reset({
        bio: profile.bio || "",
        location: profile.location || "",
        diagnosis: profile.diagnosis || "",
        healthPrompts: {
          wishPeopleKnew: prompts.wishPeopleKnew || "",
          goodDayLooksLike: prompts.goodDayLooksLike || "",
          supportLooksLike: prompts.supportLooksLike || "",
        }
      });
    }
  }, [profile, form]);

  const onSubmit = (data: any) => {
    updateProfile.mutate(data, {
      onSuccess: () => {
        toast({ title: "Profile updated successfully!" });
      }
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <Skeleton className="h-[400px] w-full max-w-2xl mx-auto rounded-3xl" />
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO 
        title="My Profile" 
        description="Manage your DisabilitySquare profile. Update your bio, location, health story, and community preferences."
      />
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-4xl font-display font-bold text-primary" data-testid="text-profile-title">My Profile</h1>
        
        <div className="flex items-center gap-6 mb-8">
          <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
            <AvatarImage src={user?.profileImageUrl || undefined} />
            <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
              {user?.firstName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-bold">{user?.firstName} {user?.lastName}</h2>
              {profile?.visibility === "members_only" && profile?.dmRestricted && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                  data-testid="badge-protected-account"
                >
                  <ShieldCheck className="h-3 w-3" />
                  Protected Account
                </Badge>
              )}
            </div>
            {profile?.visibility === "members_only" && profile?.dmRestricted && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1" data-testid="text-protected-account-description">
                This account has enhanced privacy protections. Profile is visible to members only and direct messages are restricted to accepted connections.
              </p>
            )}
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        {/* Points & Badges Card */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              My Recognition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="text-center p-4 bg-background rounded-lg">
                <p className="text-4xl font-bold text-primary font-mono" data-testid="text-profile-points">
                  {myPoints?.totalPoints || 0}
                </p>
                <p className="text-sm text-muted-foreground">Total Points</p>
              </div>
              <div className="text-center p-4 bg-background rounded-lg">
                <p className="text-4xl font-bold text-accent font-mono" data-testid="text-profile-level">
                  {myPoints?.level || 1}
                </p>
                <p className="text-sm text-muted-foreground">Level</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Earned Badges
              </h4>
              {myBadges && myBadges.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {myBadges.map((userBadge: any) => {
                    const IconComponent = iconMap[userBadge.badge?.icon] || Award;
                    return (
                      <Badge 
                        key={userBadge.id} 
                        variant="secondary"
                        className="flex items-center gap-1 px-3 py-1"
                        style={{ backgroundColor: `${userBadge.badge?.color}20`, borderColor: userBadge.badge?.color }}
                        data-testid={`badge-${userBadge.badge?.id}`}
                      >
                        <IconComponent className="h-3 w-3" style={{ color: userBadge.badge?.color }} />
                        {userBadge.badge?.name}
                      </Badge>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No badges earned yet. Keep engaging with the community!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About Me</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea 
                  {...form.register("bio")} 
                  placeholder="Share a little about yourself..."
                  className="min-h-[100px]"
                  data-testid="input-bio"
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input 
                  {...form.register("location")} 
                  placeholder="City, Country"
                  data-testid="input-location"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Community Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Diagnosis (Optional)</Label>
                <Input 
                  {...form.register("diagnosis")} 
                  placeholder="Share if you'd like to connect with others with similar experiences"
                  data-testid="input-diagnosis"
                />
                <p className="text-xs text-muted-foreground">This helps us recommend relevant groups and peer matches.</p>
              </div>
            </CardContent>
          </Card>

          {/* Health Story Prompts — inspired by The Mighty's community model */}
          <Card className="border-[#2A9D8F]/20 bg-gradient-to-b from-[#2A9D8F]/3 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-[#E07830]" />
                My Health Story
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                These prompts help others understand your experience. They appear on your profile card in the Connect section.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <span className="text-base">💬</span>
                  What I wish people knew about my condition
                </Label>
                <Textarea
                  {...form.register("healthPrompts.wishPeopleKnew")}
                  placeholder="The thing most people don't understand is..."
                  className="min-h-[80px] resize-none"
                  data-testid="input-wish-people-knew"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <span className="text-base">☀️</span>
                  My good day looks like
                </Label>
                <Textarea
                  {...form.register("healthPrompts.goodDayLooksLike")}
                  placeholder="On a good day, I can..."
                  className="min-h-[80px] resize-none"
                  data-testid="input-good-day"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <span className="text-base">🤝</span>
                  Support looks like
                </Label>
                <Textarea
                  {...form.register("healthPrompts.supportLooksLike")}
                  placeholder="The best way someone can support me is..."
                  className="min-h-[80px] resize-none"
                  data-testid="input-support-looks-like"
                />
              </div>

              <div className="rounded-lg bg-amber-50 border border-amber-100 p-3">
                <p className="text-xs text-amber-800 leading-relaxed">
                  <span className="font-semibold">🔒 Your choice:</span> These prompts are visible to other members in the Connect section. Leave them blank if you'd prefer to keep them private. Only your diagnosis and location affect peer matching.
                </p>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" disabled={updateProfile.isPending} className="w-full" data-testid="button-save-profile">
            {updateProfile.isPending ? <Loader2 className="animate-spin mr-2"/> : <Save className="mr-2 h-4 w-4"/>}
            Save Changes
          </Button>
        </form>
      </div>
    </Layout>
  );
}
