import { z } from "zod";
import { politicalParties } from "./politicalParties";

export const electionStatus = ["DRAFT", "CLOSED", "ACTIVE" , "UPCOMING"];

export const adminLoginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(5, { message: "Identifier cannot be less than 5 characters" }),

  password: z
    .string()
    .min(6, { message: "Password must not be less than 6 characters" }),
});

export const activateAdminAccountSchema = z.object({
  activationPin: z
    .string()
    .trim()
    .min(5, { message: "Activation Pin cannot be less than 5 characters" }),
  adminId: z
    .string()
    .trim()
    .min(5, { message: "adminId cannot be less than 5 characters" }),
  password: z
    .string()
    .min(6, { message: "Password must not be less than 6 characters" }),
  confirmPassword: z
    .string()
    .min(6, { message: "Confirm Password must not be less than 6 characters" }),
});


export const RegisterOfficerSchema = z.object({
  firstName: z.string().trim().min(3, {
    message: "First name must be at least 3 characters",
  }),

  surname: z.string().trim().min(3, {
    message: "Surname must be at least 3 characters",
  }),

  otherName: z.string().trim().optional(),

  email: z.string().email("Invalid email format"),

  DOB: z.string().min(1, { message: "Date of birth is required" }),

  sex: z.enum(["MALE", "FEMALE"], {
    message: "Sex must be MALE or FEMALE",
  }),

  maritalStatus: z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"]),

  state: z.string().min(2, { message: "State is required" }),

  LGA: z.string().min(2, { message: "LGA is required" }),

  education: z.enum(["PRIMARY", "SECONDARY", "TERTIARY"]),

  residentialAddress: z.string().min(5, {
    message: "Residential address is required",
  }),
});

export const RegisterVoterSchema = z.object({
  firstName: z.string().trim().min(3, {
    message: "First name must be at least 3 characters",
  }),

  surname: z.string().trim().min(3, {
    message: "Surname must be at least 3 characters",
  }),

  otherName: z.string().trim().optional(),

  email: z.string().email("Invalid email format"),

  DOB: z.string().min(1, { message: "Date of birth is required" }),

  sex: z.enum(["MALE", "FEMALE"], {
    message: "Sex must be MALE or FEMALE",
  }),

  maritalStatus: z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"]),

  state: z.string().min(2, { message: "State is required" }),

  LGA: z.string().min(2, { message: "LGA is required" }),

  education: z.enum(["PRIMARY", "SECONDARY", "TERTIARY"]),

  residentialAddress: z.string().min(5, {
    message: "Residential address is required",
  }),
});

export const CreateElectionSchema = z
  .object({
    title: z.string().trim().min(5, {
      message: "Title must be at least 5 characters",
    }),

    description: z.string().trim().min(10, {
      message: "Description must be at least 10 characters",
    }),

    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  });

export const EditElectionSchema = z
  .object({
    title: z.string().trim().min(5, {
      message: "Title must be at least 5 characters",
    }),
    status: z.enum(electionStatus, { message: "Status is required" }),
    description: z.string().trim().min(10, {
      message: "Description must be at least 10 characters",
    }),

    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  });

  export const CandidateSchema = z.object({
  firstName: z.string().trim().min(3, {
    message: "First name must be at least 3 characters",
  }),

  surname: z.string().trim().min(3, {
    message: "Surname must be at least 3 characters",
  }),

  otherName: z.string().trim().optional(),

  DOB: z.string().min(1, {
    message: "Date of birth is required",
  }),

  sex: z.enum(["MALE", "FEMALE"], {
    message: "Sex must be MALE or FEMALE",
  }),

  maritalStatus: z.enum([
    "SINGLE",
    "MARRIED",
    "DIVORCED",
    "WIDOWED",
  ]),

  state: z.string().min(2, {
    message: "State is required",
  }),

  LGA: z.string().min(2, {
    message: "LGA is required",
  }),

  education: z.enum([
    "PRIMARY",
    "SECONDARY",
    "TERTIARY",
  ]),

  bio: z.string().min(5, {
    message: "Bio is required",
  }),

  party: z.string().min(1, {
    message: "Please select a political party",
  }),
});


export type CandidateSchemaType = z.infer<typeof CandidateSchema>;
export type adminLoginSchemaType = z.infer<typeof adminLoginSchema>;
export type RegisterOfficerSchemaType = z.infer<typeof RegisterOfficerSchema>;
export type RegisterVoterSchemaType = z.infer<typeof RegisterVoterSchema>;
export type CreateElectionSchemaType = z.infer<typeof CreateElectionSchema>;
export type activateAdminAccountSchemaType = z.infer<
  typeof activateAdminAccountSchema
>;