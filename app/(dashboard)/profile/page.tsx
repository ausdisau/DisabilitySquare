"use client";

import { useState, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Save, Settings } from "lucide-react";

interface Profile {
  bio: string | null;
  location: string | null;
  diagnosis: string | null;
  interests: string[];
  accessibilitySettings: {
    highContrast: boolean;
    fontSize: "normal" | "large" | "extra-large";
  };
}

export default function ProfilePage() {
  const { user } = useUser();
  const [profile, setProfile] = useState<Profile>({
    bio: "",
    location: "",
    diagnosis: "",
    interests: [],
    accessibilitySettings: { highContrast: false, fontSize: "normal" },
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    // Apply accessibility settings
    const body = document.body;
    body.classList.remove("high-contrast", "text-size-normal", "text-size-large", "text-size-xlarge");
    
    if (profile.accessibilitySettings.highContrast) {
      body.classList.add("high-contrast");
    }
    
    switch (profile.accessibilitySettings.fontSize) {
      case "large": body.classList.add("text-size-large"); break;
      case "extra-large": body.classList.add("text-size-xlarge"); break;
      default: body.classList.add("text-size-normal");
    }
  }, [profile.accessibilitySettings]);

  async function fetchProfile() {
    try {
      const res = await fetch("/api/profiles");
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile({
            bio: data.profile.bio || "",
            location: data.profile.location || "",
            diagnosis: data.profile.diagnosis || "",
            interests: data.profile.interests || [],
            accessibilitySettings: data.profile.accessibilitySettings || { highContrast: false, fontSize: "normal" },
          });
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/profiles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-primary flex items-center gap-3">
          <User className="w-8 h-8" /> My Profile
        </h1>
        <p className="text-muted-foreground">Manage your profile and accessibility settings</p>
      </div>

      {/* User Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user?.picture || undefined} />
              <AvatarFallback className="text-xl">
                {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{user?.name || "User"}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Profile Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">About You</CardTitle>
          <CardDescription>Tell the community about yourself</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Share a little about yourself..."
              value={profile.bio || ""}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              rows={4}
              data-testid="input-bio"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="City, Country"
              value={profile.location || ""}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              data-testid="input-location"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnosis (optional)</Label>
            <Input
              id="diagnosis"
              placeholder="Share if you're comfortable"
              value={profile.diagnosis || ""}
              onChange={(e) => setProfile({ ...profile, diagnosis: e.target.value })}
              data-testid="input-diagnosis"
            />
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="w-5 h-5" /> Accessibility Settings
          </CardTitle>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="highContrast" className="text-base">High Contrast Mode</Label>
              <p className="text-sm text-muted-foreground">Increases color contrast for better visibility</p>
            </div>
            <Switch
              id="highContrast"
              checked={profile.accessibilitySettings.highContrast}
              onCheckedChange={(checked) => 
                setProfile({
                  ...profile,
                  accessibilitySettings: { ...profile.accessibilitySettings, highContrast: checked }
                })
              }
              data-testid="switch-high-contrast"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fontSize">Text Size</Label>
            <Select
              value={profile.accessibilitySettings.fontSize}
              onValueChange={(value: "normal" | "large" | "extra-large") =>
                setProfile({
                  ...profile,
                  accessibilitySettings: { ...profile.accessibilitySettings, fontSize: value }
                })
              }
            >
              <SelectTrigger data-testid="select-font-size">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="large">Large</SelectItem>
                <SelectItem value="extra-large">Extra Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={handleSave} 
        disabled={saving}
        className="w-full gap-2"
        data-testid="button-save-profile"
      >
        <Save className="w-4 h-4" />
        {saving ? "Saving..." : saved ? "Saved!" : "Save Profile"}
      </Button>
    </div>
  );
}
