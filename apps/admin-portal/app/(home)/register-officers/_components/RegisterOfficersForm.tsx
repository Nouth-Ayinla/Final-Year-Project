"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Camera } from "lucide-react";

import { RegisterOfficerSchema } from "@/lib/zodSchema";
import { useAuthStore } from "@/app/store/useAuthStore";

export default function RegisterOfficersForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { registerOfficer } = useAuthStore();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Updated to align perfectly with your Prisma schema & controller keys
  const form = useForm<z.infer<typeof RegisterOfficerSchema>>({
    resolver: zodResolver(RegisterOfficerSchema),
    defaultValues: {
      firstName: "",
      surname: "",
      otherName: "",
      email: "",
      DOB: "",
      sex: "" as any,
      maritalStatus: "" as any,
      state: "",
      LGA: "",
      education: "" as any,
      residentialAddress: "",
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

  function onSubmit(values: z.infer<typeof RegisterOfficerSchema>) {
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
        formData.append("email", values.email);
        formData.append("DOB", values.DOB);
        formData.append("sex", values.sex);
        formData.append("maritalStatus", values.maritalStatus);
        formData.append("state", values.state);
        formData.append("LGA", values.LGA);
        formData.append("education", values.education);
        formData.append("residentialAddress", values.residentialAddress);
        formData.append("profilePicture", file);

        const success = await registerOfficer(formData);

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
    <div className="w-full flex justify-center p-4">
      <Card className="w-full max-w-3xl border-border/60 shadow-sm rounded-xl">
        {/* HEADER */}
        <CardHeader className="space-y-2 text-center sm:text-left">
          <CardTitle className="text-xl sm:text-2xl">
            Register Officer
          </CardTitle>
          <CardDescription>
            Add a new election officer and grant them access to the OndoDecide
            system.
          </CardDescription>
        </CardHeader>

        {/* FORM */}
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* CIRCULAR PROFILE PICTURE INPUT */}
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

                <div className="text-center">
                  <span className="text-sm font-medium block text-muted-foreground">
                    Profile Picture <span className="text-destructive">*</span>
                  </span>
                  {!file && (
                    <p className="text-xs text-destructive mt-1 font-medium">
                      Profile picture is required
                    </p>
                  )}
                </div>
              </div>

              {/* PERSONAL INFO GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="surname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Surname (Last Name)</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="otherName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Other Name (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Middle name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="officer@email.com"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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

                {/* SEX SELECT ENUM */}
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
                          <SelectTrigger>
                            <SelectValue placeholder="Select sex" />
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

                {/* MARITAL STATUS SELECT ENUM */}
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
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
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

                {/* EDUCATION LEVEL SELECT ENUM */}
                <FormField
                  control={form.control}
                  name="education"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Education Level</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select education level" />
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

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Lagos" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="LGA"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LGA</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Ikeja" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="residentialAddress"
                  render={({ field }) => (
                    <FormItem className="col-span-1 sm:col-span-2">
                      <FormLabel>Residential Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main Street, City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* SUBMIT */}
              <Button type="submit" disabled={pending} className="w-full">
                {pending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register Officer"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
