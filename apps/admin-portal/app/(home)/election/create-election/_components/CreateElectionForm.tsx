"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { CreateElectionSchema } from "@/lib/zodSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/rich-text-editor/Editor";
import { useElectionStore } from "@/app/store/useElectionStore";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateElectionForm() {
  const { createElection, isCreatingElection } = useElectionStore();
  const router = useRouter();
  const form = useForm<z.infer<typeof CreateElectionSchema>>({
    resolver: zodResolver(CreateElectionSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: "",
      endDate: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof CreateElectionSchema>) => {
    try {
      const success = await createElection(values);

      if (success) {
        router.push("/election");
        form.reset();
      }
    } catch (error) {
      console.error("Error creating election:", error);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create Election</CardTitle>
          <CardDescription>
            Create a new election by filling in the details below. Make sure the
            dates are valid and the title is unique.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* TITLE */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Election Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter election title"
                        {...field}
                        className="mt-1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* DESCRIPTION (Rich Text) */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <div className="w-full mt-1">
                        <RichTextEditor field={field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* START DATE */}
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        value={field.value || ""}
                        onChange={field.onChange}
                        className="mt-1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* END DATE */}
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        value={field.value || ""}
                        onChange={field.onChange}
                        className="mt-1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* SUBMIT */}
              <Button
                disabled={isCreatingElection}
                type="submit"
                className="w-full"
              >
                {isCreatingElection ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin size-4" />
                    Creating Election...
                  </div>
                ) : (
                  "Create Election"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
