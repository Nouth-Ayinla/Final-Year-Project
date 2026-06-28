import { RichTextEditor } from "@/components/rich-text-editor/Editor";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EditElectionSchema, electionStatus } from "@/lib/zodSchema";
import { zodResolver } from "@hookform/resolvers/zod/dist/zod.js";
import { FormProvider, useForm } from "react-hook-form";
import z from "zod";
import { Loader2, Save } from "lucide-react";
import { formatDateTimeLocal } from "@/app/lib/formatDateTimeLocal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useElectionStore } from "@/app/store/useElectionStore";

interface EditElectionFormProps {
  election: {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    status: string;
  };
}

export default function EditElectionForm({ election }: EditElectionFormProps) {
  const { EditElection, isEditingElection } = useElectionStore();

  const form = useForm<z.infer<typeof EditElectionSchema>>({
    resolver: zodResolver(EditElectionSchema),
    defaultValues: {
      title: election.title,
      description: election.description,
      startDate: formatDateTimeLocal(election.startDate),
      endDate: formatDateTimeLocal(election.endDate),
      status: election.status,
    },
  });

  const onSubmit = async (values: z.infer<typeof EditElectionSchema>) => {
    if (isEditingElection) return;

    const success = await EditElection(election.id, values);

    if (!success) return;

    form.reset(values);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Election Title</FormLabel>

              <FormControl>
                <Input placeholder="Enter election title" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>

              <FormControl>
                <div className="mt-2">
                  <RichTextEditor field={field} />
                </div>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* Dates */}
        <div className="grid gap-6 md:grid-cols-2">
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
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

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
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <div>
              <FormItem>
                <FormLabel>Election Status</FormLabel>
                <div>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {electionStatus.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <FormMessage />
              </FormItem>
            </div>
          )}
        />
        {/* Actions */}
        <div className="flex justify-end border-t pt-6">
          <Button type="submit" size="lg" disabled={isEditingElection}>
            {isEditingElection ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 size-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
