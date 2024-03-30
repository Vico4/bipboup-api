import { z } from "zod";

const containsUppercase = (ch: string) => /[A-Z]/.test(ch);
const containsLowercase = (ch: string) => /[a-z]/.test(ch);
const containsSpecialChar = (ch: string) =>
  /[`!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?~ ]/.test(ch);

const pwRequirement =
  "your password must be at least 8 characters long, contain uppercase, lowercase and special characters";

export const userCreationSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: `password too short, ${pwRequirement}` })
    .refine(
      (pw) =>
        containsUppercase(pw) &&
        containsLowercase(pw) &&
        containsSpecialChar(pw),
      { message: `password too simple, ${pwRequirement}` },
    ),
  name: z.string().max(24, {
    message: "waouh, that's a long derby name ! Mind using a shorter one ?",
  }),
});
