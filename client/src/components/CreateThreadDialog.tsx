import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PlusCircle } from "lucide-react";
import type { ForumCategory } from "@shared/schema";

const schema = z.object({
  categorySlug: z.string().min(1, "Please select a category"),
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  body: z.string().min(20, "Please write at least 20 characters"),
  isAdviceRequest: z.boolean().default(false),
  tags: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface CreateThreadDialogProps {
  categories: ForumCategory[];
  defaultCategorySlug?: string;
}

export function CreateThreadDialog({ categories, defaultCategorySlug }: CreateThreadDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      categorySlug: defaultCategorySlug || "",
      title: "",
      body: "",
      isAdviceRequest: false,
      tags: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const tags = values.tags
        ? values.tags.split(",").map(t => t.trim()).filter(Boolean)
        : [];
      return apiRequest("POST", `/api/forums/categories/${values.categorySlug}/threads`, {
        title: values.title,
        body: values.body,
        isAdviceRequest: values.isAdviceRequest,
        tags,
      });
    },
    onSuccess: (_, values) => {
      queryClient.invalidateQueries({ queryKey: ["/api/forums/categories"] });
      queryClient.invalidateQueries({ queryKey: [`/api/forums/categories/${values.categorySlug}/threads`] });
      toast({ title: "Thread created!", description: "Your thread is now live." });
      form.reset();
      setOpen(false);
    },
    onError: () => toast({ title: "Failed to create thread", variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-[#1B4B8A] hover:bg-[#163d75] text-white text-[12px] h-8 px-3 gap-1"
          data-testid="button-create-thread"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          New Thread
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[#1B4B8A]">Start a New Thread</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(v => mutation.mutate(v))} className="space-y-3">
            <FormField
              control={form.control}
              name="categorySlug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12px]">Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-8 text-[12px]" data-testid="select-thread-category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.slug} value={cat.slug} className="text-[12px]">
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12px]">Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="What is your thread about?" className="h-8 text-[12px]" data-testid="input-thread-title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12px]">Body</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Share your thoughts, question, or experience..." rows={5} className="text-[12px]" data-testid="input-thread-body" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12px]">Tags <span className="text-gray-400 font-normal">(comma-separated, optional)</span></FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. ndis, anxiety, pain" className="h-8 text-[12px]" data-testid="input-thread-tags" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isAdviceRequest"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={e => field.onChange(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-[#1B4B8A]"
                      data-testid="checkbox-advice-request"
                      id="advice-request"
                    />
                  </FormControl>
                  <FormLabel htmlFor="advice-request" className="text-[12px] cursor-pointer font-normal">
                    This is an Advice Request — community members can mark their best reply as the accepted answer
                  </FormLabel>
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" className="h-8 text-[12px]" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="bg-[#1B4B8A] hover:bg-[#163d75] text-white h-8 text-[12px]"
                data-testid="button-submit-thread"
              >
                {mutation.isPending ? "Posting…" : "Post Thread"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
