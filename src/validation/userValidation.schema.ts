import { z } from "zod";

const pwRequirement =
  "your password must be at least 8 characters long";

export const userCreationSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: `password too short, ${pwRequirement}` }),
  derbyName: z.string().max(24, {
    message: "waouh, that's a long derby name ! Mind using a shorter one ?",
  }),
});

export const userEditionSchema = z
  .object({
    email: z.string().email().optional(),
    derbyName: z
      .string()
      .max(24, {
        message: "waouh, that's a long derby name ! Mind using a shorter one ?",
      })
      .optional(),
  })
  .refine((body) => body.email || body.derbyName, {
    message: "humm... looks like you have nothing to update -_(^^)_-",
  });

export const manageAdminValidation = z.object({
  isAdmin: z.boolean(),
});
