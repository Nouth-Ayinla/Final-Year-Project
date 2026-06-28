"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { RichTextEditor } from "@/components/rich-text-editor/Editor";

import { useElectionStore } from "@/app/store/useElectionStore";
import AdminGuard from "@/components/guard/AdminGuard";
import Link from "next/link";

// Aligned with AddCandidateForm's structure
const EditCandidateSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  surname: z.string().min(1, "Surname is required"),
  otherName: z.string().optional(),
  bio: z.string().optional(),
  DOB: z.string().min(1, "Date of birth is required"),
  state: z.string().min(1, "State is required"),
  LGA: z.string().min(1, "LGA is required"),
  sex: z.string(),
  maritalStatus: z.string(),
  education: z.string(),
  party: z.string(),
});

export default function EditCandidatePage() {
  const params = useParams();
  const router = useRouter();

  const electionId = params.electionId as string;
  const candidateId = params.candidateId as string;

  const {
    GetCandidateById,
    EditCandidate,
    isEditingCandidate,
    candidate,
    isGettingCandidate,
    getParties,
    parties,
  } = useElectionStore();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof EditCandidateSchema>>({
    resolver: zodResolver(EditCandidateSchema),
    defaultValues: {
      firstName: "",
      surname: "",
      otherName: "",
      bio: "",
      DOB: "",
      state: "",
      LGA: "",
      sex: "MALE",
      maritalStatus: "SINGLE",
      education: "PRIMARY",
      party: "APC",
    },
  });

  /**
   * Fetch candidate details on mount
   */
  useEffect(() => {
    getParties();
    if (candidateId) {
      GetCandidateById(candidateId);
    }
  }, [candidateId, GetCandidateById, getParties]);

  /**
   * Populate form when candidate data loads
   */
  useEffect(() => {
    if (candidate) {
      form.reset({
        firstName: candidate.firstName ?? "",
        surname: candidate.surname ?? "",
        otherName: candidate.otherName ?? "",
        bio: candidate.bio ?? "",
        DOB: candidate.DOB
          ? new Date(candidate.DOB).toISOString().split("T")[0]
          : "",
        state: candidate.state ?? "",
        LGA: candidate.LGA ?? "",
        sex: candidate.sex ?? "MALE",
        maritalStatus: candidate.maritalStatus ?? "SINGLE",
        education: candidate.education ?? "PRIMARY",
        party:
          typeof candidate.party === "object"
            ? (candidate.party?.id ?? "")
            : (candidate.party ?? ""),
      });

      setPreview(candidate.imageUrl ?? null);
    }
  }, [candidate, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);

    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
    } else {
      setPreview(candidate?.imageUrl || null);
    }
  };

  const onSubmit = (values: z.infer<typeof EditCandidateSchema>) => {
    startTransition(async () => {
      try {
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
        formData.append("bio", values.bio || "");
        formData.append("party", values.party);

        if (file) {
          formData.append("profilePicture", file);
        }

        const success = await EditCandidate(candidateId, formData);

        if (success) {
          router.push(`/election/${electionId}/edit`);
          router.refresh();
        }
      } catch (error) {
        console.error("Error updating candidate:", error);
        toast.error("Failed to update candidate details");
      }
    });
  };

  return (
    <AdminGuard>
      <div className="w-full max-w-2xl mx-auto">
        <div className="mb-3">
          <Link
            href={`/election/${electionId}/edit`}
            className={buttonVariants({
              variant: "outline",
            })}
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to Editing Elections
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Edit Candidate</CardTitle>
            <CardDescription>
              Update candidate details. Existing values are loaded from the
              database.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isGettingCandidate ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="size-5 animate-spin text-primary" />
              </div>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* IMAGE UPLOAD & PREVIEW */}
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
                          <span className="text-xs font-medium">
                            Upload Image
                          </span>
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

                  {/* ADVANCED SELECT LAYOUT SECTION */}
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
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-10 w-full">
                                <SelectValue placeholder="Select Sex" />
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
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-10 w-full">
                                <SelectValue placeholder="Select Status" />
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
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-10 w-full">
                                <SelectValue placeholder="Select Level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="PRIMARY">Primary</SelectItem>
                              <SelectItem value="SECONDARY">
                                Secondary
                              </SelectItem>
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
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-10 w-full">
                                <SelectValue placeholder="Select Party" />
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

                  {/* SUBMIT BUTTON */}
                  <Button
                    disabled={isPending || isEditingCandidate}
                    type="submit"
                    className="w-full"
                  >
                    {isPending || isEditingCandidate ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="size-4 animate-spin" />
                        Updating Candidate...
                      </div>
                    ) : (
                      "Update Candidate"
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  );
}
