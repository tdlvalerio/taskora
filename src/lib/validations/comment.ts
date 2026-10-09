import { z } from "zod";

export const createCommentSchema = z.strictObject({
  body: z
    .string("Write a comment first.")
    .trim()
    .min(1, "Write a comment first.")
    .max(2000, "Comments can be at most 2000 characters."),
});
