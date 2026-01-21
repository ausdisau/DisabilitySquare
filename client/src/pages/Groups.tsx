import { useState } from "react";
import { useGroups, useCreateGroup } from "@/hooks/use-groups";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Users, Plus, Loader2, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export default function Groups() {
  const [category, setCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const { data: groups, isLoading } = useGroups({ 
    category: category === "all" ? undefined : category,
    search: search || undefined
  });

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold text-primary mb-2">Community Groups</h1>
            <p className="text-lg text-muted-foreground">Find your people based on shared interests and experiences.</p>
          </div>
          <CreateGroupDialog />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-xl shadow-sm border border-border/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search groups..." 
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="diagnosis">Diagnosis Support</SelectItem>
              <SelectItem value="interest">Hobbies & Interests</SelectItem>
              <SelectItem value="location">Local Meetups</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-[300px] rounded-2xl" />
            ))}
          </div>
        ) : groups?.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No groups found matching your criteria. Why not create one?
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups?.map((group) => (
              <Link key={group.id} href={`/groups/${group.id}`}>
                <div className="group cursor-pointer">
                  <Card className="h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-primary/20">
                    <div className="h-32 bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center">
                      <Users className="h-12 w-12 text-primary/50" />
                    </div>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs font-bold rounded-full uppercase tracking-wider">
                          {group.category}
                        </span>
                      </div>
                      <CardTitle className="font-display text-2xl mt-2 group-hover:text-primary transition-colors">
                        {group.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                        {group.description}
                      </p>
                    </CardContent>
                    <CardFooter className="text-sm text-muted-foreground border-t bg-muted/20 p-4">
                      Created {formatDistanceToNow(new Date(group.createdAt || new Date()), { addSuffix: true })}
                    </CardFooter>
                  </Card>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

function CreateGroupDialog() {
  const [open, setOpen] = useState(false);
  const createGroup = useCreateGroup();
  const [formData, setFormData] = useState({ name: "", description: "", category: "interest" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createGroup.mutate(formData, {
      onSuccess: () => setOpen(false)
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="shadow-lg gap-2">
          <Plus className="h-5 w-5" /> Create Group
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Community</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Group Name</Label>
            <Input 
              required 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Wheelchair Basketball Fans"
            />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select 
              value={formData.category} 
              onValueChange={val => setFormData({...formData, category: val})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diagnosis">Diagnosis Support</SelectItem>
                <SelectItem value="interest">Hobbies & Interests</SelectItem>
                <SelectItem value="location">Location Based</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea 
              required
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="What is this group about?"
              className="resize-none h-32"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createGroup.isPending} className="w-full">
              {createGroup.isPending ? <Loader2 className="animate-spin mr-2" /> : "Create Group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
