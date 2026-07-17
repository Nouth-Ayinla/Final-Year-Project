import { z } from "zod";

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
  ward: z.string().min(1, { message: "Ward is required" }),
  education: z.enum(["PRIMARY", "SECONDARY", "TERTIARY"]),
  residentialAddress: z.string().min(5, {
    message: "Residential address is required",
  }),
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
  role: z.enum(["SUPER_ADMIN", "ELECTION_ADMIN", "REGISTRATION_OFFICER", "MONITORING_OFFICER", "RESULTS_OFFICER"]).optional(),
});

export const adminLoginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(5, { message: "Identifier cannot be less than 5 characters" }),
  password: z
    .string()
    .min(6, { message: "Password must not be less than 6 characters" }),
});

export const CreateWardSchema = z.object({
  name: z.string().trim().min(2, {
    message: "Ward name must be at least 2 characters",
  }),
  code: z.string().trim().min(2, {
    message: "Ward code must be at least 2 characters",
  }),
  lgaName: z.string().trim().min(2, {
    message: "Local Government Area is required",
  }),
});
