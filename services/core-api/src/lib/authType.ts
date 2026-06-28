import { Request } from "express";

export interface AuthUser {
  id: string;
  role: "SUPER_ADMIN" | "ELECTION_ADMIN" | "REGISTRATION_OFFICER" | "MONITORING_OFFICER" | "RESULTS_OFFICER" | "VOTER";
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}