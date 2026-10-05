import { z } from "zod";

export const createInvitationSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .transform((email) => email.toLowerCase()),
});

export const acceptInvitationSchema = z.object({
  token: z.string().min(1),
});
