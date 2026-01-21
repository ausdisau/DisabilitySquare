import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { useProfile, useUpdateProfile } from "@/hooks/use-profiles";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile(user?.id);
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();
  
  const form = useForm({
    defaultValues: {
      bio: "",
      location: "",
      diagnosis: ""
    }
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        bio: profile.bio || "",
        location: profile.location || "",
        diagnosis: profile.diagnosis || ""
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
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-4xl font-display font-bold text-primary">My Profile</h1>
        
        <div className="flex items-center gap-6 mb-8">
          <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
            <AvatarImage src={user?.profileImageUrl || undefined} />
            <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
              {user?.firstName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{user?.firstName} {user?.lastName}</h2>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
        </div>

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
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input 
                  {...form.register("location")} 
                  placeholder="City, Country"
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
                />
                <p className="text-xs text-muted-foreground">This helps us recommend relevant groups.</p>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" disabled={updateProfile.isPending} className="w-full">
            {updateProfile.isPending ? <Loader2 className="animate-spin mr-2"/> : <Save className="mr-2 h-4 w-4"/>}
            Save Changes
          </Button>
        </form>
      </div>
    </Layout>
  );
}
