"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
import { Camera, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { CandidateSchema } from "@/lib/zodSchema";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";

export default function AddCandidateForm() {
  const { AddCandidate, isAddingCandidate, getParties, parties } = useElectionStore();
  const router = useRouter();
  const params = useParams();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    getParties();
  }, [getParties]);

  const [isPending, startTransition] = useTransition();

  const electionId = params.electionId as string;

  const form = useForm<z.infer<typeof CandidateSchema>>({
    resolver: zodResolver(CandidateSchema),
    defaultValues: {
      firstName: "",
      surname: "",
      otherName: "",
      DOB: "",
      sex: "MALE",
      maritalStatus: "SINGLE",
      state: "",
      LGA: "",
      education: "PRIMARY",
      bio: "",
      party: "APC",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);

    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
    } else {
      setPreview(null);
    }
  };

  function onSubmit(values: z.infer<typeof CandidateSchema>) {
    startTransition(async () => {
      try {
        if (!file) {
          toast.error("Profile picture is required");
          return;
        }
        const formData = new FormData();
        formData.append("firstName", values.firstName);
        formData.append("surname", values.surname);
        formData.append("otherName", values.otherName || "");
        formData.append("DOB", values.DOB);
        formData.append("sex", values.sex);
        formData.append("maritalStatus", values.maritalStatus);
        formData.append("state", values.state);
        formData.append("LGA", values.LGA);
        formData.append("education", values.education);
        formData.append("profilePicture", file);
        formData.append("bio", values.bio);
        formData.append("party", values.party);

        const success = await AddCandidate(electionId, formData);

        if (!success) return;

        form.reset();
        setFile(null);
        setPreview(null);
        router.refresh();
      } catch (error) {
        console.error("Register officer error:", error);
        toast.error("Failed to register officer");
      }
    });
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add Candidate</CardTitle>
          <CardDescription>
            Fill in the candidate's information and assign them to a political
            party.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* IMAGE UPLOAD */}
              <div className="flex flex-col items-center justify-center gap-3 mb-6">
                <label
                  htmlFor="profilePicture"
                  className="relative flex h-32 w-32 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/40 bg-muted/30 hover:bg-muted/60 hover:border-primary transition overflow-hidden group shadow-inner"
                >
                  {preview ? (
                    <>
                      <img
                        src={preview}
                        alt="Profile preview"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Camera className="h-6 w-6 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground gap-1">
                      <Camera className="h-8 w-8 stroke-[1.5]" />
                      <span className="text-xs font-medium">Upload Image</span>
                    </div>
                  )}

                  <input
                    id="profilePicture"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>

                {!file && (
                  <p className="text-xs text-destructive font-medium">
                    Profile picture is required
                  </p>
                )}
              </div>

              {/* FIRST NAME */}
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* SURNAME */}
              <FormField
                control={form.control}
                name="surname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Surname</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter surname" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* OTHER NAME */}
              <FormField
                control={form.control}
                name="otherName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* BIO */}
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biography</FormLabel>
                    <FormControl>
                      <RichTextEditor field={field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* DOB */}
              <FormField
                control={form.control}
                name="DOB"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* STATE */}
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* LGA */}
              <FormField
                control={form.control}
                name="LGA"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LGA</FormLabel>
                    <FormControl>
                      <Input placeholder="LGA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full items-start">
                {/* SEX */}
                <FormField
                  control={form.control}
                  name="sex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sex</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10 w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MALE">Male</SelectItem>
                          <SelectItem value="FEMALE">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* MARITAL STATUS */}
                <FormField
                  control={form.control}
                  name="maritalStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marital Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10 w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SINGLE">Single</SelectItem>
                          <SelectItem value="MARRIED">Married</SelectItem>
                          <SelectItem value="DIVORCED">Divorced</SelectItem>
                          <SelectItem value="WIDOWED">Widowed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* EDUCATION */}
                <FormField
                  control={form.control}
                  name="education"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Education</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10 w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PRIMARY">Primary</SelectItem>
                          <SelectItem value="SECONDARY">Secondary</SelectItem>
                          <SelectItem value="TERTIARY">Tertiary</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* PARTY */}
                <FormField
                  control={form.control}
                  name="party"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Political Party</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10 w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {parties.map((party: any) => (
                            <SelectItem key={party.id} value={party.id}>
                              {party.abbreviation} - {party.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* SUBMIT */}
              <Button
                disabled={isAddingCandidate || isPending}
                type="submit"
                className="w-full"
              >
                {isAddingCandidate || isPending ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    Adding Candidate...
                  </div>
                ) : (
                  "Add Candidate"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
